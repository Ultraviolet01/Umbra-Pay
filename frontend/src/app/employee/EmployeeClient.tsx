"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Fingerprint,
  Search,
  Loader2,
  ArrowRight,
  Building2,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/shared/AppNav";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { useEmployeeOrganizations } from "@/hooks/useOrganization";
import { UMBRA_ORG_ABI } from "@/lib/contracts";
import {
  Hexagon,
  Ring,
  ShieldShape,
  KeyHole,
  BinaryBlock,
  Dot,
} from "@/components/shared/Stars";

const EASE = [0.22, 1, 0.36, 1] as const;
const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;
const LOCALSTORAGE_KEY = "drippay_employee_orgs";

function getSavedOrgs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrg(addr: string) {
  if (typeof window === "undefined") return;
  const existing = getSavedOrgs();
  const lower = addr.toLowerCase();
  if (!existing.some((a) => a.toLowerCase() === lower)) {
    existing.push(addr);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(existing));
  }
}

export default function EmployeeListPage() {
  const { isConnected, address: connectedAddress } = useAccount();
  const router = useRouter();
  const [orgInput, setOrgInput] = useState("");
  const [savedOrgs, setSavedOrgs] = useState<string[]>([]);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const { employeeOrgs, isLoadingEmployeeOrgs } = useEmployeeOrganizations();

  useEffect(() => {
    setSavedOrgs(getSavedOrgs());
  }, []);

  useEffect(() => {
    if (employeeOrgs.length > 0) {
      for (const addr of employeeOrgs) {
        saveOrg(addr);
      }
      setSavedOrgs(getSavedOrgs());
    }
  }, [employeeOrgs]);

  const orgToVerify = orgInput.trim() as `0x${string}`;
  const { data: isEmployeeResult, isLoading: isCheckingEmployee } =
    useReadContract({
      address:
        orgToVerify.startsWith("0x") && orgToVerify.length === 42
          ? orgToVerify
          : undefined,
      abi: UMBRA_ORG_ABI,
      functionName: "isEmployee",
      args: connectedAddress ? [connectedAddress] : undefined,
      query: {
        enabled:
          !!connectedAddress &&
          orgToVerify.startsWith("0x") &&
          orgToVerify.length === 42 &&
          isVerifying,
      },
    });

  useEffect(() => {
    if (isVerifying && isEmployeeResult !== undefined) {
      setIsVerifying(false);
      if (isEmployeeResult) {
        const addr = orgInput.trim();
        saveOrg(addr);
        setSavedOrgs(getSavedOrgs());
        router.push(`/employee/${addr}`);
        setOrgInput("");
        setVerifyError("");
      } else {
        setVerifyError("You are not an employee of this organization.");
      }
    }
  }, [isEmployeeResult, isVerifying, orgInput, router]);

  const handleVerifyOrg = () => {
    const addr = orgInput.trim();
    if (!addr.startsWith("0x") || addr.length !== 42) {
      setVerifyError("Please enter a valid contract address (0x...).");
      return;
    }
    setVerifyError("");
    setIsVerifying(true);
  };

  const view = !isConnected ? "connect" : "org-list";

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          animate={{ opacity: [0.03, 0.06, 0.03], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px]"
          style={{
            background:
              "radial-gradient(ellipse 50% 45% at 50% 40%, rgba(0,229,160,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-0 w-[500px] h-[400px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 15% 15%, rgba(0,229,160,0.025) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Decorative elements */}
      <Hexagon
        className="top-28 left-[4%]"
        size={44}
        opacity={0.1}
        rotate
        delay={0}
      />
      <Hexagon
        className="top-[35%] right-[3%]"
        size={52}
        opacity={0.08}
        pulse
        delay={1.5}
      />
      <Hexagon
        className="bottom-[20%] left-[6%]"
        size={36}
        opacity={0.09}
        rotate
        delay={0.8}
      />
      <Ring
        className="top-[15%] right-[6%]"
        size={56}
        opacity={0.08}
        pulse
        delay={0.3}
      />
      <Ring
        className="top-[45%] left-[2%]"
        size={48}
        opacity={0.07}
        pulse
        delay={1.8}
      />
      <ShieldShape
        className="top-[22%] left-[8%]"
        size={30}
        opacity={0.1}
        float
        delay={0.5}
      />
      <ShieldShape
        className="top-[50%] right-[5%]"
        size={26}
        opacity={0.08}
        pulse
        delay={2}
      />
      <KeyHole
        className="top-[30%] right-[12%]"
        size={22}
        opacity={0.09}
        pulse
        delay={1.5}
      />
      <KeyHole
        className="bottom-[30%] left-[10%]"
        size={20}
        opacity={0.08}
        pulse
        delay={0.4}
      />
      <BinaryBlock className="top-[20%] left-[15%]" opacity={0.05} delay={1} />
      <BinaryBlock
        className="top-[55%] right-[4%]"
        opacity={0.04}
        delay={2.5}
      />
      <Dot
        className="top-[25%] right-[22%]"
        size={4}
        opacity={0.18}
        pulse
        delay={0.3}
      />
      <Dot
        className="top-[42%] left-[12%]"
        size={5}
        opacity={0.15}
        pulse
        delay={1.5}
      />
      <Dot
        className="bottom-[18%] right-[7%]"
        size={4}
        opacity={0.16}
        pulse
        delay={2}
      />
      <Dot
        className="top-[68%] left-[8%]"
        size={5}
        opacity={0.14}
        pulse
        delay={0.8}
      />

      <AppNav
        label="Employee Portal"
        altLink={{ href: "/dashboard", label: "Employer View" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        {/* ═══ CONNECT WALLET ═══ */}
        {view === "connect" && (
          <div className="flex min-h-[80vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-8">
                {/* Animated shield with orbiting rings */}
                <div className="relative mx-auto mb-8 h-28 w-28">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border border-dashed border-[rgba(0,229,160,0.15)]"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-3 rounded-full border border-dashed border-[rgba(0,229,160,0.1)]"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-[#00e5a0] blur-[30px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.15)]">
                      <Shield className="h-8 w-8 text-[#00e5a0]" />
                    </div>
                  </div>
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
                  className="text-3xl sm:text-4xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Employee Portal
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
                  className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-8"
                >
                  Connect your wallet to view your organizations, decrypt your
                  balance, and withdraw funds.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
                className="accent-card overflow-hidden p-6 sm:p-8"
              >
                <div className="flex justify-center mb-6">
                  <WalletConnect />
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {[
                    { icon: Lock, text: "TEE Protected" },
                    { icon: Fingerprint, text: "Wallet-signed" },
                    { icon: Eye, text: "Only you can see" },
                  ].map((item, i) => (
                    <motion.span
                      key={item.text}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.6 + i * 0.1,
                        duration: 0.5,
                        ease: EASE,
                      }}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-[10px] text-[var(--text-muted)]"
                    >
                      <item.icon className="h-3 w-3 text-[var(--accent)]" />
                      {item.text}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* ═══ ORG LIST ═══ */}
        {view === "org-list" && (
          <div className="flex min-h-[80vh] items-center justify-center py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="w-full max-w-lg"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
                  className="text-3xl font-bold tracking-tight sm:text-4xl mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your Organizations
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
                  className="text-sm text-[var(--text-secondary)]"
                >
                  {savedOrgs.length > 0
                    ? "Select an organization to view your confidential TEE balance"
                    : "Organizations you belong to will appear here automatically"}
                </motion.p>
              </div>

              {/* Loading state */}
              {isLoadingEmployeeOrgs && savedOrgs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.015)] p-8 text-center mb-4"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-secondary)] font-medium">
                    Scanning for organizations...
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Checking the factory contract
                  </p>
                </motion.div>
              )}

              {/* Empty state */}
              {!isLoadingEmployeeOrgs && savedOrgs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
                  className="rounded-2xl border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.01)] p-10 text-center mb-4"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(0,229,160,0.06)] border border-[rgba(0,229,160,0.1)]">
                    <Building2 className="h-7 w-7 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                    No organizations yet
                  </p>
                  <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                    Your employer needs to add your wallet address to their
                    organization. Once added, it will appear here automatically.
                  </p>
                </motion.div>
              )}

              {/* Org cards */}
              {savedOrgs.length > 0 && (
                <div className="space-y-3 mb-5">
                  {savedOrgs.map((addr, i) => (
                    <motion.div
                      key={addr}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.2 + i * 0.08,
                        duration: 0.5,
                        ease: EASE,
                      }}
                    >
                      <OrgCard
                        orgAddress={addr as `0x${string}`}
                        onClick={() => router.push(`/employee/${addr}`)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Join by CA - collapsible */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
              >
                {!showJoinForm ? (
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.01)] py-3.5 text-xs font-medium text-[var(--text-muted)] hover:border-[rgba(0,229,160,0.2)] hover:text-[var(--accent)] hover:bg-[rgba(0,229,160,0.02)] transition-all"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Join by Contract Address
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.015)] p-5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">
                        Organization Contract Address
                      </label>
                      <button
                        onClick={() => {
                          setShowJoinForm(false);
                          setVerifyError("");
                        }}
                        className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={orgInput}
                        onChange={(e) => {
                          setOrgInput(e.target.value);
                          setVerifyError("");
                          setIsVerifying(false);
                        }}
                        className="input-field flex-1 font-mono text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleVerifyOrg();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleVerifyOrg}
                        disabled={isVerifying || isCheckingEmployee}
                        className="btn-primary !px-5 shrink-0 disabled:opacity-50"
                      >
                        {isVerifying || isCheckingEmployee ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                        <span>
                          {isVerifying || isCheckingEmployee
                            ? "Verifying..."
                            : "Join"}
                        </span>
                      </button>
                    </div>
                    {verifyError && (
                      <p className="mt-2 text-xs text-red-400">{verifyError}</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Rich org card with name, token type, and visual treatment */
function OrgCard({
  orgAddress,
  onClick,
}: {
  orgAddress: `0x${string}`;
  onClick: () => void;
}) {
  const { data: name } = useReadContract({
    address: orgAddress,
    abi: UMBRA_ORG_ABI,
    functionName: "name",
    query: { enabled: true },
  });

  const { data: createdAt } = useReadContract({
    address: orgAddress,
    abi: UMBRA_ORG_ABI,
    functionName: "createdAt",
    query: { enabled: true },
  });

  const displayName =
    (name as string) || `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`;
  const createdDate = createdAt
    ? new Date(Number(createdAt as bigint) * 1000).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] p-5 text-left transition-all duration-300 hover:border-[rgba(0,229,160,0.2)] hover:bg-[rgba(0,229,160,0.02)] hover:shadow-[0_0_30px_rgba(0,229,160,0.05)]"
    >
      <div className="flex items-center gap-4">
        {/* Org icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.1)] group-hover:bg-[rgba(0,229,160,0.12)] group-hover:border-[rgba(0,229,160,0.2)] transition-all duration-300">
          <Building2 className="h-5 w-5 text-[#00e5a0]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p
              className="text-sm font-bold truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {displayName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <span className="font-mono">
              {orgAddress.slice(0, 6)}...{orgAddress.slice(-4)}
            </span>
            {createdDate && (
              <>
                <span className="h-3 w-px bg-[var(--border)]" />
                <span>{createdDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)]">
            <Lock className="h-2.5 w-2.5 text-[var(--accent)]" />
            Native ETH
          </span>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
}
