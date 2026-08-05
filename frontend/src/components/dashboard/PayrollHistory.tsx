"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, ExternalLink, Loader2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { formatUnits } from "viem";
import { useContractEvents } from "@/hooks/useContractEvents";
import { UMBRA_ORG_ABI } from "@/lib/contracts";
import { PayslipModal } from "@/components/shared/PayslipModal";
import { ExportHistory } from "@/components/shared/ExportHistory";

const COSTON2_EXPLORER_URL = "https://coston2-explorer.flare.network/tx";
const SEPOLIA_EXPLORER_URL = "https://sepolia.etherscan.io/tx";

interface PayrollHistoryProps {
  orgAddress?: `0x${string}`;
  orgName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

interface LocalDeposit {
  txHash: string;
  amountEth: string;
  timestamp: number;
}

export function PayrollHistory({
  orgAddress,
  orgName = "Organization",
  tokenSymbol = "ETH",
  tokenDecimals = 18,
}: PayrollHistoryProps) {
  const [receiptEvent, setReceiptEvent] = useState<{
    txHash: string;
    blockNumber: bigint;
    employeeCount: number;
  } | null>(null);

  const [localDeposits, setLocalDeposits] = useState<LocalDeposit[]>([]);

  const { events: payrollEvents, isLoading: loadingPayroll } = useContractEvents({
    address: orgAddress,
    abi: UMBRA_ORG_ABI as any,
    eventName: "PayrollExecuted",
    enabled: !!orgAddress,
  });

  const { events: depositEvents, isLoading: loadingDeposits } = useContractEvents({
    address: orgAddress,
    abi: UMBRA_ORG_ABI as any,
    eventName: "Deposit",
    enabled: !!orgAddress,
  });

  const loadLocalDeposits = () => {
    if (typeof window === "undefined") return;
    try {
      const allDeposits: LocalDeposit[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.toLowerCase().startsWith("drippay_deposits_")) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              allDeposits.push(...list);
            }
          }
        }
      }
      const uniqueMap = new Map<string, LocalDeposit>();
      for (const d of allDeposits) {
        if (d.txHash && !uniqueMap.has(d.txHash.toLowerCase())) {
          uniqueMap.set(d.txHash.toLowerCase(), d);
        }
      }
      setLocalDeposits(Array.from(uniqueMap.values()));
    } catch (e) {
      console.error("Failed to load local deposits", e);
    }
  };

  useEffect(() => {
    loadLocalDeposits();
    window.addEventListener("drippay_deposit_added", loadLocalDeposits);
    return () => window.removeEventListener("drippay_deposit_added", loadLocalDeposits);
  }, [orgAddress]);

  // Merge contract events & local deposits, sorted newest first
  const allEvents = [
    ...payrollEvents.map((e) => ({
      _type: "payroll" as const,
      blockNumber: e.blockNumber ?? BigInt(0),
      txHash: (e.transactionHash as string) || "",
      label: "Payroll Executed",
      details: `${(e.args as any)?.employeeCount?.toString() ?? "?"} employees`,
      explorerUrl: `${COSTON2_EXPLORER_URL}/${e.transactionHash}`,
      isPayroll: true,
      rawEvent: e,
    })),
    ...depositEvents.map((e) => ({
      _type: "deposit" as const,
      blockNumber: e.blockNumber ?? BigInt(0),
      txHash: (e.transactionHash as string) || "",
      label: "Deposit (Coston2)",
      details: `${formatUnits((e.args as any)?.amount ?? BigInt(0), tokenDecimals)} ${tokenSymbol}`,
      explorerUrl: `${COSTON2_EXPLORER_URL}/${e.transactionHash}`,
      isPayroll: false,
    })),
    ...localDeposits.map((d, i) => ({
      _type: "local_deposit" as const,
      blockNumber: BigInt(99999999 - i),
      txHash: d.txHash,
      label: "Deposit (TEE Vault)",
      details: `${d.amountEth} ${tokenSymbol}`,
      explorerUrl: `${SEPOLIA_EXPLORER_URL}/${d.txHash}`,
      isPayroll: false,
    })),
  ].sort((a, b) => Number(b.blockNumber - a.blockNumber));

  const isLoading = loadingPayroll || loadingDeposits;
  const [expanded, setExpanded] = useState(false);

  const exportEvents = allEvents.map((evt) => ({
    type: evt.label,
    details: evt.details,
    txHash: evt.txHash,
    blockNumber: evt.blockNumber.toString(),
    etherscanLink: evt.explorerUrl,
  }));

  const COLLAPSED_COUNT = 5;
  const visibleEvents = expanded ? allEvents : allEvents.slice(0, COLLAPSED_COUNT);
  const hasMore = allEvents.length > COLLAPSED_COUNT;

  return (
    <div className="glass-card overflow-hidden !hover:transform-none">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 sm:px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)] shrink-0">
            <Clock className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <h3
            className="font-bold text-sm"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Activity History
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportHistory
            events={exportEvents}
            orgName={orgName}
            tokenSymbol={tokenSymbol}
            mode="employer"
          />
          <span className="text-xs text-[var(--text-muted)]">
            {allEvents.length} events
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-2">
        {isLoading ? (
          <div className="py-6 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Loading activity...</p>
          </div>
        ) : allEvents.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-[var(--text-muted)]">No activity yet</p>
          </div>
        ) : (
          <>
            {visibleEvents.map((evt, i) => {
              const shortHash = evt.txHash
                ? `${evt.txHash.slice(0, 6)}...${evt.txHash.slice(-4)}`
                : "";

              return (
                <motion.div
                  key={`${evt.txHash}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between gap-2 rounded-xl bg-[rgba(255,255,255,0.02)] px-3 sm:px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="relative flex flex-col items-center shrink-0">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          evt.isPayroll ? "bg-[var(--accent)]" : "bg-blue-400"
                        } opacity-60`}
                      />
                      {i < visibleEvents.length - 1 && (
                        <div className="absolute top-3 h-6 w-px bg-[var(--border)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium">
                        {evt.label}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[var(--text-muted)] truncate">
                        {evt.details}
                        {evt.txHash && (
                          <>
                            {" · "}
                            <a
                              href={evt.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                            >
                              {shortHash}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {evt.isPayroll && evt.txHash && evt._type === "payroll" && (
                      <button
                        onClick={() =>
                          setReceiptEvent({
                            txHash: evt.txHash,
                            blockNumber: evt.blockNumber,
                            employeeCount: Number((evt.rawEvent.args as any)?.employeeCount ?? 0),
                          })
                        }
                        className="flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] px-2 py-0.5 text-[10px] sm:text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--border-accent)] transition-colors"
                        title="View receipt"
                      >
                        <FileText className="h-3 w-3" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(0,229,160,0.08)] px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-[var(--accent)]">
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Confirmed</span>
                      <span className="sm:hidden">OK</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] hover:bg-[rgba(255,255,255,0.02)]"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Show all ({allEvents.length})
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Receipt modal */}
      <AnimatePresence>
        {receiptEvent && orgAddress && (
          <PayslipModal
            onClose={() => setReceiptEvent(null)}
            orgAddress={orgAddress}
            orgName={orgName}
            txHash={receiptEvent.txHash}
            blockNumber={receiptEvent.blockNumber}
            tokenSymbol={tokenSymbol}
            tokenDecimals={tokenDecimals}
            mode="employer"
            employeeCount={receiptEvent.employeeCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
