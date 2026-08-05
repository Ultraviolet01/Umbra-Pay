"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, Loader2, Check, Wallet, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { parseEther } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { fadeUpSmall } from "@/lib/animations";
import { CONTRACTS } from "@/lib/contracts";

interface DepositCardProps {
  teeVaultAddress?: `0x${string}`;
  orgAddress?: `0x${string}`;
  isETH?: boolean;
  paymentToken?: `0x${string}`;
  contractBalance?: bigint;
  tokenSymbol?: string;
  tokenDecimals?: number;
  onDeposit?: (amount: string) => void;
  isPending?: boolean;
  txHash?: `0x${string}`;
  resetTx?: () => void;
  refetchBalance?: () => void;
}

const PRESET_AMOUNTS = ["0.05", "0.1", "0.5"];

export function DepositCard({
  teeVaultAddress = CONTRACTS.teeVault,
  orgAddress,
  refetchBalance,
}: DepositCardProps) {
  const [amount, setAmount] = useState("");
  const [depositedAmount, setDepositedAmount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransaction, data: txHash, isPending: isSendPending, reset: resetSend, error: sendError } = useSendTransaction();

  const { isSuccess: isTxConfirmed, isLoading: isWaitingTx } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: 11155111,
    query: { enabled: !!txHash },
  });

  const handleDeposit = async () => {
    setErrorMessage("");
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setErrorMessage("Please enter a valid ETH amount above 0.");
      return;
    }

    try {
      if (chain?.id !== 11155111 && switchChainAsync) {
        await switchChainAsync({ chainId: 11155111 });
      }
      const valueWei = parseEther(amount);
      setDepositedAmount(amount);
      sendTransaction({
        to: teeVaultAddress,
        value: valueWei,
        chainId: 11155111,
      });
    } catch (err: any) {
      console.error("Deposit error:", err);
      setErrorMessage(err?.shortMessage || err?.message || "Failed to submit transaction.");
    }
  };

  useEffect(() => {
    if (sendError) {
      setErrorMessage((sendError as any)?.shortMessage || sendError.message || "Transaction rejected or failed");
    }
  }, [sendError]);

  useEffect(() => {
    if (isTxConfirmed && txHash) {
      setIsSuccess(true);
      setErrorMessage("");
      refetchBalance?.();

      if (typeof window !== "undefined") {
        const key = `drippay_deposits_${orgAddress || "all"}`.toLowerCase();
        try {
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [];
          list.unshift({
            txHash,
            amountEth: depositedAmount || amount,
            timestamp: Date.now(),
          });
          localStorage.setItem(key, JSON.stringify(list));
          window.dispatchEvent(new Event("drippay_deposit_added"));
        } catch (e) {
          console.error("Save deposit error", e);
        }
      }

      fetch("/api/enclave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deposit",
          depositAmountEth: depositedAmount || amount,
        }),
      }).catch((e) => console.error("Enclave sync error", e));

      const timer = setTimeout(() => {
        setIsSuccess(false);
        setAmount("");
        resetSend();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isTxConfirmed, txHash, depositedAmount, amount, resetSend]);

  const shortTx = txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : "";
  const isBusy = isSendPending || isWaitingTx;
  const isButtonDisabled = isBusy || !amount || Number(amount) <= 0;

  return (
    <motion.div
      variants={fadeUpSmall}
      initial="hidden"
      animate="visible"
      className="stat-card group relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[var(--accent)] opacity-0 blur-[30px] transition-opacity duration-500 group-hover:opacity-[0.08]" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] transition-colors group-hover:bg-[rgba(0,229,160,0.12)]">
            <Wallet className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-medium">
            <ShieldCheck className="h-3 w-3" />
            Sepolia Vault (11155111)
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-1">TEE Liquidity Vault</p>
        <p
          className="text-sm font-mono text-[var(--accent)] truncate mb-4"
          title={teeVaultAddress}
        >
          {teeVaultAddress}
        </p>

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
              <p
                className="font-bold gradient-text text-base mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {depositedAmount} ETH Deposited
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Plain native ETH transfer confirmed on Ethereum Sepolia
              </p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  {shortTx}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.0 ETH"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    step="any"
                    min="0"
                    className="input-field !pr-16 text-sm"
                    disabled={isBusy}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-medium">
                    ETH
                  </div>
                </div>

                {/* Preset quick buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">Quick:</span>
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(val);
                        if (errorMessage) setErrorMessage("");
                      }}
                      disabled={isBusy}
                      className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-2.5 py-1 text-[11px] font-mono text-[var(--text-secondary)] hover:border-[var(--border-accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                    >
                      {val} ETH
                    </button>
                  ))}
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{errorMessage}</span>
                  </div>
                )}

                <button
                  onClick={handleDeposit}
                  disabled={isButtonDisabled}
                  className="btn-primary w-full !py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSendPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Approve in Wallet...
                    </>
                  ) : isWaitingTx ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Waiting Sepolia Confirmation...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="h-3.5 w-3.5" />
                      Deposit Native ETH to TEE
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
