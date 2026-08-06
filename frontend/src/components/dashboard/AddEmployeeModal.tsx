"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  UserPlus,
  Loader2,
  Check,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { toHex } from "viem";
import { Modal } from "@/components/shared/Modal";
import { UMBRA_ORG_ABI } from "@/lib/contracts";

interface EmployeeRow {
  id: number;
  name: string;
  role: string;
  wallet: string;
  salary: string;
}

let rowIdCounter = 1;
function createEmptyRow(): EmployeeRow {
  return { id: rowIdCounter++, name: "", role: "", wallet: "", salary: "" };
}

interface AddEmployeeModalProps {
  onClose: () => void;
  onAddEmployee: (infos?: { wallet: string; name: string; role: string; salaryEth: string }[]) => void;
  orgAddress: `0x${string}`;
  existingAddresses?: `0x${string}`[];
  existingCount?: number;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

type Step = "form" | "confirming" | "success" | "error";

export function AddEmployeeModal({
  onClose,
  onAddEmployee,
  orgAddress,
  existingAddresses = [],
  tokenSymbol = "ETH",
}: AddEmployeeModalProps) {
  const [rows, setRows] = useState<EmployeeRow[]>([createEmptyRow()]);
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");

  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContract, data: txHash, error: writeError, reset: resetWrite } = useWriteContract();

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  useEffect(() => {
    if (isTxConfirmed && step === "confirming") {
      setStep("success");
      const infos = rows.map((r) => ({
        wallet: r.wallet.trim(),
        name: r.name.trim() || `${r.wallet.trim().slice(0, 6)}...${r.wallet.trim().slice(-4)}`,
        role: r.role.trim() || "Employee",
        salaryEth: r.salary.trim() || "0.1",
      }));
      setTimeout(() => onAddEmployee(infos), 1500);
    }
  }, [isTxConfirmed, step, onAddEmployee, rows]);

  useEffect(() => {
    if (writeError && step === "confirming") {
      setErrorMsg((writeError as any)?.shortMessage || writeError.message || "Transaction failed");
      setStep("error");
      resetWrite();
    }
  }, [writeError, step, resetWrite]);

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const removeRow = (id: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateRow = (id: number, field: keyof EmployeeRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const getDuplicate = (row: EmployeeRow) => {
    const addr = row.wallet.trim().toLowerCase();
    if (!addr.startsWith("0x")) return false;
    if (existingAddresses.some((a) => a.toLowerCase() === addr)) return true;
    return rows.some((r) => r.id !== row.id && r.wallet.trim().toLowerCase() === addr);
  };

  const isRowValid = (row: EmployeeRow) =>
    row.wallet.trim().length > 0 &&
    row.salary.trim().length > 0 &&
    !getDuplicate(row);

  const allValid = rows.every(isRowValid);

  const handleSubmit = async () => {
    if (!allValid || step !== "form") return;

    try {
      setStep("confirming");

      const addresses: `0x${string}`[] = [];
      const encryptedPayloads: `0x${string}`[] = [];

      for (const row of rows) {
        const addr = row.wallet.trim() as `0x${string}`;
        addresses.push(addr);

        const payloadObj = {
          salaryEth: row.salary,
          name: row.name,
          role: row.role,
        };

        const jsonStr = JSON.stringify(payloadObj);
        const encoder = new TextEncoder();
        const hex = toHex(encoder.encode(jsonStr));
        encryptedPayloads.push(hex);

        await fetch("/api/enclave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_employee",
            employeeAddress: addr,
            salaryEth: row.salary,
          }),
        });
      }

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
        functionName: "addEmployees",
        args: [addresses, encryptedPayloads],
        gas: BigInt(500000),
      });
    } catch (err: any) {
      console.error("AddEmployees error:", err);
      setErrorMsg(err?.shortMessage || err?.message || "Transaction failed");
      setStep("error");
    }
  };

  const modalIcon = (
    <div className="relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
        <UserPlus className="h-4 w-4 text-[var(--accent)]" />
      </div>
    </div>
  );

  return (
    <Modal
      onClose={onClose}
      title={
        step === "success"
          ? `${rows.length > 1 ? "Employees" : "Employee"} Added`
          : step === "error"
            ? "Error"
            : "Add Employees"
      }
      icon={modalIcon}
    >
      <AnimatePresence mode="wait">
        {step === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,229,160,0.1)] border border-[var(--border-accent)]"
            >
              <Check className="h-8 w-8 text-[var(--accent)]" />
            </motion.div>
            <div className="flex items-center justify-center gap-2 text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
              <p className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {rows.length} {rows.length > 1 ? "employees" : "employee"} added successfully
              </p>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Encrypted payload synced to Coston2 coordination chain and TEE Enclave
            </p>
          </motion.div>
        ) : step === "error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 text-center"
          >
            <p className="text-sm text-red-400 mb-4">{errorMsg}</p>
            <button
              onClick={() => {
                setStep("form");
                setErrorMsg("");
              }}
              className="btn-secondary"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {rows.map((row, idx) => {
                const isDup = getDuplicate(row);
                return (
                  <div
                    key={row.id}
                    className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        Employee {idx + 1}
                      </span>
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          disabled={step !== "form"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Alice Johnson"
                          value={row.name}
                          onChange={(e) => updateRow(row.id, "name", e.target.value)}
                          className="input-field !text-sm"
                          disabled={step !== "form"}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                          Role
                        </label>
                        <input
                          type="text"
                          placeholder="Engineer"
                          value={row.role}
                          onChange={(e) => updateRow(row.id, "role", e.target.value)}
                          className="input-field !text-sm"
                          disabled={step !== "form"}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={row.wallet}
                        onChange={(e) => updateRow(row.id, "wallet", e.target.value)}
                        className={`input-field font-mono !text-sm ${isDup ? "!border-red-500/50" : ""}`}
                        disabled={step !== "form"}
                      />
                      {isDup && (
                        <p className="mt-1 text-[11px] text-red-400">
                          Duplicate address
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[var(--text-secondary)]">
                        Monthly Salary ({tokenSymbol})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="1.5"
                          value={row.salary}
                          onChange={(e) => updateRow(row.id, "salary", e.target.value)}
                          className="input-field !pr-20 !text-sm"
                          disabled={step !== "form"}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <Lock className="h-3 w-3" />
                          <span>{tokenSymbol}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={addRow}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-2.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Employee
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!allValid || step !== "form"}
              className="btn-primary w-full !py-3 mt-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step !== "form" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Add {rows.length > 1 ? `${rows.length} Employees` : "Employee"}
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
