"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Zap, EyeOff, Eye } from "lucide-react";
import { fadeUp, stagger } from "@/lib/animations";
import { useState, useEffect } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const SECURITY_POINTS = [
  { icon: Lock, text: "Salaries calculated confidentially inside Flare TEE Enclave" },
  { icon: Zap, text: "Coston2 coordination chain stores encrypted state payloads" },
  { icon: EyeOff, text: "Only authorized employee wallet signatures decrypt balance queries" },
  { icon: Shield, text: "Native ETH payout settlement signed directly by TEE Enclave on Sepolia" },
];

export function SecuritySection() {
  return (
    <section id="security" className="section-padding relative overflow-hidden">
      <div className="mx-auto max-w-[var(--max-width)] px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)]"
            >
              Advanced TEE Privacy
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mb-5 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Confidential Payroll,
              <br />
              <span className="text-[var(--text-secondary)]">
                On-Chain Verification.
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mb-10 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              Using Flare Confidential Compute (FCC) TEE Enclaves, payroll calculations and balance state remain completely private. Native ETH payouts are settled securely on Ethereum Sepolia.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="space-y-4">
              {SECURITY_POINTS.map((point, i) => (
                <motion.div
                  key={point.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: EASE }}
                  className="group flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,229,160,0.08)] group-hover:bg-[rgba(0,229,160,0.15)] transition-colors duration-300">
                    <point.icon className="h-3.5 w-3.5 text-[var(--accent)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                    {point.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Encryption Flow Visualization */}
          <EncryptionFlow />
        </div>
      </div>
    </section>
  );
}

/** Encryption & TEE Attestation Flow Visualization */
function EncryptionFlow() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    { label: "Encrypted Input", sub: "Payload stored on Coston2 (114)", icon: Eye, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "TEE Compute", sub: "Flare Confidential Compute Enclave", icon: Lock, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { label: "Solvency Proof", sub: "Signed TEE attestation audit proof", icon: Zap, color: "text-[var(--accent)]", bg: "bg-[rgba(0,229,160,0.1)]", border: "border-[rgba(0,229,160,0.2)]" },
    { label: "Sepolia Payout", sub: "Enclave settles native ETH on Sepolia", icon: Shield, color: "text-[var(--accent)]", bg: "bg-[rgba(0,229,160,0.1)]", border: "border-[rgba(0,229,160,0.2)]" },
  ];

  const current = stages[stage];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative w-full max-w-md lg:ml-auto"
    >
      <motion.div
        animate={{
          opacity: stage >= 2 ? [0.05, 0.15, 0.05] : [0.02, 0.05, 0.02],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute inset-0 -m-8 rounded-3xl blur-[60px] ${
          stage === 0 ? "bg-red-500" : stage === 1 ? "bg-yellow-400" : "bg-[#00e5a0]"
        }`}
      />

      <div className="relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.4)]">
        <div
          className={`h-px w-full transition-all duration-700 ${
            stage === 0
              ? "bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"
              : stage === 1
                ? "bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"
                : "bg-gradient-to-r from-transparent via-[#00e5a0] to-transparent opacity-60"
          }`}
        />

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            {stages.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === stage ? 24 : 6,
                  backgroundColor: i <= stage ? "#00e5a0" : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.4, ease: EASE }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>

          <div className="flex justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={`relative flex h-20 w-20 items-center justify-center rounded-2xl ${current.bg} border ${current.border}`}
              >
                <current.icon className={`h-10 w-10 ${current.color}`} />
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-6"
            >
              <h4 className="text-base font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                {current.label}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">{current.sub}</p>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-2">
            {["Employee Payload", "Enclave State", "Sepolia Settlement"].map((field, i) => (
              <div
                key={field}
                className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.02)] px-3 py-2"
              >
                <span className="text-[11px] text-[var(--text-muted)]">{field}</span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--accent)]">
                  <Lock className="h-2.5 w-2.5" />
                  0x{Math.random().toString(16).slice(2, 10)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)]">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-[var(--text-muted)] font-mono">Flare Confidential Compute (FCC)</span>
            <span className="text-[var(--accent)] font-bold">TEE Attestation</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
