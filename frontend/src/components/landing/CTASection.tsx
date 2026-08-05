"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, User } from "lucide-react";
import Link from "next/link";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export function CTASection() {
  return (
    <section className="relative py-32 sm:py-40 overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,229,160,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Pulsing orb */}
        <div className="relative mx-auto mb-14 flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
          {/* Ring 1 - outermost, slowest pulse */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(0, 229, 160, 0.12)",
            }}
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Ring 2 - middle */}
          <motion.div
            className="absolute inset-4 rounded-full sm:inset-5"
            style={{
              border: "1px solid rgba(0, 229, 160, 0.2)",
            }}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.5, 0.1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Ring 3 - innermost, fastest pulse */}
          <motion.div
            className="absolute inset-8 rounded-full sm:inset-10"
            style={{
              border: "1.5px solid rgba(0, 229, 160, 0.3)",
              boxShadow: "0 0 30px rgba(0, 229, 160, 0.08)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.7, 0.2, 0.7],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Center glow backdrop */}
          <motion.div
            className="absolute h-16 w-16 rounded-full sm:h-20 sm:w-20"
            style={{
              background:
                "radial-gradient(circle, rgba(0,229,160,0.15) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Shield icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.2 }}
          >
            <Shield className="h-10 w-10 text-[var(--accent)] sm:h-12 sm:w-12" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="mb-4 text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="gradient-text">Ready?</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.1 }}
          className="mx-auto mb-12 max-w-lg text-base text-[var(--text-secondary)] sm:text-lg"
        >
          Deploy your encrypted organization contract and start running
          fully private payroll in minutes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.2 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/dashboard"
            className="btn-primary group !py-3.5 !px-10 text-base"
          >
            Launch App
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/employee"
            className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-transparent px-8 py-3.5 text-base font-medium text-[var(--text-primary)] transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <User className="h-4.5 w-4.5" />
            Employee Portal
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
          </Link>
        </motion.div>

        {/* Footer line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 text-xs tracking-wide text-[var(--text-muted)]"
        >
          Powered by{" "}
          <span className="text-[var(--text-secondary)]">Flare TEE Enclave</span>
          {" "}&middot;{" "}
          Built on{" "}
          <span className="text-[var(--text-secondary)]">Ethereum</span>
        </motion.p>
      </div>
    </section>
  );
}
