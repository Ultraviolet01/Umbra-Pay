"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePublicClient } from "wagmi";
import { type Abi, type Log } from "viem";

type EventLog = Log & {
  args: Record<string, any>;
  eventName: string;
};

// ── localStorage cache ──────────────────────────────────────────────────

interface CachedData {
  lastBlock: string;
  events: SerializedEvent[];
}

interface SerializedEvent {
  transactionHash: string;
  logIndex: number;
  blockNumber: string;
  args: Record<string, any>;
  eventName: string;
  address: string;
}

function cacheKey(address: string): string {
  return `umbra_allevents_${address}`.toLowerCase();
}

function loadCache(address: string): CachedData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(address));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(address: string, events: EventLog[], lastBlock: bigint) {
  if (typeof window === "undefined") return;
  try {
    const data: CachedData = {
      lastBlock: lastBlock.toString(),
      events: events.slice(0, 200).map((e) => ({
        transactionHash: (e.transactionHash as string) ?? "",
        logIndex: Number(e.logIndex ?? 0),
        blockNumber: (e.blockNumber ?? BigInt(0)).toString(),
        args: e.args,
        eventName: e.eventName,
        address: (e.address as string) ?? "",
      })),
    };
    localStorage.setItem(cacheKey(address), JSON.stringify(data));
  } catch {}
}

function deserializeEvents(cached: SerializedEvent[]): EventLog[] {
  return cached.map((e) => ({
    transactionHash: e.transactionHash as `0x${string}`,
    logIndex: BigInt(e.logIndex),
    blockNumber: BigInt(e.blockNumber),
    args: e.args,
    eventName: e.eventName,
    address: e.address as `0x${string}`,
    blockHash: null,
    data: "0x",
    removed: false,
    topics: [],
    transactionIndex: null,
  })) as unknown as EventLog[];
}

function dedup(allEvents: EventLog[]): EventLog[] {
  const seen = new Set<string>();
  return allEvents
    .filter((e) => {
      const key = `${e.transactionHash}-${e.logIndex}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) =>
      Number((b.blockNumber ?? BigInt(0)) - (a.blockNumber ?? BigInt(0)))
    );
}

// ── Shared fetch: ONE RPC call per contract address ─────────────────────
// Multiple hooks using the same address share one fetch instead of each
// making their own call.

interface SharedFetch {
  promise: Promise<void>;
  allEvents: EventLog[];
  lastBlock: bigint;
  done: boolean;
}

const activeFetches = new Map<string, SharedFetch>();

async function fetchAllEventsForContract(
  publicClient: any,
  address: `0x${string}`,
  abi: Abi
): Promise<SharedFetch> {
  const key = address.toLowerCase();

  // If another hook already started fetching for this address, reuse it
  if (activeFetches.has(key)) {
    const existing = activeFetches.get(key)!;
    await existing.promise;
    return existing;
  }

  const shared: SharedFetch = {
    promise: null as any,
    allEvents: [],
    lastBlock: BigInt(0),
    done: false,
  };

  shared.promise = (async () => {
    try {
      const currentBlock = await publicClient.getBlockNumber();
      shared.lastBlock = currentBlock;

      const cached = loadCache(address);
      const cachedEvents = cached ? deserializeEvents(cached.events) : [];
      const lastCachedBlock = cached ? BigInt(cached.lastBlock) : null;

      // Only fetch new blocks since cache
      const fromBlock = lastCachedBlock
        ? lastCachedBlock + BigInt(1)
        : currentBlock > BigInt(10000)
          ? currentBlock - BigInt(10000)
          : BigInt(0);

      let newLogs: EventLog[] = [];
      if (fromBlock <= currentBlock) {
        // ONE call — no eventName filter = gets ALL events from this contract
        try {
          const logs = await publicClient.getContractEvents({
            address,
            abi,
            fromBlock,
          });
          newLogs = logs as unknown as EventLog[];
        } catch {
          // Retry once after 2s
          await new Promise((r) => setTimeout(r, 2000));
          try {
            const logs = await publicClient.getContractEvents({
              address,
              abi,
              fromBlock,
            });
            newLogs = logs as unknown as EventLog[];
          } catch {
            // Both failed — use cached only
          }
        }
      }

      shared.allEvents = dedup([...cachedEvents, ...newLogs]);
      saveCache(address, shared.allEvents, currentBlock);
      shared.done = true;
    } catch {
      // getBlockNumber failed — use cache
      const cached = loadCache(address);
      if (cached) {
        shared.allEvents = deserializeEvents(cached.events);
        shared.lastBlock = BigInt(cached.lastBlock);
      }
      shared.done = true;
    }
  })();

  activeFetches.set(key, shared);

  // Clean up after fetch completes
  shared.promise.then(() => {
    setTimeout(() => activeFetches.delete(key), 100);
  });

  await shared.promise;
  return shared;
}

// ── Public hook ─────────────────────────────────────────────────────────

export function useContractEvents({
  address,
  abi,
  eventName,
  args,
  enabled = true,
}: {
  address?: `0x${string}`;
  abi: Abi;
  eventName: string;
  args?: Record<string, any>;
  enabled?: boolean;
}) {
  const publicClient = usePublicClient();
  const [allEvents, setAllEvents] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const latestBlockRef = useRef<bigint | null>(null);

  // Load cache immediately for instant UI
  useEffect(() => {
    if (!address || !enabled) return;
    const cached = loadCache(address);
    if (cached && cached.events.length > 0) {
      setAllEvents(deserializeEvents(cached.events));
    }
  }, [address, enabled]);

  // Shared fetch — all hooks for the same address share ONE RPC call
  useEffect(() => {
    if (!publicClient || !address || !enabled) return;

    let cancelled = false;
    setIsLoading(true);

    fetchAllEventsForContract(publicClient, address, abi).then((shared) => {
      if (cancelled) return;
      setAllEvents(shared.allEvents);
      latestBlockRef.current = shared.lastBlock;
      setIsLoading(false);
    });

    // Watch for live events going forward
    const unwatch = publicClient.watchContractEvent({
      address,
      abi,
      eventName,
      args,
      onLogs: (logs) => {
        if (cancelled) return;
        const newLogs = logs as unknown as EventLog[];
        setAllEvents((prev) => {
          const merged = dedup([...newLogs, ...prev]);
          const maxBlock = newLogs.reduce(
            (max, e) => ((e.blockNumber ?? BigInt(0)) > max ? (e.blockNumber ?? BigInt(0)) : max),
            latestBlockRef.current ?? BigInt(0)
          );
          latestBlockRef.current = maxBlock;
          saveCache(address, merged, maxBlock);
          return merged;
        });
      },
    });

    return () => {
      cancelled = true;
      unwatch();
    };
  }, [publicClient, address, abi, eventName, args, enabled]);

  // Filter by eventName (and optionally args) from the shared event pool
  const events = allEvents.filter((e) => {
    if (e.eventName !== eventName) return false;
    if (args) {
      for (const [key, value] of Object.entries(args)) {
        const eventVal = e.args?.[key];
        if (typeof value === "string" && typeof eventVal === "string") {
          if (value.toLowerCase() !== eventVal.toLowerCase()) return false;
        } else if (eventVal !== value) {
          return false;
        }
      }
    }
    return true;
  });

  // Manual refetch
  const refetch = useCallback(async () => {
    if (!publicClient || !address || !enabled) return;

    setIsLoading(true);
    try {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlockRef.current
        ? latestBlockRef.current - BigInt(5)
        : currentBlock - BigInt(50);

      const logs = await publicClient.getContractEvents({
        address, abi, fromBlock,
      });

      const newLogs = logs as unknown as EventLog[];
      setAllEvents((prev) => {
        const merged = dedup([...newLogs, ...prev]);
        saveCache(address, merged, currentBlock);
        return merged;
      });
      latestBlockRef.current = currentBlock;
    } catch {
      // Failed — keep existing
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address, abi, enabled]);

  return { events, isLoading, refetch };
}
