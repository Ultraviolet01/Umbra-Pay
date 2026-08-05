"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Fingerprint,
  Check,
  Loader2,
} from "lucide-react";
import { useEthPrice, formatUsd } from "@/hooks/useEthPrice";

interface BalanceCardProps {
  balance: string | null;
  tokenSymbol: string;
  isETH?: boolean;
  isRevealed: boolean;
  isDecrypting: boolean;
  onToggleReveal: () => void;
}

export function BalanceCard({
  balance,
  tokenSymbol,
  isETH = true,
  isRevealed,
  isDecrypting,
  onToggleReveal,
}: BalanceCardProps) {
  const ethPrice = useEthPrice();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.2,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      <div className="border-gradient glow-accent">
        <div className="rounded-2xl bg-[var(--bg-primary)] p-4 sm:p-8">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
            <div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-1">
                Available Balance
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                {isRevealed && balance !== null ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <span
                      className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      <span className="gradient-text">{balance}</span>
                      <span className="ml-2 text-base sm:text-lg text-[var(--text-muted)]">
                        {tokenSymbol}
                      </span>
                    </span>
                    {isETH && ethPrice && balance && parseFloat(balance.replace(/,/g, "")) > 0 && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        ~{formatUsd(parseFloat(balance.replace(/,/g, "")) * ethPrice)} USD
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(8)].map((_, j) => (
                        <motion.span
                          key={j}
                          animate={
                            isDecrypting
                              ? { opacity: [0.15, 0.5, 0.15] }
                              : { opacity: 0.2 }
                          }
                          transition={
                            isDecrypting
                              ? {
                                  duration: 1.2,
                                  repeat: Infinity,
                                  delay: j * 0.08,
                                }
                              : {}
                          }
                          className="inline-block h-8 w-3 sm:h-10 sm:w-4 rounded bg-[var(--accent)]"
                          style={{ opacity: 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onToggleReveal}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all w-full sm:w-auto shrink-0 ${
                isRevealed
                  ? "border-[var(--border-accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              }`}
              disabled={isDecrypting}
            >
              {isDecrypting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Decrypting...
                </>
              ) : isRevealed ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Decrypt & View
                </>
              )}
            </button>
          </div>

          {/* Info row */}
          <div className="flex flex-wrap gap-4 sm:gap-6 border-t border-[var(--border)] pt-4 sm:pt-5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                TEE Confidential
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                Wallet-signed decryption
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                Only you can view this
              </span>
            </div>
          </div>

          {/* Decryption process explainer */}
          <AnimatePresence>
            {isDecrypting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <div className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      {
                        label: "Fetching encrypted handle from contract...",
                        done: true,
                      },
                      {
                        label: "Generating re-encryption keypair...",
                        done: true,
                      },
                      {
                        label: "Signing EIP-712 decryption request...",
                        done: false,
                      },
                    ].map((step, i) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.5 }}
                        className="flex items-center gap-2"
                      >
                        {step.done ? (
                          <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                        ) : (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                        )}
                        <span className="text-xs text-[var(--text-secondary)]">
                          {step.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
