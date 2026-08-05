"use client";

import { motion } from "framer-motion";
import { Lock, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ opacity: [0.03, 0.07, 0.03], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
          style={{
            background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,229,160,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg">
        {/* Encrypted 404 icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative mx-auto mb-8"
        >
          {/* Pulsing rings */}
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.08, 0, 0.08] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 -m-6 rounded-full bg-[#00e5a0]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.02, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
            className="absolute inset-0 -m-3 rounded-full bg-[#00e5a0]"
          />

          <div className="relative h-24 w-24 mx-auto rounded-2xl bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.15)] flex items-center justify-center">
            <Lock className="h-10 w-10 text-[#00e5a0]" />
          </div>
        </motion.div>

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: EASE }}
          className="mb-4"
        >
          <span
            className="text-8xl sm:text-9xl font-bold tracking-[-0.04em] gradient-text"
            style={{ fontFamily: "var(--font-display)" }}
          >
            404
          </span>
        </motion.div>

        {/* Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: EASE }}
          className="text-2xl sm:text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page not found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: EASE }}
          className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed"
        >
          This page might have been encrypted a little too well.
        </motion.p>

        {/* Encrypted address bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] px-4 py-2 mb-8"
        >
          <Lock className="h-3 w-3 text-[var(--text-muted)]" />
          <span className="font-mono text-xs text-[var(--text-muted)]">
            TEE(
            <motion.span
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[#00e5a0]"
            >
              page_not_found
            </motion.span>
            )
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8, ease: EASE }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/" className="btn-primary !py-3 !px-6 text-sm">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link href="/dashboard" className="btn-secondary !py-3 !px-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 text-xs text-[var(--text-muted)]"
      >
        Umbra Pay - Privacy-first on-chain payroll
      </motion.p>
    </div>
  );
}
