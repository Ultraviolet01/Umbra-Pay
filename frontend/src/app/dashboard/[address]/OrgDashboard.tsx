"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Copy, Check, Building2 } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { AppNav } from "@/components/shared/AppNav";
import { StatCards } from "@/components/dashboard/StatCards";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { RunPayrollCard } from "@/components/dashboard/RunPayrollCard";
import { PayrollHistory } from "@/components/dashboard/PayrollHistory";
import { PayrollScheduleCard } from "@/components/dashboard/PayrollScheduleCard";
import { AddEmployeeModal } from "@/components/dashboard/AddEmployeeModal";
import { UpdateSalaryModal } from "@/components/dashboard/UpdateSalaryModal";
import { PayrollConfirmModal } from "@/components/dashboard/PayrollConfirmModal";
import { DepositCard } from "@/components/dashboard/DepositCard";
import { useOrganization } from "@/hooks/useOrganization";
import { useContractEvents } from "@/hooks/useContractEvents";
import { UMBRA_ORG_ABI } from "@/lib/contracts";
import type { Employee } from "@/lib/mock-data";
import { fadeUpSmall } from "@/lib/animations";
import { Star4, CrossMark, Diamond, Dot } from "@/components/shared/Stars";

export default function OrgDashboard({ address: orgAddress }: { address: `0x${string}` }) {
  const { isConnected } = useAccount();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPayrollConfirm, setShowPayrollConfirm] = useState(false);
  const [showUpdateSalary, setShowUpdateSalary] = useState<{
    address: `0x${string}`;
    name: string;
  } | null>(null);
  const [salaryVersion, setSalaryVersion] = useState(0);

  const {
    orgName,
    employees: contractEmployees,
    paymentToken,
    contractBalance,
    createdAt,
    isETH,
    deposit,
    removeEmployee,
    isPending,
    removingAddress,
    txHash: orgTxHash,
    resetTx,
    refetchEmployees,
    refetchBalance,
  } = useOrganization(orgAddress);

  const { events: payrollEvents } = useContractEvents({
    address: orgAddress,
    abi: UMBRA_ORG_ABI as any,
    eventName: "PayrollExecuted",
    enabled: true,
  });

  const displaySymbol = "ETH";
  const displayDecimals = 18;

  const getEmployeeMeta = (empAddr: string) => {
    if (typeof window === "undefined") return null;
    try {
      const key = `drippay_emp_${orgAddress}_${empAddr}`.toLowerCase();
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const saveEmployeeMeta = (empAddr: string, meta: { name: string; role: string; salaryEth?: string }) => {
    if (typeof window === "undefined") return;
    const key = `drippay_emp_${orgAddress}_${empAddr}`.toLowerCase();
    const existing = getEmployeeMeta(empAddr) || {};
    localStorage.setItem(key, JSON.stringify({ ...existing, ...meta }));
  };

  const lastPayrollTimestampSec = payrollEvents.length > 0
    ? (() => {
        const args = payrollEvents[0].args as Record<string, any>;
        const ts = args?.timestamp;
        return ts ? Number(ts) : null;
      })()
    : null;

  const lastPayrollTimestamp = lastPayrollTimestampSec
    ? new Date(lastPayrollTimestampSec * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const getCombinedEmployeeAddresses = (): string[] => {
    const addressesSet = new Set<string>();
    (contractEmployees ?? []).forEach((a) => addressesSet.add(a.toLowerCase()));

    if (typeof window !== "undefined") {
      const prefix = `drippay_emp_${orgAddress}_`.toLowerCase();
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.toLowerCase().startsWith(prefix)) {
          const empAddr = k.substring(prefix.length);
          if (empAddr && /^0x[0-9a-f]{40}$/i.test(empAddr)) {
            addressesSet.add(empAddr.toLowerCase());
          }
        }
      }
    }
    return Array.from(addressesSet);
  };

  const combinedAddresses = getCombinedEmployeeAddresses();

  const employees: Employee[] = combinedAddresses.map((addr, i) => {
    const meta = getEmployeeMeta(addr);
    return {
      id: i + 1,
      name: meta?.name || `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      address: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
      fullAddress: addr,
      role: meta?.role || "Employee",
      status: "active",
      salaryEth: meta?.salaryEth || "0.1",
      lastPaid: lastPayrollTimestamp || "—",
    };
  });

  const orgCreatedDate = createdAt
    ? new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : undefined;

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute top-0 right-0 w-[800px] h-[600px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 10%, rgba(0,229,160,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 90%, rgba(0,229,160,0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      <Star4 className="top-24 right-[7%]" size={32} opacity={0.14} pulse delay={0.5} />
      <Star4 className="top-[20%] left-[3%]" size={38} opacity={0.15} pulse delay={0} />
      <CrossMark className="top-[28%] right-[4%]" size={16} opacity={0.09} rotate delay={2} />
      <Diamond className="top-[52%] left-[5%]" size={12} opacity={0.12} float delay={0.8} />
      <Dot className="top-[23%] left-[9%]" size={5} opacity={0.2} pulse delay={0.3} />

      <AppNav
        label="Employer Dashboard"
        altLink={{ href: "/employee", label: "Employee View" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
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
                  <Building2 className="h-8 w-8 text-[var(--accent)]" />
                </div>
                <h2 className="mb-2 text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Wallet Disconnected
                </h2>
                <p className="mb-6 text-xs sm:text-sm text-[var(--text-secondary)]">
                  Connect your wallet to view this organization&apos;s dashboard.
                </p>
                <WalletConnect />
              </div>
            </motion.div>
          </div>
        ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="py-4 sm:py-8"
        >
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
                    href="/dashboard"
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
                    <CopyOrgAddress address={orgAddress} />
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">Coston2 (114) / Sepolia</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-3 py-1.5">
                    <Shield className="h-3 w-3 text-[var(--accent)]" />
                    <span className="text-xs font-medium text-[var(--accent)]">TEE Enclave Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <StatCards
            orgName={orgName || "Organization"}
            employeeCount={employees.length}
            activeCount={employees.length}
            contractBalance={contractBalance}
            isETH={isETH}
            tokenSymbol={displaySymbol}
            tokenDecimals={displayDecimals}
            payrollRunCount={payrollEvents.length}
          />

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <EmployeeTable
              employees={employees}
              onAddEmployee={() => setShowAddEmployee(true)}
              onRemoveEmployee={(addr) => {
                removeEmployee(addr);
              }}
              onUpdateSalary={(addr, name) => setShowUpdateSalary({ address: addr, name })}
              orgAddress={orgAddress}
              tokenSymbol={displaySymbol}
              tokenDecimals={displayDecimals}
              removingAddress={removingAddress}
              salaryVersion={salaryVersion}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <DepositCard
                orgAddress={orgAddress}
                isETH={isETH}
                paymentToken={paymentToken}
                contractBalance={contractBalance}
                tokenSymbol={displaySymbol}
                tokenDecimals={displayDecimals}
                onDeposit={deposit}
                isPending={isPending}
                txHash={orgTxHash}
                resetTx={resetTx}
                refetchBalance={refetchBalance}
              />
              <PayrollScheduleCard
                orgAddress={orgAddress}
                lastPayrollTimestampSec={lastPayrollTimestampSec}
              />
              <RunPayrollCard
                onExecute={() => setShowPayrollConfirm(true)}
                activeCount={employees.length}
                contractBalance={contractBalance}
                orgAddress={orgAddress}
                tokenSymbol={displaySymbol}
                tokenDecimals={displayDecimals}
              />
              <PayrollHistory
                orgAddress={orgAddress}
                orgName={orgName || "Organization"}
                tokenSymbol={displaySymbol}
                tokenDecimals={displayDecimals}
              />
            </motion.div>
          </div>
        </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAddEmployee && (
          <AddEmployeeModal
            onClose={() => setShowAddEmployee(false)}
            onAddEmployee={(infos) => {
              if (infos) {
                for (const info of infos) {
                  saveEmployeeMeta(info.wallet, {
                    name: info.name,
                    role: info.role,
                    salaryEth: info.salaryEth,
                  });
                }
              }
              refetchEmployees();
              refetchBalance();
              setShowAddEmployee(false);
            }}
            orgAddress={orgAddress}
            existingCount={employees.length}
            existingAddresses={contractEmployees as `0x${string}`[] ?? []}
            tokenSymbol={displaySymbol}
            tokenDecimals={displayDecimals}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpdateSalary && (
          <UpdateSalaryModal
            onClose={() => setShowUpdateSalary(null)}
            onSuccess={() => {
              setShowUpdateSalary(null);
              setSalaryVersion((v) => v + 1);
              refetchEmployees();
              refetchBalance();
            }}
            orgAddress={orgAddress}
            employeeAddress={showUpdateSalary.address}
            employeeName={showUpdateSalary.name}
            tokenSymbol={displaySymbol}
            tokenDecimals={displayDecimals}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayrollConfirm && (
          <PayrollConfirmModal
            onClose={() => setShowPayrollConfirm(false)}
            onExecute={() => {
              refetchEmployees();
              refetchBalance();
            }}
            orgAddress={orgAddress}
            employees={employees}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyOrgAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-mono"
      title="Copy contract address - share with employees"
    >
      <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
      {copied ? (
        <Check className="h-3 w-3 text-[var(--accent)]" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied && <span className="text-[var(--accent)] font-sans">Copied!</span>}
    </button>
  );
}
