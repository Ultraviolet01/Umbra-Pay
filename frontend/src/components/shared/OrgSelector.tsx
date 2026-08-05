"use client";

import { motion } from "framer-motion";
import { Building2, Plus, Users, Clock, ChevronRight, Shield, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Organization } from "@/lib/mock-data";
import { fadeUpSmall } from "@/lib/animations";

interface OrgSelectorProps {
  title: string;
  subtitle: string;
  isLoading?: boolean;
  orgs: Organization[];
  onSelect: (org: Organization) => void;
  onCreateNew?: () => void;
}

export function OrgSelector({
  title,
  subtitle,
  isLoading = false,
  orgs,
  onSelect,
  onCreateNew,
}: OrgSelectorProps) {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {/* Header */}
        <motion.div variants={fadeUpSmall} custom={0} className="mb-8">
          <h1
            className="text-2xl font-bold tracking-tight md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {subtitle}
          </p>
        </motion.div>

        {/* Org list */}
        <div className="space-y-3">
          {isLoading ? (
            <motion.div
              variants={fadeUpSmall}
              custom={1}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="relative mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                  <Building2 className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-6px] rounded-full border-2 border-transparent border-t-[var(--accent)] opacity-40"
                />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">Loading organizations...</p>
            </motion.div>
          ) : (
            <>
              {orgs.map((org, i) => (
                <motion.button
                  key={org.id}
                  variants={fadeUpSmall}
                  custom={i + 1}
                  onClick={() => onSelect(org)}
                  className="group flex w-full items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-left transition-all duration-300 hover:border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,229,160,0.06)] relative overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[var(--accent)] opacity-0 blur-[40px] transition-opacity duration-500 group-hover:opacity-[0.06]" />

                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] transition-colors group-hover:bg-[rgba(0,229,160,0.12)]">
                    <Building2 className="h-5 w-5 text-[var(--accent)]" />
                  </div>

                  <div className="relative flex-1 min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {org.name}
                    </p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {org.employeeCount} employees
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {org.lastPayroll}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        TEE
                      </span>
                      <CopyAddress address={(org as any).fullAddress || org.id} display={org.address} />
                    </div>
                  </div>

                  <ChevronRight className="relative h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </motion.button>
              ))}
            </>
          )}

          {/* Create New button (employer only) */}
          {onCreateNew && (
            <motion.button
              variants={fadeUpSmall}
              custom={orgs.length + 1}
              onClick={onCreateNew}
              className="group flex w-full items-center gap-4 rounded-xl border border-dashed border-[var(--border)] p-5 text-left transition-all duration-300 hover:border-[var(--border-accent)] hover:bg-[var(--bg-card)]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] transition-colors group-hover:border-[var(--border-accent)] group-hover:bg-[var(--accent-muted)]">
                <Plus className="h-5 w-5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent)]" />
              </div>
              <div>
                <p
                  className="font-semibold text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Create New Organization
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Deploy a new encrypted payroll contract
                </p>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/** Inline copy-to-clipboard for org contract address */
function CopyAddress({ address, display }: { address: string; display: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCopy(e as any); }}
      className="hidden sm:inline-flex items-center gap-1 font-mono hover:text-[var(--accent)] transition-colors cursor-pointer"
      title={`Copy full address: ${address}`}
    >
      {display}
      {copied ? (
        <Check className="h-3 w-3 text-[var(--accent)]" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </span>
  );
}
