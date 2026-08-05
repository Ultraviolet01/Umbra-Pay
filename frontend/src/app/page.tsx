"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useInView,
} from "framer-motion";
import Link from "next/link";
import {
  Lock,
  Shield,
  Zap,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronDown,
  Users,
  Sparkles,
  Building2,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Navbar } from "@/components/landing/Navbar";
import { Star4, Star6, CrossMark, Diamond, Dot, DotCluster } from "@/components/shared/Stars";

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Floating encrypted hex particles ────────────────────────────────────────

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        text: `0x${Math.random().toString(16).slice(2, 8)}`,
        left: `${5 + Math.random() * 90}%`,
        top: `${5 + Math.random() * 90}%`,
        duration: 12 + Math.random() * 20,
        delay: Math.random() * 6,
        size: 9 + Math.random() * 3,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.12, 0.06, 0.12, 0],
            y: [0, -60, -30, -80, -120],
            x: [0, 10, -8, 14, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
          className="absolute font-mono text-[#00e5a0]/20 select-none"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
          }}
        >
          {p.text}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Aurora / mesh glow behind hero ──────────────────────────────────────────

function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Primary aurora sweep */}
      <motion.div
        animate={{
          opacity: [0.04, 0.1, 0.06, 0.1, 0.04],
          scale: [1, 1.08, 1.02, 1.06, 1],
          rotate: [0, 2, -1, 1.5, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1400px] h-[1000px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 35%, rgba(0,229,160,0.12) 0%, rgba(0,229,160,0.03) 40%, transparent 70%)",
        }}
      />
      {/* Secondary side glow */}
      <motion.div
        animate={{
          opacity: [0.02, 0.06, 0.02],
          x: [-40, 40, -40],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] left-[15%] w-[600px] h-[600px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,229,160,0.06) 0%, transparent 60%)",
        }}
      />
      <motion.div
        animate={{
          opacity: [0.02, 0.05, 0.02],
          x: [30, -30, 30],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[10%] w-[500px] h-[500px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,229,160,0.05) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

// ─── Minimal fixed nav ───────────────────────────────────────────────────────

function NavMinimal() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: scrolled ? 1 : 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#09090b]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)]"
          : "bg-transparent pointer-events-none"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />
        <Link
          href="/dashboard"
          className="btn-primary !py-2.5 !px-6 text-sm pointer-events-auto"
        >
          Launch App <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.nav>
  );
}

// ─── Scroll progress dots (right side) ───────────────────────────────────────

function ScrollDots({ active }: { active: number }) {
  const labels = ["Intro", "Problem", "Solution", "Steps", "Go"];
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3">
      {labels.map((label, i) => (
        <button
          key={i}
          onClick={() => {
            const sections = document.querySelectorAll(".snap-section");
            sections[i]?.scrollIntoView({ behavior: "smooth" });
          }}
          className="group flex items-center gap-3"
          aria-label={`Go to ${label} section`}
        >
          <span
            className={`text-[9px] font-bold uppercase tracking-wider transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 ${
              active === i ? "text-[#00e5a0]" : "text-[var(--text-muted)]"
            }`}
          >
            {label}
          </span>
          <motion.div
            animate={{
              height: active === i ? 28 : 8,
              backgroundColor:
                active === i ? "#00e5a0" : "rgba(255,255,255,0.12)",
            }}
            transition={{ duration: 0.4, ease: EASE }}
            className="w-[3px] rounded-full"
          />
        </button>
      ))}
    </div>
  );
}

// ─── Staggered letter animation for "Private" ───────────────────────────────

function StaggerText({
  text,
  className,
  delayStart = 0,
}: {
  text: string;
  className?: string;
  delayStart?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: delayStart + i * 0.04,
            duration: 0.6,
            ease: EASE,
          }}
          className="inline-block"
          style={{ display: char === " " ? "inline" : "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

// ─── Danger table: public salary exposure ────────────────────────────────────

function DangerTable({ visible }: { visible: boolean }) {
  const rows = [
    { addr: "0x1a2b...9f0e", amount: "$5,000/mo", label: "Engineer" },
    { addr: "0x3c4d...7a8b", amount: "$4,500/mo", label: "Designer" },
    { addr: "0x5e6f...3c2d", amount: "$8,200/mo", label: "CTO" },
    { addr: "0x7a8b...1c0d", amount: "$6,100/mo", label: "VP Eng" },
    { addr: "0x9e0f...5d4c", amount: "$3,800/mo", label: "Intern" },
  ];

  return (
    <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-red-500/10 bg-red-500/[0.04]">
        <Eye className="h-4 w-4 text-red-400" />
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
          Public Blockchain Explorer
        </span>
      </div>
      {rows.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -30 }}
          animate={visible ? { opacity: 1, x: 0 } : {}}
          transition={{
            delay: 0.6 + i * 0.2,
            duration: 0.6,
            ease: EASE,
          }}
          className="flex items-center justify-between px-4 py-2.5 border-t border-red-500/[0.06] font-mono text-xs"
        >
          <div className="flex items-center gap-3">
            <span className="text-red-300/50">{row.addr}</span>
            <span className="text-[10px] text-red-400/40 font-sans">
              {row.label}
            </span>
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ delay: 0.9 + i * 0.2, duration: 0.4 }}
            className="text-red-400 font-semibold"
          >
            {row.amount}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Cinematic encrypting payslip ────────────────────────────────────────────

function CinematicPayslip({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"plain" | "encrypting" | "encrypted">(
    "plain"
  );

  useEffect(() => {
    if (!visible) {
      setPhase("plain");
      return;
    }
    const t1 = setTimeout(() => setPhase("encrypting"), 800);
    const t2 = setTimeout(() => setPhase("encrypted"), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible]);

  const rows = [
    { label: "Employee", plain: "Alice Johnson", enc: "0x7f3a...c1b2" },
    { label: "Salary", plain: "$5,000.00/mo", enc: "0xe91d...8f3a" },
    { label: "Department", plain: "Engineering", enc: "0x9e2d...a4f8" },
    { label: "YTD Total", plain: "$15,000.00", enc: "0xb4c7...2e5d" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 1, ease: EASE }}
      className="relative w-full max-w-sm mx-auto"
    >
      {/* Outer glow */}
      <motion.div
        animate={
          phase === "encrypted"
            ? {
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1],
              }
            : phase === "plain"
              ? { opacity: 0.02 }
              : { opacity: [0.04, 0.12, 0.04] }
        }
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute inset-0 -m-12 rounded-3xl blur-[80px] ${
          phase === "plain" ? "bg-red-500" : "bg-[#00e5a0]"
        }`}
      />

      <div
        className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.5)] transition-colors duration-700 ${
          phase === "plain"
            ? "border-red-500/20 bg-[#0a0a0f]/95"
            : "border-[rgba(0,229,160,0.15)] bg-[#0a0a0f]/95"
        }`}
      >
        {/* Top accent line */}
        <div
          className={`h-px w-full transition-all duration-700 ${
            phase === "plain"
              ? "bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"
              : "bg-gradient-to-r from-transparent via-[#00e5a0] to-transparent opacity-60"
          }`}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors duration-700 ${
                  phase === "plain"
                    ? "bg-red-500/10"
                    : "bg-[rgba(0,229,160,0.1)]"
                }`}
              >
                {phase === "plain" ? (
                  <Eye className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-[#00e5a0]" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold text-white">
                  March Payslip
                </p>
                <p className="text-[9px] text-[var(--text-muted)]">Acme Corp</p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                  phase === "encrypted"
                    ? "bg-[rgba(0,229,160,0.12)] text-[#00e5a0]"
                    : phase === "encrypting"
                      ? "bg-[rgba(255,200,0,0.1)] text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                }`}
              >
                {phase === "encrypted" ? (
                  <Lock className="h-2.5 w-2.5" />
                ) : phase === "encrypting" ? (
                  <Sparkles className="h-2.5 w-2.5" />
                ) : (
                  <Eye className="h-2.5 w-2.5" />
                )}
                {phase === "encrypted"
                  ? "ENCRYPTED"
                  : phase === "encrypting"
                    ? "ENCRYPTING..."
                    : "EXPOSED"}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Data rows */}
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2.5 border-t border-[rgba(255,255,255,0.04)]"
            >
              <span className="text-[10px] text-[var(--text-muted)]">
                {row.label}
              </span>
              <AnimatePresence mode="wait">
                {phase === "plain" ? (
                  <motion.span
                    key="plain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      filter: "blur(12px)",
                      scale: 0.9,
                    }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="text-xs font-mono text-red-300 font-medium"
                  >
                    {row.plain}
                  </motion.span>
                ) : phase === "encrypting" ? (
                  <motion.span
                    key="encrypting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.12,
                    }}
                    className="text-xs font-mono text-yellow-400"
                  >
                    {"█".repeat(6 + i)}
                  </motion.span>
                ) : (
                  <motion.span
                    key="encrypted"
                    initial={{ opacity: 0, x: 8, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      delay: i * 0.1,
                      duration: 0.5,
                      ease: EASE,
                    }}
                    className="flex items-center gap-1.5 text-xs font-mono text-[#00e5a0]"
                  >
                    <motion.span
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: i * 0.1 + 0.15,
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      <Lock className="h-2.5 w-2.5" />
                    </motion.span>
                    {row.enc}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Encrypted stamp */}
        <AnimatePresence>
          {phase === "encrypted" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.4,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="border-2 border-[#00e5a0]/40 rounded-lg px-5 py-2">
                <span className="text-[#00e5a0]/60 text-xl font-black tracking-[0.3em] uppercase">
                  ENCRYPTED
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[var(--text-muted)] font-mono">
              Block #18,294,021
            </span>
            <span className="text-[9px] text-[#00e5a0] font-bold">
              Flare TEE
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Horizontal timeline step ────────────────────────────────────────────────

function TimelineStep({
  step,
  index,
  isActive,
}: {
  step: { icon: React.ElementType; title: string; desc: string };
  index: number;
  isActive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
      transition={{ delay: 0.3 + index * 0.2, duration: 0.7, ease: EASE }}
      className="flex flex-col items-center text-center flex-1 relative"
    >
      {/* Circle with icon */}
      <motion.div
        animate={
          isActive
            ? {
                borderColor: "#00e5a0",
                boxShadow: "0 0 30px rgba(0,229,160,0.2)",
              }
            : {
                borderColor: "rgba(255,255,255,0.08)",
                boxShadow: "0 0 0px rgba(0,0,0,0)",
              }
        }
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-[#09090b] mb-5"
      >
        <motion.div
          animate={isActive ? { scale: 1 } : { scale: 0.8 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <step.icon
            className={`h-7 w-7 transition-colors duration-500 ${
              isActive ? "text-[#00e5a0]" : "text-[var(--text-muted)]"
            }`}
          />
        </motion.div>

        {/* Step number badge */}
        <motion.span
          animate={
            isActive
              ? { backgroundColor: "#00e5a0", color: "#09090b" }
              : {
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.3)",
                }
          }
          transition={{ duration: 0.4 }}
          className="absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
        >
          {index + 1}
        </motion.span>
      </motion.div>

      <h3
        className={`font-bold text-sm mb-1.5 transition-colors duration-500 ${
          isActive ? "text-white" : "text-[var(--text-muted)]"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {step.title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[160px]">
        {step.desc}
      </p>
    </motion.div>
  );
}

function AnimatedTimeline({ visible }: { visible: boolean }) {
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!visible) {
      setActiveStep(-1);
      return;
    }
    const timers = [
      setTimeout(() => setActiveStep(0), 400),
      setTimeout(() => setActiveStep(1), 900),
      setTimeout(() => setActiveStep(2), 1400),
      setTimeout(() => setActiveStep(3), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const steps = [
    {
      icon: Building2,
      title: "Create Org",
      desc: "Deploy your payroll contract in one click.",
    },
    {
      icon: Users,
      title: "Add Employees",
      desc: "Salaries encrypted before they hit the chain.",
    },
    {
      icon: Zap,
      title: "Run Payroll",
      desc: "One click. Math on ciphertext. Zero leaks.",
    },
    {
      icon: Wallet,
      title: "Decrypt & Withdraw",
      desc: "Only you can see your own balance.",
    },
  ];

  // Line progress: 0 to 100%
  const lineProgress =
    activeStep < 0 ? 0 : ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Timeline container */}
      <div className="relative">
        {/* Connecting line (behind circles) */}
        <div className="hidden sm:block absolute top-8 left-[12.5%] right-[12.5%] h-[2px] bg-[rgba(255,255,255,0.04)]">
          <motion.div
            animate={{ width: `${lineProgress}%` }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute top-0 left-0 h-full bg-[#00e5a0] rounded-full"
            style={{
              boxShadow: "0 0 12px rgba(0,229,160,0.4)",
            }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-4">
          {steps.map((step, i) => (
            <TimelineStep
              key={step.title}
              step={step}
              index={i}
              isActive={i <= activeStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pulsing green orb for CTA ──────────────────────────────────────────────

function PulsingOrb() {
  return (
    <div className="relative mx-auto mb-10 h-32 w-32 flex items-center justify-center">
      {/* Outermost ring pulse */}
      <motion.div
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.06, 0, 0.06],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-[#00e5a0]"
      />
      {/* Middle ring */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.08, 0.02, 0.08],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
        className="absolute inset-4 rounded-full bg-[#00e5a0]"
      />
      {/* Inner solid glow */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-8 rounded-full bg-[#00e5a0] blur-xl"
      />
      {/* Center icon */}
      <div className="relative z-10 h-16 w-16 rounded-full bg-[rgba(0,229,160,0.1)] border border-[rgba(0,229,160,0.2)] flex items-center justify-center">
        <Shield className="h-8 w-8 text-[#00e5a0]" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LandingA() {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Section visibility refs
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);

  const section2InView = useInView(section2Ref, { amount: 0.5 });
  const section3InView = useInView(section3Ref, { amount: 0.5 });
  const section4InView = useInView(section4Ref, { amount: 0.5 });

  // Track which section is visible via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) setActiveSection(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll(".snap-section");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-y-auto bg-[#09090b]"
      style={{
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
      }}
    >
      <Navbar />
      <ScrollDots active={activeSection} />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO - Massive typography + aurora + particles
         ══════════════════════════════════════════════════════════════════════ */}
      <section
        data-index={0}
        className="snap-section relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        <AuroraBackground />
        <FloatingParticles />

        {/* Decorative stars */}
        <Star4 className="top-[18%] left-[8%]" size={28} opacity={0.15} pulse delay={0} />
        <Star4 className="top-[12%] right-[10%]" size={22} opacity={0.1} rotate delay={1.5} />
        <Star6 className="top-[35%] left-[5%]" size={26} opacity={0.07} rotate delay={0.5} />
        <Star4 className="bottom-[30%] right-[7%]" size={32} opacity={0.12} pulse delay={2} />
        <CrossMark className="top-[25%] right-[18%]" size={16} opacity={0.1} rotate delay={0.8} />
        <CrossMark className="top-[45%] left-[12%]" size={14} opacity={0.08} delay={2.5} />
        <Diamond className="top-[20%] right-[25%]" size={10} opacity={0.12} pulse delay={1} />
        <Diamond className="bottom-[35%] left-[15%]" size={12} opacity={0.1} float delay={0.3} />
        <Dot className="top-[30%] left-[20%]" size={5} opacity={0.2} pulse delay={0.5} />
        <Dot className="top-[15%] right-[30%]" size={6} opacity={0.15} pulse delay={1.8} />
        <Dot className="bottom-[25%] right-[15%]" size={5} opacity={0.18} pulse delay={2.2} />
        <DotCluster className="top-[40%] right-[5%]" opacity={0.1} delay={1.2} />
        <Star6 className="top-[8%] left-[35%]" size={24} opacity={0.08} rotate delay={0.4} />
<Star4 className="top-[55%] right-[28%]" size={20} opacity={0.1} pulse delay={1.3} />
<Star6 className="bottom-[12%] left-[40%]" size={30} opacity={0.09} rotate delay={2.1} />

<CrossMark className="top-[60%] right-[12%]" size={15} opacity={0.08} rotate delay={0.7} />

<Diamond className="top-[50%] left-[30%]" size={11} opacity={0.11} float delay={0.6} />
<Diamond className="bottom-[8%] right-[32%]" size={13} opacity={0.1} pulse delay={2.4} />

<Dot className="top-[70%] left-[10%]" size={5} opacity={0.2} pulse delay={1.1} />
<Dot className="top-[5%] right-[45%]" size={6} opacity={0.16} pulse delay={0.9} />

<DotCluster className="bottom-[10%] right-[5%]" opacity={0.09} delay={0.5} />

        {/* Subtle grid lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative text-center max-w-6xl z-10">
          {/* Main headline */}
          <h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem] font-bold tracking-[-0.04em] leading-[0.88] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="block">
              <StaggerText text="Private" delayStart={0.3} />
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
              >
                {" "}
                Payroll
              </motion.span>
            </span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
              className="block gradient-text"
            >
              Onchain.
            </motion.span>
          </h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8, ease: EASE }}
            className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            End-to-end encrypted payroll on Ethereum.
            <br className="hidden sm:block" />
            Salaries nobody can see. Payments everyone can trust.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8, ease: EASE }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="btn-primary !py-3.5 !px-10 text-base"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/employee"
              className="btn-secondary !py-3.5 !px-10 text-base"
            >
              Employee Portal
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-10 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">
              Scroll
            </span>
            <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2: THE PROBLEM - feel the pain of public salaries
         ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="problem"
        ref={section2Ref}
        data-index={1}
        className="snap-section relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Red ambient danger glow */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={
              section2InView
                ? { opacity: [0.02, 0.06, 0.02] }
                : { opacity: 0 }
            }
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(239,68,68,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: danger table */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <DangerTable visible={section2InView} />
          </motion.div>

          {/* Right: the uncomfortable truth */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-red-400 text-xs font-bold uppercase tracking-[0.3em] mb-6"
            >
              The Problem
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your CTO earns{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                $8,200/mo.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.8, ease: EASE }}
              className="text-2xl sm:text-3xl font-semibold text-white/70 mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your intern knows.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
              className="text-base text-[var(--text-secondary)] leading-relaxed max-w-md"
            >
              On a public blockchain, every salary, every raise, every payment
              is visible to anyone with a block explorer. Competitors,
              employees, and strangers can see it all.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3: THE TRANSFORMATION - watch it encrypt
         ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="solution"
        ref={section3Ref}
        data-index={2}
        className="snap-section relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Green ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={
              section3InView
                ? { opacity: [0.02, 0.06, 0.02] }
                : { opacity: 0 }
            }
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,229,160,0.06) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-[#00e5a0] text-xs font-bold uppercase tracking-[0.3em] mb-4"
          >
            The Solution
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
            className="text-4xl sm:text-5xl font-bold leading-[1.05] mb-12"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Watch it{" "}
            <span className="gradient-text">disappear</span>
          </motion.h2>

          {/* The encrypting payslip - center stage */}
          <CinematicPayslip visible={section3InView} />

          {/* Tagline below card */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
            className="mt-10 text-lg sm:text-xl text-[var(--text-secondary)] max-w-lg mx-auto"
          >
            Not even validators can see your salary.
          </motion.p>

          {/* Mini trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
            className="mt-6 flex items-center justify-center gap-8 text-xs text-[var(--text-muted)]"
          >
            {[
              { icon: Lock, text: "TEE Enclave" },
              { icon: EyeOff, text: "Zero data leaks" },
              { icon: Shield, text: "100% on-chain" },
            ].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <badge.icon className="h-3 w-3 text-[#00e5a0]/60" />
                {badge.text}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4: HOW IT WORKS - animated horizontal timeline
         ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        ref={section4Ref}
        data-index={3}
        className="snap-section relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="relative max-w-5xl mx-auto w-full">
          <div className="text-center mb-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-[#00e5a0] text-xs font-bold uppercase tracking-[0.3em] mb-4"
            >
              How It Works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
              className="text-4xl sm:text-5xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Four steps to{" "}
              <span className="gradient-text">privacy</span>
            </motion.h2>
          </div>

          <AnimatedTimeline visible={section4InView} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5: CTA - close the deal
         ══════════════════════════════════════════════════════════════════════ */}
      <section
        data-index={4}
        className="snap-section relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Big central glow */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              opacity: [0.03, 0.1, 0.03],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(0,229,160,0.12) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <PulsingOrb />

            <h2
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8, ease: EASE }}
                className="gradient-text"
              >
                Ready?
              </motion.span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
              className="text-lg text-[var(--text-secondary)] mb-12 max-w-xl mx-auto"
            >
              Deploy private payroll in minutes using Flare confidential compute. Your team
              deserves confidential compensation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/dashboard"
                className="btn-primary !py-4 !px-12 text-base group"
              >
                Launch App{" "}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/employee"
                className="btn-secondary !py-4 !px-12 text-base"
              >
                Employee Portal
              </Link>
            </motion.div>

            {/* Powered by line */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 1 }}
              className="mt-16 text-xs text-[var(--text-muted)]"
            >
              Powered by Flare TEE Enclave &middot; Built on Ethereum
            </motion.p>
          </motion.div>
        </div>

        {/* Footer pinned to bottom of last section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[rgba(255,255,255,0.04)] py-6 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              Umbra Pay &mdash; Privacy-first on-chain payroll
            </p>
            <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
              <Link
                href="/dashboard"
                className="hover:text-[#00e5a0] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/employee"
                className="hover:text-[#00e5a0] transition-colors"
              >
                Employee Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
