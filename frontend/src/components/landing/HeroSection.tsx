"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, ChevronDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { fadeUp, stagger } from "@/lib/animations";
import { Star4, Star6, CrossMark, Diamond, Dot, DotCluster } from "@/components/shared/Stars";

function StaggerText({ text, delayStart = 0 }: { text: string; delayStart?: number }) {
  return (
    <span aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: delayStart + i * 0.04,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

const HEX_FRAGMENTS = [
  "0x7f3a...",
  "0xe91c...",
  "0x2bd4...",
  "0xa0f8...",
  "0x53e7...",
  "0xd6b1...",
  "0x9c42...",
  "0x1fa9...",
  "0xbb07...",
  "0x4e5d...",
  "0xf2c3...",
  "0x68a0...",
];

function FloatingParticles() {
  const particles = useMemo(
    () =>
      HEX_FRAGMENTS.map((hex, i) => ({
        hex,
        x: `${5 + (i % 6) * 16 + Math.random() * 8}%`,
        y: `${8 + Math.floor(i / 6) * 45 + Math.random() * 30}%`,
        delay: i * 0.7,
        duration: 12 + Math.random() * 8,
        drift: 20 + Math.random() * 30,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute font-mono text-[10px] text-[var(--accent)] select-none"
          style={{ left: p.x, top: p.y, opacity: 0 }}
          animate={{
            opacity: [0, 0.12, 0.12, 0],
            y: [0, -p.drift],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        >
          {p.hex}
        </motion.span>
      ))}
    </div>
  );
}

function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        animate={{
          opacity: [0.06, 0.12, 0.06],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px]"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 35%, rgba(0,229,160,0.10) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
    >
      <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-[var(--nav-height)]">
      <AuroraBackground />
      <FloatingParticles />

      <Star4 className="top-[18%] left-[8%]" size={20} opacity={0.15} pulse delay={0} />
      <Star4 className="top-[12%] right-[10%]" size={14} opacity={0.1} rotate delay={1.5} />
      <Star6 className="top-[35%] left-[5%]" size={18} opacity={0.07} rotate delay={0.5} />

      <div className="relative z-10 mx-auto max-w-[var(--max-width)] px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] mt-7 px-4 py-1.5 backdrop-blur-sm">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
              />
              <span className="text-xs font-medium tracking-wide text-[var(--accent)]">
                Flare Confidential Compute (FCC)
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="max-w-6xl text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl lg:text-[8.5rem]"
            style={{ fontFamily: "var(--font-display), system-ui" }}
          >
            <StaggerText text="Private" delayStart={0.3} />
            <span className="inline-block ml-[0.3em]">
              <motion.span
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
                className="inline-block"
              >
                Payroll
              </motion.span>
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
              className="gradient-text inline-block"
            >
              Onchain.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg lg:text-xl"
          >
            Confidential payroll powered by TEE Enclaves. Coston2 coordination logic paired with Ethereum Sepolia native ETH settlement.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex items-center gap-4 pt-2"
          >
            <Link href="/dashboard" className="btn-primary !py-3.5 !px-8 text-base">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="btn-secondary !py-3.5 !px-8 text-base">
              How it Works
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={4}
            className="flex items-center gap-6 pt-2 text-xs text-[var(--text-muted)]"
          >
            {["Coston2 (114) & Sepolia", "Flare TEE Enclave", "Native ETH Payouts"].map((t, i) => (
              <span key={t} className="flex items-center gap-2">
                {i > 0 && <span className="h-3 w-px bg-[var(--border)]" />}
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <HeroPayslip />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-deep)] to-transparent z-10" />
      <ScrollIndicator />
    </section>
  );
}

type PayslipPhase = "exposed" | "encrypting" | "encrypted";

const PHASE_DURATIONS = {
  exposed: 2200,
  encrypting: 2500,
  encrypted: 3300,
};

const PAYSLIP_ROWS = [
  { label: "Employee", value: "0x7a3...f92e", encrypted: "••••••••" },
  { label: "Salary", value: "1.50 ETH", encrypted: "••••••••" },
  { label: "Sepolia Balance", value: "3.00 ETH", encrypted: "••••••••" },
];

function HeroPayslip() {
  const [phase, setPhase] = useState<PayslipPhase>("exposed");

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let current: PayslipPhase = "exposed";

      const cycle = () => {
        setPhase(current);
        const duration = PHASE_DURATIONS[current];
        setTimeout(() => {
          if (current === "exposed") current = "encrypting";
          else if (current === "encrypting") current = "encrypted";
          else current = "exposed";
          cycle();
        }, duration);
      };

      cycle();
    }, 1200);

    return () => clearTimeout(startTimeout);
  }, []);

  const borderColor =
    phase === "exposed"
      ? "rgba(239,68,68,0.3)"
      : phase === "encrypting"
      ? "rgba(234,179,8,0.3)"
      : "rgba(0,229,160,0.3)";

  const statusColor =
    phase === "exposed"
      ? "#ef4444"
      : phase === "encrypting"
      ? "#eab308"
      : "#00e5a0";

  const statusLabel =
    phase === "exposed"
      ? "Exposed"
      : phase === "encrypting"
      ? "TEE Syncing..."
      : "Confidential";

  const StatusIcon = phase === "exposed" ? Eye : phase === "encrypting" ? EyeOff : Lock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
      className="relative mx-auto mt-20 max-w-2xl"
    >
      <motion.div
        className="overflow-hidden rounded-2xl backdrop-blur-sm"
        animate={{
          borderColor: borderColor,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          border: `1px solid ${borderColor}`,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Umbra Pay Coston2 Payroll
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Chain ID 114 (Coordination) & 11155111 (Sepolia)
              </p>
            </div>
          </div>

          <motion.div className="flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <StatusIcon className="h-3 w-3" style={{ color: statusColor }} />
            <span className="text-[11px] font-medium" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </motion.div>
        </div>

        <div className="px-6 py-4 space-y-2.5">
          {PAYSLIP_ROWS.map((row, i) => (
            <PayslipRow
              key={row.label}
              label={row.label}
              plaintext={row.value}
              phase={phase}
              index={i}
            />
          ))}
        </div>

        <div className="relative px-6 pb-4 overflow-hidden">
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 relative z-10">
            <Lock className="h-3 w-3" />
            {phase === "exposed"
              ? "Warning: plaintext data on public explorer"
              : phase === "encrypting"
              ? "Syncing payload into Flare TEE Enclave..."
              : "Only authenticated employee signature can query balance"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PayslipRow({
  label,
  plaintext,
  phase,
  index,
}: {
  label: string;
  plaintext: string;
  phase: PayslipPhase;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0 + index * 0.12 }}
      className="flex items-center justify-between rounded-xl px-4 py-3 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <span className="text-sm text-[var(--text-secondary)] relative z-10">
        {label}
      </span>
      <span className="font-mono text-sm text-[var(--accent)]">
        {phase === "exposed" ? plaintext : "0x" + Math.random().toString(16).slice(2, 10)}
      </span>
    </motion.div>
  );
}
