import fs from "fs";
import path from "path";
import { ethers } from "ethers";

const DB_FILE = path.join(process.cwd(), ".umbra-database.json");

export interface DepositRecord {
  txHash?: string;
  amountEth: string;
  timestamp: number;
}

export interface WithdrawalRecord {
  txHash?: string;
  employeeAddress: string;
  amountEth: string;
  timestamp: number;
}

export interface PayrollRecord {
  runId: number;
  executedCostEth: string;
  employeeCount: number;
  timestamp: number;
}

export interface OrgState {
  vaultBalanceWei: string; // decimal string
  payrollRunCount: number;
  employeeSalaries: Record<string, string>; // addr -> salaryWei decimal string
  employeeBalances: Record<string, string>; // addr -> balanceWei decimal string
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  payrollHistory: PayrollRecord[];
}

export interface DatabaseSchema {
  version: number;
  organizations: Record<string, OrgState>;
}

const DEFAULT_ORG_KEY = "0x0000000000000000000000000000000000000000";

function createEmptyOrgState(): OrgState {
  return {
    vaultBalanceWei: "0",
    payrollRunCount: 0,
    employeeSalaries: {},
    employeeBalances: {},
    deposits: [],
    withdrawals: [],
    payrollHistory: [],
  };
}

function loadDatabaseFromDisk(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const db: DatabaseSchema = JSON.parse(raw);
      if (db && db.organizations) {
        return db;
      }
    }
  } catch (err) {
    console.error("[Enclave DB] Error reading database file:", err);
  }

  // Also check old state file for backward compatibility migration
  const oldStateFile = path.join(process.cwd(), ".enclave-state.json");
  let defaultVault = "0";
  let defaultSalaries: Record<string, string> = {};
  let defaultBalances: Record<string, string> = {};
  let defaultRunCount = 0;

  try {
    if (fs.existsSync(oldStateFile)) {
      const oldRaw = fs.readFileSync(oldStateFile, "utf-8");
      const old = JSON.parse(oldRaw);
      defaultVault = old.sepoliaVaultBalanceWei || "0";
      defaultSalaries = old.employeeSalaries || {};
      defaultBalances = old.employeeBalances || {};
      defaultRunCount = old.payrollRunCount || 0;
    }
  } catch {}

  const defaultOrg: OrgState = {
    vaultBalanceWei: defaultVault,
    payrollRunCount: defaultRunCount,
    employeeSalaries: defaultSalaries,
    employeeBalances: defaultBalances,
    deposits: [],
    withdrawals: [],
    payrollHistory: [],
  };

  return {
    version: 1,
    organizations: {
      [DEFAULT_ORG_KEY]: defaultOrg,
    },
  };
}

function saveDatabaseToDisk(db: DatabaseSchema) {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), "utf-8");
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error("[Enclave DB] Error saving database file:", err);
  }
}

function getDatabase(): DatabaseSchema {
  // Always load from memory cache if present, but allow disk re-read
  if (!(globalThis as any).__umbraDatabase) {
    (globalThis as any).__umbraDatabase = loadDatabaseFromDisk();
  }
  return (globalThis as any).__umbraDatabase;
}

export function normalizeOrgAddress(orgAddress?: string | null): string {
  if (!orgAddress || typeof orgAddress !== "string") return DEFAULT_ORG_KEY;
  const cleaned = orgAddress.trim().toLowerCase();
  if (/^0x[0-9a-f]{40}$/.test(cleaned)) {
    return cleaned;
  }
  return DEFAULT_ORG_KEY;
}

export function getOrg(orgAddress?: string | null): OrgState {
  const db = getDatabase();
  const key = normalizeOrgAddress(orgAddress);
  if (!db.organizations[key]) {
    db.organizations[key] = createEmptyOrgState();
    saveDatabaseToDisk(db);
  }
  return db.organizations[key];
}

export function updateOrg(orgAddress: string | null | undefined, updater: (org: OrgState) => void): OrgState {
  const db = getDatabase();
  const key = normalizeOrgAddress(orgAddress);
  if (!db.organizations[key]) {
    db.organizations[key] = createEmptyOrgState();
  }
  const org = db.organizations[key];
  updater(org);
  saveDatabaseToDisk(db);
  return org;
}

export function resetDatabaseInMemory() {
  (globalThis as any).__umbraDatabase = loadDatabaseFromDisk();
}
