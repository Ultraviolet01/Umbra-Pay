"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Lock, Loader2, Check, ExternalLink, PartyPopper } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { Modal } from "@/components/shared/Modal";
import { Confetti } from "@/components/shared/Confetti";
import { EncryptedValue } from "@/components/shared/EncryptedValue";
import { UMBRA_ORG_ABI } from "@/lib/contracts";
import type { Employee } from "@/lib/mock-data";

interface PayrollConfirmModalProps {
  onClose: () => void;
  onExecute: () => void;
  orgAddress: `0x${string}`;
  employees: Employee[];
}

export function PayrollConfirmModal({
  onClose,
  onExecute,
  orgAddress,
  employees,
}: PayrollConfirmModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContract, data: txHash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  const activeEmployees = employees.filter((e) => e.status === "active");

  useEffect(() => {
    if (isTxConfirmed && !isSuccess) {
      setIsSuccess(true);
      fetch("/api/enclave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_payroll",
          employees: activeEmployees.map((e) => ({
            address: e.fullAddress || e.address,
            salaryEth: e.salaryEth || "0.1",
          })),
        }),
      }).catch((e) => console.error("Enclave payroll sync error:", e));
      onExecute();
    }
  }, [isTxConfirmed, isSuccess, onExecute, activeEmployees]);

  // When user rejects or tx fails, reset to confirm state
  useEffect(() => {
    if (writeError && isExecuting) {
      setErrorMsg((writeError as any)?.shortMessage || writeError.message || "Transaction failed");
      setIsExecuting(false);
      resetWrite();
    }
  }, [writeError, isExecuting, resetWrite]);

  const handleExecute = async () => {
    if (isExecuting) return;
    setIsExecuting(true);

    if (chain?.id !== 114 && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: 114 });
      } catch (switchErr) {
        console.warn("Chain switch warning:", switchErr);
      }
    }

    writeContract({
      address: orgAddress,
      abi: UMBRA_ORG_ABI,
      functionName: "runPayroll",
      gas: BigInt(500000),
    });
  };

  const shortTx = txHash
    ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    : "";

  const modalIcon = (
    <div className="relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
        <Zap className="h-4 w-4 text-[var(--accent)]" />
      </div>
      {isExecuting && !isSuccess && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-4px] rounded-full border border-dashed border-[var(--border-accent)] opacity-50"
        />
      )}
    </div>
  );

  return (
    <Modal
      onClose={onClose}
      title={isSuccess ? "Payroll Complete" : isExecuting ? "Executing Payroll" : "Confirm Payroll"}
      icon={modalIcon}
    >
      <Confetti active={isSuccess} />
      <AnimatePresence mode="wait">
        {isSuccess ? (
          /* Success State */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="mx-auto mb-4 relative"
              >
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-[rgba(0,229,160,0.1)] border border-[var(--border-accent)]">
                  <Check className="h-10 w-10 text-[var(--accent)]" />
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: 2, ease: "easeOut" }}
                  className="absolute inset-0 mx-auto h-20 w-20 rounded-full border border-[var(--accent)]"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mb-2"
              >
                <PartyPopper className="h-4 w-4 text-[var(--accent)]" />
                <p
                  className="font-bold text-lg gradient-text"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Payroll Executed
                </p>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-[var(--text-secondary)]"
              >
                {activeEmployees.length} employees paid successfully
              </motion.p>
            </div>

            {/* Tx details */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4 space-y-2"
            >
              {txHash && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Transaction</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono text-xs text-[var(--accent)] hover:underline"
                  >
                    {shortTx}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Employees</span>
                <span className="font-medium">{activeEmployees.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Network</span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">Ethereum Sepolia</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Encryption</span>
                <span className="text-xs font-mono font-semibold text-[var(--accent)]">TEE Enclave</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="btn-primary w-full !py-3 mt-5"
            >
              Done
            </motion.button>
          </motion.div>
        ) : isExecuting ? (
          /* Executing State */
          <motion.div
            key="executing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isPending
                    ? "Confirm in your wallet..."
                    : "Waiting for transaction confirmation..."}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  All salary amounts remain encrypted throughout execution
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Confirm State */
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-4">
              <div className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  You are about to execute encrypted batch payroll for{" "}
                  <span className="font-bold text-[var(--text-primary)]">
                    {activeEmployees.length} active employees
                  </span>
                  . All salary amounts will remain encrypted throughout.
                </p>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeEmployees.map((emp, i) => {
                  const label = emp.name || emp.address;
                  const initials = label.slice(0, 2).toUpperCase();

                  return (
                    <motion.div
                      key={emp.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[10px] font-bold text-[var(--accent)]">
                          {initials}
                        </div>
                        <span className="text-sm font-mono">{emp.address}</span>
                      </div>
                      <EncryptedValue bars={4} barHeight="h-2.5" />
                    </motion.div>
                  );
                })}
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-xs text-red-400">{errorMsg}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn-secondary flex-1 !py-3">
                  Cancel
                </button>
                <button onClick={() => { setErrorMsg(""); handleExecute(); }} className="btn-primary flex-1 !py-3">
                  <Zap className="h-4 w-4" />
                  {errorMsg ? "Retry" : "Execute"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
