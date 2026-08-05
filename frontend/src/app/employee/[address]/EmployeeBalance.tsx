"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { AppNav } from "@/components/shared/AppNav";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { BalanceCard } from "@/components/employee/BalanceCard";
import { TransactionHistory } from "@/components/employee/TransactionHistory";
import { WithdrawCard } from "@/components/employee/WithdrawCard";
import { PrivacyInfo } from "@/components/employee/PrivacyInfo";
import { OrgInfo } from "@/components/employee/OrgInfo";
import { useOrganization } from "@/hooks/useOrganization";
import { fadeUpSmall } from "@/lib/animations";
import {
  Hexagon,
  Ring,
  ShieldShape,
  KeyHole,
  BinaryBlock,
  Dot,
} from "@/components/shared/Stars";

export default function EmployeeBalance({ orgAddress }: { orgAddress: `0x${string}` }) {
  const { address: connectedAddress, isConnected } = useAccount();

  const [isBalanceRevealed, setIsBalanceRevealed] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedBalance, setDecryptedBalance] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState("");

  const {
    orgName,
    createdAt,
    refetchBalance,
  } = useOrganization(orgAddress);

  const displaySymbol = "ETH";
  const displayDecimals = 18;

  const handleRevealBalance = async () => {
    if (isBalanceRevealed) {
      setIsBalanceRevealed(false);
      setDecryptedBalance(null);
      return;
    }

    if (!connectedAddress) return;

    setIsDecrypting(true);
    setDecryptError("");

    try {
      const res = await fetch("/api/enclave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_balance",
          employeeAddress: connectedAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDecryptedBalance(data.balanceEth);
        setIsBalanceRevealed(true);
      } else {
        setDecryptError(data.error || "TEE Query failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to query TEE balance";
      console.error("[TEE Query] Error:", err);
      setDecryptError(message);
      setDecryptedBalance(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const orgCreatedDate = createdAt
    ? new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : undefined;

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px]"
          style={{
            background: "radial-gradient(ellipse 50% 45% at 50% 40%, rgba(0,229,160,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <Hexagon className="top-28 left-[4%]" size={44} opacity={0.1} rotate delay={0} />
      <Hexagon className="top-[35%] right-[3%]" size={52} opacity={0.08} pulse delay={1.5} />
      <Hexagon className="bottom-[20%] left-[6%]" size={36} opacity={0.09} rotate delay={0.8} />
      <Ring className="top-[15%] right-[6%]" size={56} opacity={0.08} pulse delay={0.3} />
      <Ring className="top-[45%] left-[2%]" size={48} opacity={0.07} pulse delay={1.8} />
      <ShieldShape className="top-[22%] left-[8%]" size={30} opacity={0.1} float delay={0.5} />
      <ShieldShape className="top-[50%] right-[5%]" size={26} opacity={0.08} pulse delay={2} />
      <KeyHole className="top-[30%] right-[12%]" size={22} opacity={0.09} pulse delay={1.5} />
      <BinaryBlock className="top-[20%] left-[15%]" opacity={0.05} delay={1} />
      <Dot className="top-[25%] right-[22%]" size={4} opacity={0.18} pulse delay={0.3} />
      <Dot className="top-[42%] left-[12%]" size={5} opacity={0.15} pulse delay={1.5} />

      <AppNav
        label="Employee Portal"
        altLink={{ href: "/dashboard", label: "Employer View" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        {!isConnected ? (
          <div className="flex min-h-[80vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md text-center"
            >
              <div className="accent-card overflow-hidden p-6 sm:p-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.15)]">
                  <Shield className="h-8 w-8 text-[var(--accent)]" />
                </div>
                <h2 className="mb-2 text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Wallet Disconnected
                </h2>
                <p className="mb-6 text-xs sm:text-sm text-[var(--text-secondary)]">
                  Connect your wallet to view your balance and transactions.
                </p>
                <WalletConnect />
              </div>
            </motion.div>
          </div>
        ) : (
        <div className="py-4 sm:py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="mb-4 sm:mb-8"
          >
            <motion.div
              variants={fadeUpSmall}
              custom={0}
              className="accent-card overflow-hidden px-4 py-4 sm:px-6 sm:py-5 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Link
                    href="/employee"
                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div className="min-w-0">
                    <h1
                      className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {orgName || `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`}
                    </h1>
                    <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                      {orgCreatedDate ? `Created ${orgCreatedDate} · ` : ""}
                      Paying in ETH
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-3 py-1.5">
                    <Lock className="h-3 w-3 text-[var(--accent)]" />
                    <span className="text-xs font-medium text-[var(--accent)]">
                      {isBalanceRevealed ? "TEE Attested" : "TEE Encrypted"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {decryptError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4"
            >
              <p className="text-xs text-red-400">{decryptError}</p>
            </motion.div>
          )}

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <BalanceCard
                balance={decryptedBalance}
                tokenSymbol={displaySymbol}
                isETH={true}
                isRevealed={isBalanceRevealed}
                isDecrypting={isDecrypting}
                onToggleReveal={handleRevealBalance}
              />
              <TransactionHistory
                orgAddress={orgAddress}
                orgName={orgName || `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`}
                tokenSymbol={displaySymbol}
                tokenDecimals={displayDecimals}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <WithdrawCard
                orgAddress={orgAddress}
                tokenSymbol={displaySymbol}
                tokenDecimals={displayDecimals}
                maxBalance={isBalanceRevealed ? decryptedBalance : null}
                onWithdrawSuccess={refetchBalance}
              />
              <PrivacyInfo />
              <OrgInfo
                orgName={orgName || `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`}
                orgAddress={`${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`}
                tokenSymbol={displaySymbol}
                createdDate={orgCreatedDate}
              />
            </motion.div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
