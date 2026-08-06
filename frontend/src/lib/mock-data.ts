import { Shield, Zap, Eye, Users, Wallet, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ═══ Landing Page Data ═══ */

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: Shield,
    title: "Flare Confidential Compute",
    description:
      "Salaries and accumulated balances are calculated confidentially inside a Trusted Execution Environment (TEE).",
  },
  {
    icon: Zap,
    title: "Coston2 Coordination & Sepolia Settlement",
    description:
      "Admin actions and payroll runs execute on Coston2 (114), while native ETH deposits and TEE payouts execute on Ethereum Sepolia (11155111).",
  },
  {
    icon: Eye,
    title: "Employee Confidential Self-Service",
    description:
      "Employees authenticate via wallet signatures to query their confidential balance. Settlement payouts execute automatically to Sepolia.",
  },
];

export interface Step {
  num: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const steps: Step[] = [
  {
    num: "01",
    title: "Create Organization",
    description:
      "Deploy your UmbraOrg contract on Coston2 (114) linked to your TEE Sepolia vault.",
    icon: Users,
  },
  {
    num: "02",
    title: "Deposit Native ETH",
    description:
      "Deposit native ETH liquidity directly to your TEE vault address on Sepolia (11155111).",
    icon: Wallet,
  },
  {
    num: "03",
    title: "Run Payroll",
    description:
      "Trigger 1-click payroll run on Coston2. Confidential enclave balances update automatically.",
    icon: Zap,
  },
  {
    num: "04",
    title: "Withdraw to Sepolia",
    description:
      "Employees request withdrawal on Coston2. TEE enclave verifies balance and transfers native ETH on Sepolia.",
    icon: Lock,
  },
];

export const stats = [
  { value: "100%", label: "Encrypted", sublabel: "Confidential TEE State" },
  { value: "ETH", label: "Native Only", sublabel: "Sepolia Liquidity Vault" },
  { value: "FCC", label: "Powered", sublabel: "Flare Confidential Compute" },
  { value: "Coston2", label: "Coordination", sublabel: "Chain ID 114" },
];

/* ═══ Organization Data ═══ */

export interface Organization {
  id: string;
  name: string;
  address: string;
  employeeCount: number;
  lastPayroll: string;
  role: "admin" | "employee";
}

export const mockEmployerOrgs: Organization[] = [
  {
    id: "1",
    name: "Umbra Technologies",
    address: "0x1a2b...3c4d",
    employeeCount: 4,
    lastPayroll: "Aug 04, 2026",
    role: "admin",
  },
];

export const mockEmployeeOrgs: Organization[] = [
  {
    id: "1",
    name: "Umbra Technologies",
    address: "0x1a2b...3c4d",
    employeeCount: 4,
    lastPayroll: "Aug 04, 2026",
    role: "employee",
  },
];

export interface Employee {
  id: number;
  address: string;
  fullAddress: string;
  name: string;
  role: string;
  status: string;
  lastPaid: string;
  salaryEth?: string;
}

export const mockEmployees: Employee[] = [
  {
    id: 1,
    address: "0x7a3B...f92e",
    fullAddress: "0x7a3B4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f792e",
    name: "Alice Johnson",
    role: "Engineer",
    status: "active",
    lastPaid: "Aug 04, 2026",
  },
  {
    id: 2,
    address: "0x1f8C...a41d",
    fullAddress: "0x1f8C3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a41d",
    name: "Bob Martinez",
    role: "Designer",
    status: "active",
    lastPaid: "Aug 04, 2026",
  },
];

export interface PayrollRun {
  id: number;
  date: string;
  employees: number;
  txHash: string;
  status: string;
}

export const payrollHistory: PayrollRun[] = [
  {
    id: 1,
    date: "Aug 04, 2026",
    employees: 2,
    txHash: "0xabc...123",
    status: "completed",
  },
];

export interface Transaction {
  id: number;
  type: "credit" | "withdrawal";
  label: string;
  date: string;
  txHash: string;
  status: string;
  amount?: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: "credit",
    label: "August Payroll",
    date: "Aug 04, 2026",
    txHash: "0xf3a...8d2c",
    status: "completed",
    amount: "1.50 ETH",
  },
  {
    id: 2,
    type: "withdrawal",
    label: "Sepolia ETH Payout",
    date: "Aug 04, 2026",
    txHash: "0x9c4...2a1b",
    status: "completed",
    amount: "0.50 ETH",
  },
];
