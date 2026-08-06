"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Copy, Check, Users, Trash2, Loader2, Edit3, Eye, EyeOff } from "lucide-react";
import { EncryptedValue } from "@/components/shared/EncryptedValue";
import type { Employee } from "@/lib/mock-data";

interface EmployeeTableProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onRemoveEmployee?: (address: `0x${string}`) => void;
  onUpdateSalary?: (address: `0x${string}`, name: string) => void;
  orgAddress?: `0x${string}`;
  tokenSymbol?: string;
  tokenDecimals?: number;
  removingAddress?: `0x${string}` | null;
  isRemoving?: boolean;
  salaryVersion?: number;
}

export function EmployeeTable({
  employees,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateSalary,
  orgAddress,
  tokenSymbol = "ETH",
  removingAddress,
  salaryVersion = 0,
}: EmployeeTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const [revealedSalaries, setRevealedSalaries] = useState<Record<string, string>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const allRevealed = employees.length > 0 && employees.every((emp) => revealedSalaries[emp.fullAddress.toLowerCase()]);

  useEffect(() => {
    if (salaryVersion > 0) {
      setRevealedSalaries({});
    }
  }, [salaryVersion]);

  const handleRevealAll = useCallback(async () => {
    if (!orgAddress || employees.length === 0) return;

    if (allRevealed) {
      setRevealedSalaries({});
      return;
    }

    setIsRevealing(true);

    try {
      const results: Record<string, string> = {};

      for (const emp of employees) {
        let sal = emp.salaryEth;

        if (!sal) {
          try {
            const key = `drippay_emp_${orgAddress}_${emp.fullAddress}`.toLowerCase();
            const raw = localStorage.getItem(key);
            if (raw) {
              const meta = JSON.parse(raw);
              if (meta?.salaryEth) sal = meta.salaryEth;
            }
          } catch {}
        }

        if (!sal) {
          const res = await fetch("/api/enclave", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "get_salary",
              employeeAddress: emp.fullAddress,
            }),
          });
          const data = await res.json();
          if (data.success && data.salaryEth) {
            sal = data.salaryEth;
          }
        }

        results[emp.fullAddress.toLowerCase()] = sal || "0.1";
      }

      setRevealedSalaries(results);
    } catch (err) {
      console.error("[RevealAll] Error:", err);
    } finally {
      setIsRevealing(false);
    }
  }, [orgAddress, employees, allRevealed]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="lg:col-span-2"
    >
      <div className="glass-card overflow-hidden !hover:transform-none">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-muted)] shrink-0">
              <Users className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div>
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Employees
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {employees.length} members &middot; Salaries TEE Protected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {orgAddress && employees.length > 0 && (
              <button
                onClick={handleRevealAll}
                disabled={isRevealing}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  allRevealed
                    ? "border-[var(--border-accent)] bg-[rgba(0,229,160,0.06)] text-[var(--accent)] hover:bg-[rgba(0,229,160,0.1)]"
                    : "border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] hover:border-[var(--border-accent)] hover:text-[var(--accent)] hover:bg-[rgba(0,229,160,0.04)]"
                }`}
              >
                {isRevealing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Querying TEE...</span>
                  </>
                ) : allRevealed ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Hide Salaries</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Reveal Salaries</span>
                  </>
                )}
              </button>
            )}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !py-2 !pl-9 !pr-3 text-xs w-full sm:w-44"
              />
            </div>
            <button
              onClick={onAddEmployee}
              className="btn-primary !py-2 !px-4 text-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        <div className="sm:hidden divide-y divide-[var(--border)]">
          {filteredEmployees.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No employees found
            </div>
          ) : (
            filteredEmployees.map((emp, i) => (
              <MobileEmployeeCard
                key={emp.id}
                employee={emp}
                copied={copied}
                onCopy={handleCopy}
                onRemove={onRemoveEmployee}
                onUpdateSalary={onUpdateSalary}
                salariesRevealed={allRevealed}
                revealedSalary={revealedSalaries[emp.fullAddress.toLowerCase()]}
                tokenSymbol={tokenSymbol}
                isRemoving={removingAddress?.toLowerCase() === emp.fullAddress.toLowerCase() || false}
                index={i}
              />
            ))
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Wallet</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Salary</th>
                <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Last Paid</th>
                <th className="hidden md:table-cell px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, i) => (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  copied={copied}
                  onCopy={handleCopy}
                  onRemove={onRemoveEmployee}
                  onUpdateSalary={onUpdateSalary}
                  salariesRevealed={allRevealed}
                  revealedSalary={revealedSalaries[emp.fullAddress.toLowerCase()]}
                  tokenSymbol={tokenSymbol}
                  isRemoving={removingAddress?.toLowerCase() === emp.fullAddress.toLowerCase() || false}
                  index={i}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function SalaryDisplay({ salary, tokenSymbol, compact }: { salary?: string; tokenSymbol: string; compact?: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {salary ? (
        <motion.div
          key="revealed"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5"
        >
          {salary === "Error" ? (
            <span className={`${compact ? "text-[11px]" : "text-sm"} text-red-400`}>Failed</span>
          ) : (
            <>
              <span className={`font-mono font-semibold text-[var(--accent)] ${compact ? "text-[11px]" : "text-sm"}`}>
                {salary}
              </span>
              <span className={`text-[var(--text-muted)] ${compact ? "text-[10px]" : "text-xs"}`}>{tokenSymbol}</span>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="encrypted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
        >
          <EncryptedValue bars={compact ? 4 : 5} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileEmployeeCard({
  employee: emp,
  copied,
  onCopy,
  onRemove,
  onUpdateSalary,
  salariesRevealed,
  revealedSalary,
  tokenSymbol,
  isRemoving,
  index,
}: {
  employee: Employee;
  copied: string | null;
  onCopy: (text: string) => void;
  onRemove?: (address: `0x${string}`) => void;
  onUpdateSalary?: (address: `0x${string}`, name: string) => void;
  salariesRevealed?: boolean;
  revealedSalary?: string;
  tokenSymbol: string;
  isRemoving?: boolean;
  index: number;
}) {
  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.04 }}
      className="flex items-start gap-3 px-4 py-3.5"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent)] shrink-0 mt-0.5">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate">{emp.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                emp.status === "active"
                  ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)]"
                  : "bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]"
              }`}
            >
              <div
                className={`h-1 w-1 rounded-full ${
                  emp.status === "active" ? "bg-[var(--accent)]" : "bg-[var(--text-secondary)]"
                }`}
              />
              {emp.status}
            </span>
            {onUpdateSalary && (
              <div className="relative group/edit">
                <button
                  onClick={() => salariesRevealed ? onUpdateSalary(emp.fullAddress as `0x${string}`, emp.name) : null}
                  className={`p-1 rounded-md transition-colors ${
                    salariesRevealed
                      ? "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[rgba(0,229,160,0.1)] cursor-pointer"
                      : "text-[var(--text-muted)] opacity-40 cursor-not-allowed"
                  }`}
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              </div>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(emp.fullAddress as `0x${string}`)}
                disabled={isRemoving}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
              >
                {isRemoving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{emp.role}</p>
        <div className="flex items-center justify-between mt-1.5">
          <button
            onClick={() => onCopy(emp.fullAddress)}
            className="flex items-center gap-1 font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {emp.address}
            {copied === emp.fullAddress ? (
              <Check className="h-2.5 w-2.5 text-[var(--accent)]" />
            ) : (
              <Copy className="h-2.5 w-2.5 opacity-40" />
            )}
          </button>
          <SalaryDisplay salary={revealedSalary} tokenSymbol={tokenSymbol} compact />
        </div>
      </div>
    </motion.div>
  );
}

function EmployeeRow({
  employee: emp,
  copied,
  onCopy,
  onRemove,
  onUpdateSalary,
  salariesRevealed,
  revealedSalary,
  tokenSymbol,
  isRemoving,
  index,
}: {
  employee: Employee;
  copied: string | null;
  onCopy: (text: string) => void;
  onRemove?: (address: `0x${string}`) => void;
  onUpdateSalary?: (address: `0x${string}`, name: string) => void;
  salariesRevealed?: boolean;
  revealedSalary?: string;
  tokenSymbol: string;
  isRemoving?: boolean;
  index: number;
}) {
  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.05 }}
      className="table-row"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent)] shrink-0">
            {initials}
          </div>
          <span className="text-sm font-medium">{emp.name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)]">
        {emp.role}
      </td>
      <td className="px-5 py-3.5">
        <button
          onClick={() => onCopy(emp.fullAddress)}
          className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {emp.address}
          {copied === emp.fullAddress ? (
            <Check className="h-3 w-3 text-[var(--accent)]" />
          ) : (
            <Copy className="h-3 w-3 opacity-40" />
          )}
        </button>
      </td>
      <td className="px-5 py-3.5">
        <SalaryDisplay salary={revealedSalary} tokenSymbol={tokenSymbol} />
      </td>
      <td className="hidden lg:table-cell px-5 py-3.5 text-sm text-[var(--text-muted)]">
        {emp.lastPaid}
      </td>
      <td className="hidden md:table-cell px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            emp.status === "active"
              ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)]"
              : "bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              emp.status === "active" ? "bg-[var(--accent)]" : "bg-[var(--text-secondary)]"
            }`}
          />
          {emp.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          {onUpdateSalary && (
            <div className="relative group/edit">
              <button
                onClick={() => salariesRevealed ? onUpdateSalary(emp.fullAddress as `0x${string}`, emp.name) : null}
                className={`p-1.5 rounded-lg transition-colors ${
                  salariesRevealed
                    ? "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[rgba(0,229,160,0.1)] cursor-pointer"
                    : "text-[var(--text-muted)] opacity-40 cursor-not-allowed"
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(emp.fullAddress as `0x${string}`)}
              disabled={isRemoving}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
              title="Remove employee"
            >
              {isRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}
