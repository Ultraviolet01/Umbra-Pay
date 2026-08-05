"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Wallet, Loader2, Check, ExternalLink, Lock } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { UMBRA_ORG_ABI } from "@/lib/contracts";

interface WithdrawCardProps {
  orgAddress: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  maxBalance: string | null;
  onWithdrawSuccess?: () => void;
}

const WITHDRAW_STEPS = [
  "Confirm withdrawal request on Coston2...",
  "Waiting for TEE Enclave settlement on Sepolia...",
];

export function WithdrawCard({
  orgAddress,
  tokenSymbol,
  tokenDecimals,
  maxBalance,
  onWithdrawSuccess,
}: WithdrawCardProps) {
  const { address: connectedAddress } = useAccount();
  const [amount, setAmount] = useState("");
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  const numAmount = parseFloat(amount) || 0;
  const maxNum = maxBalance ? parseFloat(maxBalance.replace(/,/g, "")) : 0;
  const hasDecrypted = maxBalance !== null;
  const exceedsBalance = hasDecrypted && numAmount > maxNum;
  const isValid = numAmount > 0 && hasDecrypted && !exceedsBalance;

  useEffect(() => {
    if (isTxConfirmed && withdrawStep === 1) {
      // Notify TEE Enclave to execute settlement on Sepolia
      fetch("/api/enclave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw",
          employeeAddress: connectedAddress,
          amountEth: amount,
        }),
      }).then(() => {
        setWithdrawnAmount(amount);
        setIsSuccess(true);
        onWithdrawSuccess?.();

        setTimeout(() => {
          setIsSuccess(false);
          setAmount("");
          setWithdrawStep(0);
          reset();
        }, 3000);
      });
    }
  }, [isTxConfirmed, withdrawStep, amount, connectedAddress, onWithdrawSuccess, reset]);

  useEffect(() => {
    if (writeError) {
      setErrorMsg((writeError as any)?.shortMessage || writeError.message || "Transaction failed");
      setWithdrawStep(0);
    }
  }, [writeError]);

  const handleWithdraw = () => {
    if (!isValid || !connectedAddress) return;
    setErrorMsg("");

    try {
      const amountInWei = parseUnits(amount, tokenDecimals);
      setWithdrawStep(0);

      writeContract({
        address: orgAddress,
        abi: UMBRA_ORG_ABI,
        functionName: "requestWithdrawal",
        args: [amountInWei, connectedAddress],
      });

      setWithdrawStep(1);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to prepare withdrawal");
    }
  };

  const isWithdrawing = isPending || (!!txHash && !isTxConfirmed && !writeError);

  return (
    <div className="accent-card overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="relative">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
              <Download className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--accent)]" />
            </div>
            {isWithdrawing && !isSuccess && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-4px] rounded-full border border-dashed border-[var(--border-accent)] opacity-40"
              />
            )}
          </div>
          <div>
            <h3 className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Withdraw
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Request payout via Flare TEE enclave
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-3 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,229,160,0.1)] border border-[var(--border-accent)]"
              >
                <Check className="h-6 w-6 text-[var(--accent)]" />
              </motion.div>
              <p className="font-bold gradient-text text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>
                {withdrawnAmount} {tokenSymbol}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Settled on Sepolia by TEE Enclave
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-3 mb-4">
                {!hasDecrypted ? (
                  <div className="rounded-lg bg-[rgba(255,200,50,0.06)] border border-[rgba(255,200,50,0.15)] px-4 py-3">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Attest your balance first to enable withdrawals.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">
                        Amount
                      </label>
                      <button
                        onClick={() => setAmount(String(maxNum))}
                        disabled={isWithdrawing || maxNum <= 0}
                        className="text-[11px] text-[var(--accent)] hover:underline disabled:opacity-40 disabled:no-underline"
                      >
                        Max: {maxBalance} {tokenSymbol}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`input-field !pr-20 ${exceedsBalance ? "!border-red-500/50" : ""}`}
                        disabled={isWithdrawing}
                        max={maxNum}
                        step="any"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Lock className="h-3 w-3" />
                        <span>{tokenSymbol}</span>
                      </div>
                    </div>
                    {exceedsBalance && (
                      <p className="mt-1.5 text-[11px] text-red-400">
                        Amount exceeds your attested balance
                      </p>
                    )}
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-xs text-red-400">{errorMsg}</p>
                </div>
              )}

              <AnimatePresence>
                {isWithdrawing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="rounded-lg bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-3 space-y-2.5">
                      {WITHDRAW_STEPS.map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          {withdrawStep > i ? (
                            <Check className="h-3 w-3 text-[var(--accent)]" />
                          ) : withdrawStep === i ? (
                            <Loader2 className="h-3 w-3 animate-spin text-[var(--accent)]" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-[var(--border)]" />
                          )}
                          <span className={`text-[11px] ${withdrawStep >= i ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleWithdraw}
                disabled={!isValid || isWithdrawing}
                className="btn-secondary w-full !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Request TEE Withdrawal
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
