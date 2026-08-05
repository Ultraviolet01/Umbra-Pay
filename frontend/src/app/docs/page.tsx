"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  User,
  Shield,
  Lock,
  Cpu,
  Layers,
  HelpCircle,
  ChevronRight,
  Check,
  Copy,
  Info,
  Lightbulb,
  CheckCircle2,
  Menu,
  X,
  ArrowLeft,
  FileText,
  FileDown,
  Calculator,
  Search,
  CreditCard,
  Eye,
  Globe,
  CalendarDays,
  Zap,
  PartyPopper,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";

/* ─── Documentation Section Metadata ─── */
const sections = [
  { id: "getting-started", label: "Getting Started", icon: <BookOpen className="w-4 h-4" /> },
  { id: "for-employers", label: "For Employers", icon: <Building2 className="w-4 h-4" /> },
  { id: "for-employees", label: "For Employees", icon: <User className="w-4 h-4" /> },
  { id: "smart-contracts", label: "Smart Contracts", icon: <Shield className="w-4 h-4" /> },
  { id: "tee-privacy", label: "TEE Privacy & FCC", icon: <Lock className="w-4 h-4" /> },
  { id: "features", label: "Features", icon: <Cpu className="w-4 h-4" /> },
  { id: "use-cases", label: "Use Cases", icon: <Layers className="w-4 h-4" /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
];

/* ─── Code Block Component ─── */
function CodeBlock({ code, language = "solidity" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightSyntax = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, i) => {
      let highlighted = line
        .replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="code-string">$1</span>')
        .replace(
          /\b(import|from|export|const|let|var|function|return|async|await|new|if|else|for|while|class|extends|implements|interface|type|enum|public|private|protected|static|readonly|void|null|undefined|true|false|pragma|solidity|contract|mapping|address|uint256|event|emit|require|msg|this|memory|storage|calldata|external|internal|view|pure|payable|returns)\b/g,
          '<span class="code-keyword">$1</span>'
        )
        .replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="code-function">$1</span>')
        .replace(/\b(UmbraOrg|UmbraOrgFactory|bytes32|uint256|address)\b/g, '<span class="code-type">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

      return (
        <div key={i} className="table-row">
          <span className="table-cell pr-4 text-right select-none" style={{ color: "var(--text-muted)", minWidth: 32, fontSize: 12 }}>
            {i + 1}
          </span>
          <span className="table-cell" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      );
    });
  };

  return (
    <div className="relative group rounded-xl border overflow-hidden my-4" style={{ background: "#0c0c10", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.015)" }}>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-sm" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace", lineHeight: 1.7 }}>
        <div className="table w-full">{highlightSyntax(code)}</div>
      </div>
      <style jsx>{`
        :global(.code-keyword) { color: #c792ea; }
        :global(.code-string) { color: #c3e88d; }
        :global(.code-comment) { color: #546e7a; font-style: italic; }
        :global(.code-function) { color: #82aaff; }
        :global(.code-type) { color: #ffcb6b; }
        :global(.code-number) { color: #f78c6c; }
      `}</style>
    </div>
  );
}

function TipBox({ children, variant = "info" }: { children: React.ReactNode; variant?: "info" | "tip" | "warning" }) {
  const styles = {
    info: { border: "var(--border-accent)", bg: "rgba(0,229,160,0.04)", icon: <Info className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} /> },
    tip: { border: "rgba(130,170,255,0.2)", bg: "rgba(130,170,255,0.04)", icon: <Lightbulb className="w-4 h-4 shrink-0" style={{ color: "#82aaff" }} /> },
    warning: { border: "rgba(255,203,107,0.2)", bg: "rgba(255,203,107,0.04)", icon: <Shield className="w-4 h-4 shrink-0" style={{ color: "#ffcb6b" }} /> },
  };
  const s = styles[variant];
  return (
    <div className="flex gap-3 rounded-xl px-4 py-3 my-4 text-sm" style={{ border: `1px solid ${s.border}`, background: s.bg, color: "var(--text-secondary)", lineHeight: 1.65 }}>
      <div className="mt-0.5">{s.icon}</div>
      <div>{children}</div>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.h2
      id={id}
      className="text-2xl sm:text-3xl font-bold tracking-tight pt-8 pb-4 scroll-mt-24"
      style={{ fontFamily: "var(--font-display), system-ui" }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-lg sm:text-xl font-semibold mt-8 mb-3 tracking-tight"
      style={{ fontFamily: "var(--font-display), system-ui", color: "var(--text-primary)" }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-base mb-4" style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="space-y-2 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base" style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-1" style={{ color: "var(--accent)" }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FunctionTable({ rows }: { rows: { fn: string; desc: string }[] }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border" style={{ borderColor: "var(--border)" }}>
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>Function</th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
              <td className="px-4 py-3" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "var(--accent)", fontSize: 13 }}>{row.fn}</td>
              <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className="font-medium text-sm sm:text-base" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>
          {question}
        </span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      className="glass-card p-4 sm:p-5"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ background: "var(--accent-muted)" }}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>{title}</h4>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function DocsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("getting-started");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const callback: IntersectionObserverCallback = (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        const sorted = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveSection(sorted[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  }, []);

  const SidebarContent = () => (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      <div className="px-3 mb-4">
        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>
          Documentation
        </span>
      </div>
      {sections.map((s) => {
        const isActive = activeSection === s.id;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all relative group text-left"
            style={{
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              background: isActive ? "var(--accent-muted)" : "transparent",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                style={{ background: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="transition-colors" style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}>
              {s.icon}
            </span>
            {s.label}
          </button>
        );
      })}

      <div className="mt-8 mx-3 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="accent-card p-4">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>
            Ready to start?
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Launch the employer dashboard or employee portal.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="btn-primary text-xs !py-2 !px-3 text-center !rounded-lg">
              Employer Dashboard
            </Link>
            <Link href="/employee" className="btn-secondary text-xs !py-2 !px-3 text-center !rounded-lg">
              Employee Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-deep)" }}>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14 border-b"
        style={{ background: "rgba(6,6,8,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Docs</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to App
          </Link>
          <button
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" style={{ color: "var(--text-primary)" }} /> : <Menu className="w-4 h-4" style={{ color: "var(--text-primary)" }} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 sm:hidden"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-14 left-0 bottom-0 z-40 w-[260px] overflow-y-auto sm:hidden"
              style={{ background: "var(--bg-primary)", borderRight: "1px solid var(--border)" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        className="hidden sm:block fixed top-14 left-0 bottom-0 w-[260px] overflow-y-auto"
        style={{ background: "var(--bg-primary)", borderRight: "1px solid var(--border)" }}
      >
        <SidebarContent />
      </aside>

      <main className="pt-14 sm:pl-[260px]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 pb-24">

          {/* GETTING STARTED */}
          <SectionHeading id="getting-started">
            <span className="gradient-text">Getting Started</span> with Umbra Pay
          </SectionHeading>

          <SubHeading>What is Umbra Pay?</SubHeading>
          <P>
            Umbra Pay is a <strong style={{ color: "var(--text-primary)" }}>privacy-first on-chain payroll platform</strong> powered by{" "}
            <strong style={{ color: "var(--text-primary)" }}>Flare Confidential Compute (FCC)</strong>. It allows organizations to coordinate payroll on-chain while keeping salary amounts and payouts strictly private inside hardware-isolated Trusted Execution Environments (TEEs).
          </P>
          <P>
            Using a two-chain architecture, Umbra Pay uses <strong style={{ color: "var(--text-primary)" }}>Flare Coston2</strong> as the fast coordination network and <strong style={{ color: "var(--text-primary)" }}>Ethereum Sepolia</strong> as the native money settlement chain.
          </P>

          <SubHeading>How It Works</SubHeading>
          <P>The Umbra Pay flow is straightforward:</P>
          <div className="my-4 flex flex-col gap-3">
            {[
              { step: "1", title: "Create Organization", desc: "Employer deploys an UmbraOrg smart contract on Flare Coston2." },
              { step: "2", title: "Add Employees", desc: "Enter wallet addresses and salary amounts. Salaries are encrypted and synced with the TEE Enclave API." },
              { step: "3", title: "Deposit Native ETH", desc: "Employer deposits native ETH directly to the TEE Vault address on Ethereum Sepolia." },
              { step: "4", title: "Run Payroll", desc: "Executing payroll on Coston2 updates the enclave ledger balances in hardware TEE isolation." },
              { step: "5", title: "Enclave Settlement", desc: "Employees request withdrawals, and the enclave signs and broadcasts native ETH settlement transactions directly to Sepolia." },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex items-start gap-4 p-4 rounded-xl border"
                style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Number(item.step) * 0.05 }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-sm font-bold"
                  style={{ background: "var(--accent)", color: "var(--bg-deep)", fontFamily: "var(--font-display), system-ui" }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), system-ui" }}>{item.title}</p>
                  <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <SubHeading>Prerequisites</SubHeading>
          <BulletList
            items={[
              "A Web3 wallet (MetaMask, Rainbow, Coinbase Wallet, etc.)",
              "Coston2 C2ETH for gas fees on Flare Coston2",
              "Ethereum Sepolia ETH for funding employer deposits",
            ]}
          />

          <TipBox variant="tip">
            Need Coston2 C2ETH or Sepolia ETH? Visit the official Flare Faucet and Sepolia Faucets to fund your wallet.
          </TipBox>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* FOR EMPLOYERS */}
          <SectionHeading id="for-employers">
            For <span className="gradient-text">Employers</span>
          </SectionHeading>
          <P>
            Umbra Pay gives employers full control over private payroll operations. From deploying an organization to tracking hardware-attested budget solvency, everything is designed to be simple while keeping salary data confidential.
          </P>

          <SubHeading>Creating an Organization</SubHeading>
          <P>
            Deploy a new organization smart contract by clicking <strong style={{ color: "var(--text-primary)" }}>Create Organization</strong> on the employer dashboard. This deploys an <code style={{ color: "var(--accent)", background: "rgba(0,229,160,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>UmbraOrg</code> contract on Flare Coston2.
          </P>

          <SubHeading>Adding Employees</SubHeading>
          <P>
            Enter each employee&apos;s wallet address, role, and salary amount. Salary payloads are stored as encrypted blobs on Coston2 and synced with the TEE Enclave API.
          </P>

          <SubHeading>Depositing Funds</SubHeading>
          <P>
            Fund your payroll vault by depositing native ETH directly to the TEE vault address (<code style={{ color: "var(--accent)", background: "rgba(0,229,160,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>0x294dB937C2b9f02A29987472a3F16918a08d1185</code>) on Ethereum Sepolia.
          </P>

          <SubHeading>Running Payroll</SubHeading>
          <P>
            Trigger batch payroll on Coston2 with a single click. The TEE enclave verifies payroll claims and updates employee private ledger balances inside hardware isolation.
          </P>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* FOR EMPLOYEES */}
          <SectionHeading id="for-employees">
            For <span className="gradient-text">Employees</span>
          </SectionHeading>
          <P>
            Employees access their funds via the employee portal on Ethereum Sepolia and Flare Coston2.
          </P>

          <SubHeading>Connecting & Auto-Discovery</SubHeading>
          <P>
            When you connect your wallet, Umbra Pay queries the Factory contract to automatically find every organization you belong to.
          </P>

          <SubHeading>Withdrawing Funds</SubHeading>
          <P>
            Request a withdrawal through the portal. The TEE enclave validates your private balance and issues a signed native ETH settlement transaction directly to your wallet on Sepolia.
          </P>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* SMART CONTRACTS */}
          <SectionHeading id="smart-contracts">
            <span className="gradient-text">Smart Contracts</span>
          </SectionHeading>

          <SubHeading>Deployed Contract Addresses</SubHeading>
          <FunctionTable
            rows={[
              { fn: "UmbraOrgFactory (Coston2)", desc: "0x8C00cab72b52644c0F98570c5DC094E3E214B241" },
              { fn: "Demo UmbraOrg (Coston2)", desc: "0x89E6fBd9B415D6E16b2cbeD92D4924659B8e9D94" },
              { fn: "TEE Vault Address (Sepolia)", desc: "0x294dB937C2b9f02A29987472a3F16918a08d1185" },
            ]}
          />

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* TEE PRIVACY & FCC */}
          <SectionHeading id="tee-privacy">
            <span className="gradient-text">TEE Privacy & FCC</span>
          </SectionHeading>

          <SubHeading>Why Trusted Execution Environments?</SubHeading>
          <P>
            TEEs provide hardware-enforced memory isolation and cryptographic attestation. Unlike legacy FHE or complex multiparty computation, TEEs allow instant computation and direct native key management without computational overhead or expensive gas fees.
          </P>

          <div className="my-12" style={{ borderTop: "1px solid var(--border)" }} />

          {/* FEATURES */}
          <SectionHeading id="features">
            <span className="gradient-text">Features</span>
          </SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
            <FeatureCard
              icon={<Shield className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="TEE Hardware Privacy"
              desc="Salaries and payout ledger balances remain isolated inside hardware enclaves."
            />
            <FeatureCard
              icon={<Layers className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Two-Chain Settlement"
              desc="Coston2 for instant coordination, Sepolia for native ETH deposits and settlements."
            />
            <FeatureCard
              icon={<Search className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Employee Auto-Discovery"
              desc="Automatic registration and organization lookup upon wallet connection."
            />
            <FeatureCard
              icon={<CreditCard className="w-4 h-4" style={{ color: "var(--accent)" }} />}
              title="Instant Withdrawal"
              desc="Enclave-signed direct native ETH transfers to employee wallets on Sepolia."
            />
          </div>

          {/* FAQ */}
          <SectionHeading id="faq">
            Frequently Asked <span className="gradient-text">Questions</span>
          </SectionHeading>

          <div className="my-6">
            <FAQItem
              question="Is my salary really private?"
              answer="Yes. Salary amounts are encrypted and stored inside hardware-isolated TEE enclaves. Neither block explorers nor unauthorized third parties can access the plaintext amounts."
            />
            <FAQItem
              question="Which networks does Umbra Pay use?"
              answer="Flare Coston2 (Chain ID 114) is used for coordination (contracts and org management), and Ethereum Sepolia (Chain ID 11155111) is used for native ETH deposits and withdrawals."
            />
          </div>

          <div className="mt-16 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="accent-card p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display), system-ui" }}>
                Ready to get <span className="gradient-text">started</span>?
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                Launch Umbra Pay and experience confidential on-chain payroll.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/dashboard" className="btn-primary">
                  <Building2 className="w-4 h-4" />
                  Employer Dashboard
                </Link>
                <Link href="/employee" className="btn-secondary">
                  <User className="w-4 h-4" />
                  Employee Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
