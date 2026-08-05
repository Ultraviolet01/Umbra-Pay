"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";

interface RunPayrollCardProps {
  onExecute: () => void;
  activeCount: number;
  contractBalance?: bigint;
  orgAddress?: `0x${string}`;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

export function RunPayrollCard({
  onExecute,
  activeCount,
  contractBalance,
  orgAddress,
  tokenSymbol = "ETH",
  tokenDecimals = 18,
}: RunPayrollCardProps) {
  const ethPrice = useEthPrice();
  const hasEmployees = activeCount > 0;

  const [totalRevealed, setTotalRevealed] = useState(false);
  const [totalDecrypting, setTotalDecrypting] = useState(false);
  const [totalCost, setTotalCost] = useState<string | null>(null);

  const handleRevealTotal = async () => {
    if (totalRevealed) {
      setTotalRevealed(false);
      setTotalCost(null);
      return;
    }

    setTotalDecrypting(true);

    try {
      const res = await fetch("/api/enclave?action=solvency&orgAddress=" + (orgAddress || ""));
      const data = await res.json();
      if (data && data.totalPayrollCostEth) {
        setTotalCost(data.totalPayrollCostEth);
        setTotalRevealed(true);
      }
    } catch (err) {
      console.error("[RunPayrollCard] TEE Query error:", err);
    } finally {
      setTotalDecrypting(false);
    }
  };

  return (
    <div className="accent-card overflow-hidden">
      <div className="relative p-4 sm:p-6">
        <div className="relative mb-5">
          <div className="relative inline-flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
              <Zap className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-8px]"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-60" />
            </motion.div>
            <div className="absolute inset-[-8px] rounded-full border border-dashed border-[var(--border-accent)] opacity-40" />
          </div>
        </div>

        <h3
          className="font-bold text-base sm:text-lg mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Run Payroll
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-3 sm:mb-5">
          Execute confidential TEE batch payment
        </p>

        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
          <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">Active employees</span>
            <span className="font-medium font-mono text-sm">{activeCount}</span>
          </div>

          <AnimatePresence mode="wait">
            {totalRevealed && totalCost ? (
              <motion.button
                key="revealed"
                onClick={handleRevealTotal}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full rounded-xl border border-[var(--border-accent)] bg-[rgba(0,229,160,0.04)] p-3 text-left group transition-colors hover:bg-[rgba(0,229,160,0.06)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Total Payroll Cost (TEE Attested)
                  </span>
                  <EyeOff className="h-3 w-3 text-[var(--text-muted)]" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-xl font-bold font-mono text-[var(--accent)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {totalCost}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{tokenSymbol}</span>
                  {ethPrice && parseFloat(totalCost) > 0 && (
                    <span className="text-[10px] text-[var(--text-muted)] ml-1">
                      (~{formatUsd(parseFloat(totalCost) * ethPrice)})
                    </span>
                  )}
                </div>
              </motion.button>
            ) : (
              <motion.button
                key="encrypted"
                onClick={handleRevealTotal}
                disabled={totalDecrypting}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full rounded-xl border border-dashed border-[var(--border-accent)] bg-[rgba(0,229,160,0.02)] p-3 transition-all hover:bg-[rgba(0,229,160,0.05)] hover:border-[var(--accent)] disabled:opacity-50 group"
              >
                {totalDecrypting ? (
                  <div className="flex items-center justify-center gap-2 py-1">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                    <span className="text-xs font-medium text-[var(--accent)]">
                      Querying TEE Attestation...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Total Payroll Cost
                      </span>
                      <Lock className="h-3 w-3 text-[var(--text-muted)]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[...Array(6)].map((_, j) => (
                          <span
                            key={j}
                            className="inline-block h-4 w-2 rounded-sm bg-[var(--accent)] opacity-20 group-hover:opacity-30 transition-opacity"
                          />
                        ))}
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]">
                        <Eye className="h-3.5 w-3.5" />
                        Attest
                      </span>
                    </div>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">Security</span>
            <span className="text-xs font-semibold font-mono text-[var(--accent)] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Flare TEE (FCC)
            </span>
          </div>
        </div>

        <button
          onClick={onExecute}
          disabled={!hasEmployees}
          className="btn-primary w-full !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          {!hasEmployees ? "No Employees" : "Execute Payroll"}
        </button>
      </div>
    </div>
  );
}
