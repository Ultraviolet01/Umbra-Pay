"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { formatUnits } from "viem";
import { AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useContractEvents } from "@/hooks/useContractEvents";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import { PayslipModal } from "@/components/shared/PayslipModal";
import { ExportHistory } from "@/components/shared/ExportHistory";

const ETHERSCAN_URL = "https://sepolia.etherscan.io/tx";

interface TransactionHistoryProps {
  orgAddress?: `0x${string}`;
  orgName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

export function TransactionHistory({
  orgAddress,
  orgName = "Organization",
  tokenSymbol = "ETH",
  tokenDecimals = 18,
}: TransactionHistoryProps) {
  const { address } = useAccount();
  const [payslipEvent, setPayslipEvent] = useState<{
    txHash: string;
    blockNumber: bigint;
    employeeCount: number;
  } | null>(null);

  const [enclaveActivity, setEnclaveActivity] = useState<{
    deposits: Array<{ txHash?: string; amountEth: string; timestamp: number }>;
    withdrawals: Array<{ txHash?: string; employeeAddress: string; amountEth: string; timestamp: number }>;
    payrollHistory: Array<{ runId: number; executedCostEth: string; employeeCount: number; timestamp: number }>;
  }>({ deposits: [], withdrawals: [], payrollHistory: [] });

  useEffect(() => {
    async function fetchEnclaveActivity() {
      try {
        const res = await fetch(`/api/enclave?action=activity&orgAddress=${orgAddress || ""}`);
        const data = await res.json();
        if (data && data.success) {
          setEnclaveActivity({
            deposits: data.deposits || [],
            withdrawals: data.withdrawals || [],
            payrollHistory: data.payrollHistory || [],
          });
        }
      } catch (e) {
        console.error("Failed to fetch enclave activity for employee", e);
      }
    }
    fetchEnclaveActivity();
    const interval = setInterval(fetchEnclaveActivity, 4000);
    return () => clearInterval(interval);
  }, [orgAddress]);

  const { events: withdrawalEvents, isLoading: loadingWithdrawals } =
    useContractEvents({
      address: orgAddress,
      abi: ORGANIZATION_ABI as any,
      eventName: "Withdrawal",
      args: address ? { employee: address } : undefined,
      enabled: !!orgAddress && !!address,
    });

  const { events: payrollEvents, isLoading: loadingPayroll } =
    useContractEvents({
      address: orgAddress,
      abi: ORGANIZATION_ABI as any,
      eventName: "PayrollExecuted",
      enabled: !!orgAddress,
    });

  // Enclave items for this employee
  const myAddress = (address || "").toLowerCase();
  const enclaveWithdrawals = enclaveActivity.withdrawals
    .filter((w) => !myAddress || w.employeeAddress.toLowerCase() === myAddress)
    .map((w, i) => ({
      _type: "withdrawal" as const,
      blockNumber: BigInt(99999000 - i),
      transactionHash: w.txHash || "",
      args: { amount: formatUnits(BigInt(0), 18) }, // mock for viem compatibility
      isEnclave: true,
      amountEth: w.amountEth,
    }));

  const enclavePayrollRuns = enclaveActivity.payrollHistory.map((p, i) => ({
    _type: "payroll" as const,
    blockNumber: BigInt(99998000 - i),
    transactionHash: `run-${p.runId}`,
    args: { employeeCount: p.employeeCount },
    isEnclave: true,
    amountEth: p.executedCostEth,
  }));

  // Merge and sort by block number (newest first)
  const allEvents = [
    ...enclaveWithdrawals,
    ...enclavePayrollRuns,
    ...withdrawalEvents.map((e) => ({ ...e, _type: "withdrawal" as const, isEnclave: false, amountEth: undefined })),
    ...payrollEvents.map((e) => ({ ...e, _type: "payroll" as const, isEnclave: false, amountEth: undefined })),
  ].sort((a, b) =>
    Number((b.blockNumber ?? BigInt(0)) - (a.blockNumber ?? BigInt(0))),
  );

  const isLoading = loadingWithdrawals || loadingPayroll;
  const [expanded, setExpanded] = useState(false);

  const exportEvents = allEvents.map((evt) => {
    const isWithdrawal = evt._type === "withdrawal";
    const args = evt.args as Record<string, any>;
    const txHash = (evt.transactionHash as string) || "";
    return {
      type: isWithdrawal ? "Withdrawal" : "Payroll Credit",
      details: isWithdrawal
        ? `-${formatUnits(args.amount ?? BigInt(0), tokenDecimals)} ${tokenSymbol}`
        : `${args.employeeCount?.toString() ?? "?"} employees paid`,
      txHash,
      blockNumber: (evt.blockNumber ?? BigInt(0)).toString(),
      etherscanLink: txHash ? `${ETHERSCAN_URL}/${txHash}` : "",
    };
  });
  const COLLAPSED_COUNT = 5;
  const visibleEvents = expanded
    ? allEvents
    : allEvents.slice(0, COLLAPSED_COUNT);
  const hasMore = allEvents.length > COLLAPSED_COUNT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="glass-card overflow-hidden !hover:transform-none"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 sm:p-5 py-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
          <h2
            className="text-base sm:text-lg font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Transaction History
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportHistory
            events={exportEvents}
            orgName={orgName}
            tokenSymbol={tokenSymbol}
            mode="employee"
          />
          <span className="text-xs text-[var(--text-muted)]">
            {allEvents.length} transactions
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-2">
        {isLoading ? (
          <div className="py-6 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">
              Loading transactions...
            </p>
          </div>
        ) : allEvents.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              No transactions yet
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Payroll credits and withdrawals will appear here
            </p>
          </div>
        ) : (
          <>
            {visibleEvents.map((evt, i) => {
              const isWithdrawal = evt._type === "withdrawal";
              const args = evt.args as Record<string, any>;
              const txHash = evt.transactionHash;
              const shortHash = txHash
                ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
                : "";

              return (
                <motion.div
                  key={`${txHash}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between gap-2 rounded-xl bg-[rgba(255,255,255,0.02)] px-3 sm:px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isWithdrawal
                          ? "bg-[rgba(239,68,68,0.08)]"
                          : "bg-[rgba(0,229,160,0.08)]"
                      }`}
                    >
                      {isWithdrawal ? (
                        <ArrowUpRight className="h-4 w-4 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-[var(--accent)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium">
                        {isWithdrawal ? "Withdrawal" : "Payroll Credit"}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[var(--text-muted)] truncate">
                        {isWithdrawal
                          ? `−${evt.amountEth || formatUnits(args?.amount ?? BigInt(0), tokenDecimals)} ${tokenSymbol}`
                          : evt.amountEth
                          ? `${evt.amountEth} ${tokenSymbol} disbursed`
                          : `${args?.employeeCount?.toString() ?? "?"} employees paid`}
                        {txHash && (
                          <>
                            <span className="mx-1">·</span>
                            <a
                              href={`${ETHERSCAN_URL}/${txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                            >
                              {shortHash}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isWithdrawal && txHash && (
                      <button
                        onClick={() =>
                          setPayslipEvent({
                            txHash: txHash as string,
                            blockNumber: evt.blockNumber ?? BigInt(0),
                            employeeCount: Number(args.employeeCount ?? 0),
                          })
                        }
                        className="flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] px-2 py-0.5 text-[10px] sm:text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--border-accent)] transition-colors"
                        title="View payslip"
                      >
                        <FileText className="h-3 w-3" />
                        <span className="hidden sm:inline">Payslip</span>
                      </button>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium ${
                        isWithdrawal
                          ? "bg-[rgba(239,68,68,0.08)] text-red-400"
                          : "bg-[rgba(0,229,160,0.08)] text-[var(--accent)]"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      {isWithdrawal ? "Sent" : "Received"}
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

      {/* Payslip modal */}
      <AnimatePresence>
        {payslipEvent && orgAddress && address && (
          <PayslipModal
            onClose={() => setPayslipEvent(null)}
            orgAddress={orgAddress}
            orgName={orgName}
            txHash={payslipEvent.txHash}
            blockNumber={payslipEvent.blockNumber}
            tokenSymbol={tokenSymbol}
            tokenDecimals={tokenDecimals}
            mode="employee"
            employeeAddress={address}
            employeeCount={payslipEvent.employeeCount}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
