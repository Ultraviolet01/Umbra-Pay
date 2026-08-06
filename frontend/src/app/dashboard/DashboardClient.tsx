"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Users, Lock, Building2, Plus, ChevronRight, Loader2 } from "lucide-react";
import { useAccount, useReadContracts, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/shared/AppNav";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { CreateOrg } from "@/components/dashboard/CreateOrg";
import { useOrganizationFactory } from "@/hooks/useOrganization";
import { ORGANIZATION_ABI } from "@/lib/contracts";
import type { Organization } from "@/lib/mock-data";
import { Star4, CrossMark, Diamond, Dot } from "@/components/shared/Stars";

const EASE = [0.22, 1, 0.36, 1] as const;

type View = "connect" | "org-list" | "create-org";

export default function DashboardListPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const {
    createOrganization,
    organizations: orgAddresses,
    isCreating,
    txHash: createTxHash,
    isLoadingOrgs,
    refetchOrgs,
  } = useOrganizationFactory();

  const { isSuccess: isCreateConfirmed } = useWaitForTransactionReceipt({
    hash: createTxHash,
    query: { enabled: !!createTxHash },
  });

  const [handledTxHash, setHandledTxHash] = useState<string | null>(null);
  const [view, setView] = useState<View>("connect");

  const { data: orgNameResults, refetch: refetchOrgNames } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "name" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  const { data: orgCreatedAtResults, refetch: refetchOrgCreatedAt } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "createdAt" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  const { data: orgEmployeeResults, refetch: refetchOrgEmployees } = useReadContracts({
    contracts: (orgAddresses ?? []).map((addr) => ({
      address: addr,
      abi: ORGANIZATION_ABI,
      functionName: "getEmployees" as const,
    })),
    query: { enabled: (orgAddresses ?? []).length > 0 },
  });

  const orgs: Organization[] = (orgAddresses ?? []).map((addr, i) => {
    const nameResult = orgNameResults?.[i];
    const fetchedName =
      nameResult?.status === "success" ? (nameResult.result as string) : "";

    const createdAtResult = orgCreatedAtResults?.[i];
    const createdTimestamp =
      createdAtResult?.status === "success" ? (createdAtResult.result as bigint) : undefined;

    const createdDate = createdTimestamp
      ? new Date(Number(createdTimestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—";

    const empResult = orgEmployeeResults?.[i];
    const empCount =
      empResult?.status === "success" ? (empResult.result as string[]).length : 0;

    return {
      id: addr,
      name: fetchedName || `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      address: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      fullAddress: addr,
      employeeCount: empCount,
      lastPayroll: createdDate,
      role: "admin" as const,
    };
  });

  useEffect(() => {
    if (!isConnected) {
      setView("connect");
    } else if (view === "connect") {
      setView("org-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    if (isCreateConfirmed && createTxHash && createTxHash !== handledTxHash) {
      setHandledTxHash(createTxHash);
      refetchOrgs();
      setView("org-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateConfirmed, createTxHash]);

  const prevOrgCountRef = useRef(orgAddresses?.length ?? 0);
  useEffect(() => {
    const currentCount = orgAddresses?.length ?? 0;
    if (currentCount > prevOrgCountRef.current) {
      refetchOrgNames();
      refetchOrgCreatedAt();
      refetchOrgEmployees();

      // Save payroll schedule for the newly created org
      const newOrgAddr = orgAddresses?.[currentCount - 1];
      if (newOrgAddr && typeof newOrgAddr === "string" && typeof window !== "undefined") {
        const key = `drippay_schedule_${newOrgAddr.toLowerCase()}`;
        localStorage.setItem(key, JSON.stringify({
          intervalDays: pendingCycleDays,
          lastRunTimestamp: null,
        }));
      }
    }
    prevOrgCountRef.current = currentCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgAddresses]);

  const handleSelectOrg = (org: Organization) => {
    const addr = (org as any).fullAddress || org.id;
    router.push(`/dashboard/${addr}`);
  };

  const [pendingCycleDays, setPendingCycleDays] = useState(30);

  const handleCreateOrg = (name: string, teeVaultAddress: `0x${string}`, payrollCycleDays: number) => {
    setPendingCycleDays(payrollCycleDays);
    createOrganization(name, teeVaultAddress);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          animate={{ opacity: [0.03, 0.06, 0.03], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[900px] h-[700px]"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 80% 10%, rgba(0,229,160,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[500px]"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 20% 90%, rgba(0,229,160,0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Decorative elements */}
      <Star4 className="top-24 right-[7%]" size={32} opacity={0.14} pulse delay={0.5} />
      <Star4 className="top-[20%] left-[3%]" size={38} opacity={0.15} pulse delay={0} />
      <Star4 className="top-[55%] right-[5%]" size={26} opacity={0.1} rotate delay={1.2} />
      <CrossMark className="top-[28%] right-[4%]" size={16} opacity={0.09} rotate delay={2} />
      <CrossMark className="top-[65%] left-[8%]" size={12} opacity={0.07} rotate delay={0.5} />
      <Diamond className="top-[52%] left-[5%]" size={12} opacity={0.12} float delay={0.8} />
      <Diamond className="top-[35%] right-[15%]" size={10} opacity={0.1} pulse delay={1.5} />
      <Dot className="top-[23%] left-[9%]" size={5} opacity={0.2} pulse delay={0.3} />
      <Dot className="top-[40%] right-[8%]" size={4} opacity={0.15} pulse delay={1} />
      <Dot className="top-[70%] left-[12%]" size={5} opacity={0.16} pulse delay={2} />

      <AppNav
        label="Employer Dashboard"
        altLink={{ href: "/employee", label: "Employee View" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
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
                {/* Animated icon with orbiting rings */}
                <div className="relative mx-auto mb-8 h-28 w-28">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-[rgba(0,229,160,0.15)]"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-3 rounded-full border border-dashed border-[rgba(0,229,160,0.1)]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.2, 0.05] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-[#00e5a0] blur-[30px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.15)]">
                      <Building2 className="h-8 w-8 text-[#00e5a0]" />
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
                  Employer Dashboard
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
                  className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-8"
                >
                  Create organizations, manage employees, and run encrypted payroll on Ethereum.
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
                    { icon: Users, text: "Batch Payroll" },
                    { icon: Shield, text: "Privacy-first" },
                  ].map((item, i) => (
                    <motion.span
                      key={item.text}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: EASE }}
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
              className="w-full max-w-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>

                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
                    className="text-3xl font-bold tracking-tight sm:text-4xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Your Organizations
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
                    className="text-sm text-[var(--text-secondary)] mt-1"
                  >
                    Select an organization to manage or create a new one
                  </motion.p>
                </div>

              </div>

              {/* Loading */}
              {isLoadingOrgs && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.015)] p-10 text-center"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-secondary)] font-medium">Loading organizations...</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Fetching from factory contract</p>
                </motion.div>
              )}

              {/* Empty state */}
              {!isLoadingOrgs && orgs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
                  className="rounded-2xl border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.01)] p-12 text-center"
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(0,229,160,0.06)] border border-[rgba(0,229,160,0.1)]">
                    <Building2 className="h-8 w-8 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-base font-semibold text-[var(--text-secondary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    No organizations yet
                  </p>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mb-6">
                    Create your first encrypted payroll organization. Deploy a smart contract, add employees, and start running private payroll.
                  </p>
                  <button
                    onClick={() => setView("create-org")}
                    className="btn-primary !py-3 !px-8 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Create Organization
                  </button>
                </motion.div>
              )}

              {/* Org cards */}
              {orgs.length > 0 && (
                <div className="space-y-3 mb-5">
                  {orgs.map((org, i) => (
                    <motion.button
                      key={org.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: EASE }}
                      onClick={() => handleSelectOrg(org)}
                      className="group w-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] p-5 text-left transition-all duration-300 hover:border-[rgba(0,229,160,0.2)] hover:bg-[rgba(0,229,160,0.02)] hover:shadow-[0_0_30px_rgba(0,229,160,0.05)]"
                    >
                      <div className="flex items-center gap-4">
                        {/* Org icon */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.1)] group-hover:bg-[rgba(0,229,160,0.12)] group-hover:border-[rgba(0,229,160,0.2)] transition-all duration-300">
                          <Building2 className="h-5 w-5 text-[#00e5a0]" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ fontFamily: "var(--font-display)" }}>
                            {org.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-muted)]">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {org.employeeCount} employees
                            </span>
                            <span className="h-3 w-px bg-[var(--border)]" />
                            <span className="font-mono">
                              {(org as any).fullAddress?.slice(0, 6)}...{(org as any).fullAddress?.slice(-4)}
                            </span>
                            <span className="h-3 w-px bg-[var(--border)] hidden sm:block" />
                            <span className="hidden sm:flex items-center gap-1">
                              <Shield className="h-2.5 w-2.5 text-[var(--accent)]" />
                              TEE
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </motion.button>
                  ))}

                  {/* Create new - inline */}
                  <motion.button
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + orgs.length * 0.08, duration: 0.5, ease: EASE }}
                    onClick={() => setView("create-org")}
                    className="group w-full flex items-center gap-4 rounded-2xl border border-dashed border-[var(--border)] p-5 text-left transition-all duration-300 hover:border-[rgba(0,229,160,0.2)] hover:bg-[rgba(0,229,160,0.02)]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] group-hover:border-[rgba(0,229,160,0.2)] group-hover:bg-[rgba(0,229,160,0.08)] transition-all">
                      <Plus className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-secondary)]" style={{ fontFamily: "var(--font-display)" }}>
                        Create New Organization
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Deploy an encrypted payroll contract
                      </p>
                    </div>
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ═══ CREATE ORG ═══ */}
        {view === "create-org" && (
          <div className="py-8 max-w-2xl mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={() => setView("org-list")}
              className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to organizations
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
            >
              <CreateOrg
                onOrgCreated={handleCreateOrg}
                isDeploying={isCreating || (!!createTxHash && createTxHash !== handledTxHash && !isCreateConfirmed)}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
