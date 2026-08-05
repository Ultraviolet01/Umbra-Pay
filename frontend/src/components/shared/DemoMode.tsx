"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  UserPlus,
  Zap,
  Eye,
  Shield,
  Lock,
  Check,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/animations";

const DEMO_ORG = "CryptoPayroll Inc.";
const DEMO_EMPLOYEES = [
  { name: "Alice Johnson", role: "Engineer", wallet: "0x1a2b...9f0e", salary: "5,000" },
  { name: "Bob Smith", role: "Designer", wallet: "0x3c4d...7a8b", salary: "4,500" },
  { name: "Carol Lee", role: "PM", wallet: "0x5e6f...3c2d", salary: "4,800" },
];

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Building2;
  content: React.ReactNode;
}

function EncryptAnimation({ text, delay = 0 }: { text: string; delay?: number }) {
  const [phase, setPhase] = useState<"plain" | "encrypting" | "encrypted">("plain");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("encrypting"), delay + 800);
    const t2 = setTimeout(() => setPhase("encrypted"), delay + 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay]);

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <AnimatePresence mode="wait">
        {phase === "plain" && (
          <motion.span
            key="plain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            className="text-[var(--text-primary)]"
          >
            {text}
          </motion.span>
        )}
        {phase === "encrypting" && (
          <motion.span
            key="encrypting"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: 2 }}
            exit={{ opacity: 0 }}
            className="text-[var(--accent)]"
          >
            Encrypting...
          </motion.span>
        )}
        {phase === "encrypted" && (
          <motion.span
            key="encrypted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-[var(--accent)]"
          >
            <Lock className="h-3 w-3" />
            <span className="tracking-wider">TEE(****)</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function SimulatedTx({ label, delay = 0, onComplete }: { label: string; delay?: number; onComplete?: () => void }) {
  const [phase, setPhase] = useState<"pending" | "confirming" | "confirmed">("pending");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("confirming"), delay + 500);
    const t2 = setTimeout(() => {
      setPhase("confirmed");
      onComplete?.();
    }, delay + 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay, onComplete]);

  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-[rgba(255,255,255,0.02)] px-3 py-2">
      {phase === "confirmed" ? (
        <Check className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
      ) : (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)] shrink-0" />
      )}
      <span className="text-xs text-[var(--text-secondary)] flex-1">{label}</span>
      <span className={`text-[10px] font-mono ${phase === "confirmed" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
        {phase === "pending" ? "pending" : phase === "confirming" ? "confirming..." : "confirmed"}
      </span>
    </div>
  );
}

function StepCreateOrg() {
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCreated(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4">
        <p className="text-xs text-[var(--text-muted)] mb-2">Organization Name</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {DEMO_ORG}
        </motion.p>
      </div>
      <SimulatedTx label="Deploying Organization contract..." />
      <AnimatePresence>
        {created && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-[rgba(0,229,160,0.06)] border border-[var(--border-accent)] px-3 py-2"
          >
            <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)] font-medium">
              Organization deployed on Ethereum Sepolia
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepAddEmployees() {
  return (
    <div className="space-y-2.5">
      {DEMO_EMPLOYEES.map((emp, i) => (
        <motion.div
          key={emp.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-3"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[10px] font-bold text-[var(--accent)]">
                {emp.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-xs font-medium">{emp.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{emp.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[var(--text-muted)]">Salary</p>
              <EncryptAnimation text={`${emp.salary} ETH`} delay={i * 400} />
            </div>
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <SimulatedTx label="Batch adding 3 employees with encrypted salaries..." delay={0} />
      </motion.div>
    </div>
  );
}

function StepRunPayroll() {
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--text-secondary)]">Active employees</span>
          <span className="text-sm font-medium font-mono">3</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--text-secondary)]">Total salaries</span>
          <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
            <Lock className="h-3 w-3" />
            <span className="font-mono">TEE(****)</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Budget check</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-1 text-xs text-[var(--accent)]"
          >
            <Shield className="h-3 w-3" />
            <span className="font-mono">Sufficient</span>
          </motion.span>
        </div>
      </div>
      <SimulatedTx
        label="Executing encrypted batch payroll for 3 employees..."
        onComplete={() => setDone(true)}
      />
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-[rgba(0,229,160,0.06)] border border-[var(--border-accent)] px-3 py-2 text-center"
          >
            <p className="text-xs text-[var(--accent)] font-medium">
              All balances updated inside TEE enclave - no salary amounts revealed
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepViewBalance() {
  const [phase, setPhase] = useState<"encrypted" | "signing" | "decrypted">("encrypted");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("signing"), 1500);
    const t2 = setTimeout(() => setPhase("decrypted"), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4 text-center">
        <p className="text-[10px] text-[var(--text-muted)] mb-1">Alice's Balance</p>
        <AnimatePresence mode="wait">
          {phase === "encrypted" && (
            <motion.div
              key="enc"
              exit={{ opacity: 0, filter: "blur(6px)" }}
              className="flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4 text-[var(--text-muted)]" />
              <span className="font-mono text-lg text-[var(--text-muted)]">****.**</span>
            </motion.div>
          )}
          {phase === "signing" && (
            <motion.div
              key="sign"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
              <span className="text-sm text-[var(--accent)]">Signing EIP-712...</span>
            </motion.div>
          )}
          {phase === "decrypted" && (
            <motion.div
              key="dec"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <span
                className="font-mono text-2xl font-bold text-[var(--accent)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                5,000.00
              </span>
              <span className="text-sm text-[var(--text-secondary)] ml-1">ETH</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="rounded-lg bg-[rgba(0,229,160,0.04)] border border-[var(--border-accent)] px-3 py-2.5">
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          Only Alice can see her own balance. The employer sees encrypted values.
          Client-side decryption using EIP-712 enclave signatures ensures true privacy.
        </p>
      </div>
    </div>
  );
}

const STEPS: DemoStep[] = [
  {
    id: "create",
    title: "Create Organization",
    description: "Employer deploys a new payroll contract on Sepolia",
    icon: Building2,
    content: <StepCreateOrg />,
  },
  {
    id: "add",
    title: "Add Employees",
    description: "Salaries are TEE-encrypted before being stored onchain",
    icon: UserPlus,
    content: <StepAddEmployees />,
  },
  {
    id: "payroll",
    title: "Run Payroll",
    description: "Batch payment executes entirely on encrypted values",
    icon: Zap,
    content: <StepRunPayroll />,
  },
  {
    id: "view",
    title: "Employee Views Balance",
    description: "Only the employee can decrypt their own balance",
    icon: Eye,
    content: <StepViewBalance />,
  },
];

export function DemoMode({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepKey, setStepKey] = useState(0);

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setStepKey((k) => k + 1);
    }
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setStepKey((k) => k + 1);
    }
  }, [currentStep]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setStepKey((k) => k + 1);
    }
  }, [isOpen]);

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <>
      {/* Demo walkthrough modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-primary)] shadow-[0_0_0_1px_rgba(0,229,160,0.05),0_8px_60px_rgba(0,0,0,0.5),0_4px_40px_rgba(0,229,160,0.06)]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />

                <div className="p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
                        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                      </div>
                      <div>
                        <h3
                          className="text-lg font-bold"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          Umbra Pay Demo
                        </h3>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Interactive walkthrough - no wallet needed
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                    >
                      <X className="h-4 w-4 text-[var(--text-muted)]" />
                    </button>
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-1.5 mb-5">
                    {STEPS.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-1.5 flex-1">
                        <div
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i <= currentStep
                              ? "bg-[var(--accent)]"
                              : "bg-[rgba(255,255,255,0.06)]"
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Current step */}
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
                        <StepIcon className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                          Step {currentStep + 1} of {STEPS.length}
                        </p>
                        <h4
                          className="text-base font-bold"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {step.title}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">
                      {step.description}
                    </p>

                    {/* Step content - animated */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={stepKey}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                      >
                        {step.content}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goPrev}
                      disabled={currentStep === 0}
                      className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </button>

                    {currentStep < STEPS.length - 1 ? (
                      <button onClick={goNext} className="btn-primary !py-2 !px-4 text-xs">
                        Next Step
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={onClose}
                        className="btn-primary !py-2 !px-4 text-xs"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        Try it for Real
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
