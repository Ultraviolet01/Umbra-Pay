"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowRight, Loader2, Coins, Calendar } from "lucide-react";
import { CONTRACTS } from "@/lib/contracts";

const PAYROLL_CYCLES = [
  { label: "One-time", days: 0, desc: "Manual execution only" },
  { label: "Weekly", days: 7, desc: "Every 7 days" },
  { label: "Bi-weekly", days: 14, desc: "Every 14 days" },
  { label: "Monthly", days: 30, desc: "Every 30 days" },
] as const;

interface CreateOrgProps {
  onOrgCreated: (name: string, teeVaultAddress: `0x${string}`, payrollCycleDays: number) => void;
  isDeploying?: boolean;
}

export function CreateOrg({ onOrgCreated, isDeploying = false }: CreateOrgProps) {
  const [orgName, setOrgName] = useState("");
  const [payrollCycle, setPayrollCycle] = useState(30);

  const handleCreate = () => {
    if (!orgName.trim() || isDeploying) return;
    onOrgCreated(orgName.trim(), CONTRACTS.teeVault, payrollCycle);
  };

  const isValid = Boolean(orgName.trim());

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="w-full max-w-md"
      >
        <div className="border-gradient glow-accent">
          <div className="rounded-2xl bg-[var(--bg-primary)] p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
              <Building2 className="h-8 w-8 text-[var(--accent)]" />
            </div>

            <h2
              className="mb-2 text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create Your Organization
            </h2>
            <p className="mb-8 text-sm text-[var(--text-secondary)]">
              Deploy a private payroll organization onchain. All salary data
              is protected by TEE hardware isolation.
            </p>

            <div className="space-y-4 text-left">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  disabled={isDeploying}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  Payment Currency
                </label>
                <div className="flex items-center justify-between rounded-xl border border-[var(--border-accent)] bg-[rgba(0,229,160,0.06)] px-4 py-3 text-sm font-medium text-[var(--accent)]">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[var(--accent)]" />
                    <span>Native ETH</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">Ethereum Sepolia Vault</span>
                </div>
              </div>

              {/* Payroll Cycle */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Payroll Cycle
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYROLL_CYCLES.map((cycle) => (
                    <button
                      key={cycle.days}
                      type="button"
                      onClick={() => setPayrollCycle(cycle.days)}
                      disabled={isDeploying}
                      className={`flex flex-col items-center rounded-xl border px-3 py-2.5 text-center transition-all ${
                        payrollCycle === cycle.days
                          ? "border-[var(--border-accent)] bg-[rgba(0,229,160,0.06)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      <span className="text-xs font-semibold">{cycle.label}</span>
                      <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{cycle.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!isValid || isDeploying}
                className="btn-primary w-full !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirm in wallet...
                  </>
                ) : (
                  <>
                    Deploy Organization
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Transaction pending indicator */}
              <AnimatePresence>
                {isDeploying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] p-4">
                      <div className="flex items-center gap-2.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                        <span className="text-xs text-[var(--text-secondary)]">
                          Waiting for wallet confirmation and transaction...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isDeploying && (
                <p className="text-xs text-[var(--text-muted)] text-center">
                  This will deploy a new smart contract on Flare Coston2
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
