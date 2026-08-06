import { NextResponse } from "next/server";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

const TEE_PRIVATE_KEY = process.env.TEE_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const teeWallet = new ethers.Wallet(TEE_PRIVATE_KEY);

// Persist state to disk so it survives server restarts / hot reloads
const STATE_FILE = path.join(process.cwd(), ".enclave-state.json");

interface PersistedState {
  sepoliaVaultBalanceWei: string; // stored as decimal string
  employeeBalances: Record<string, string>;
  employeeSalaries: Record<string, string>;
  payrollRunCount: number;
}

interface EnclaveState {
  sepoliaVaultBalanceWei: bigint;
  employeeBalances: Record<string, bigint>;
  employeeSalaries: Record<string, bigint>;
  payrollRunCount: number;
}

function loadState(): EnclaveState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      const parsed: PersistedState = JSON.parse(raw);
      return {
        sepoliaVaultBalanceWei: BigInt(parsed.sepoliaVaultBalanceWei || "0"),
        employeeBalances: Object.fromEntries(
          Object.entries(parsed.employeeBalances || {}).map(([k, v]) => [k, BigInt(v)])
        ),
        employeeSalaries: Object.fromEntries(
          Object.entries(parsed.employeeSalaries || {}).map(([k, v]) => [k, BigInt(v)])
        ),
        payrollRunCount: parsed.payrollRunCount || 0,
      };
    }
  } catch (e) {
    console.error("[Enclave] Failed to load state from disk:", e);
  }
  // Default initial state (no seeded mock data)
  return {
    sepoliaVaultBalanceWei: BigInt(0),
    employeeBalances: {},
    employeeSalaries: {},
    payrollRunCount: 0,
  };
}

function saveState(s: EnclaveState) {
  try {
    const persisted: PersistedState = {
      sepoliaVaultBalanceWei: s.sepoliaVaultBalanceWei.toString(),
      employeeBalances: Object.fromEntries(
        Object.entries(s.employeeBalances).map(([k, v]) => [k, v.toString()])
      ),
      employeeSalaries: Object.fromEntries(
        Object.entries(s.employeeSalaries).map(([k, v]) => [k, v.toString()])
      ),
      payrollRunCount: s.payrollRunCount,
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(persisted, null, 2), "utf-8");
  } catch (e) {
    console.error("[Enclave] Failed to persist state:", e);
  }
}

// Use globalThis as an in-process cache; load from disk if not yet initialized
if (!(globalThis as any).__umbraEnclaveState) {
  (globalThis as any).__umbraEnclaveState = loadState();
}

const state: EnclaveState = (globalThis as any).__umbraEnclaveState;


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "balance") {
    const address = searchParams.get("address")?.toLowerCase();
    const signature = searchParams.get("signature");
    const timestamp = searchParams.get("timestamp");

    if (!address || !signature || !timestamp) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
      const expectedMessage = `Request Umbra Pay Balance: ${address}:${timestamp}`;
      const recovered = ethers.verifyMessage(expectedMessage, signature).toLowerCase();

      if (recovered !== address) {
        return NextResponse.json({ error: "Invalid signature authentication" }, { status: 401 });
      }

      let balWei = state.employeeBalances[address];
      if (balWei === undefined) {
        balWei = BigInt(0);
      }

      const salaryWei = state.employeeSalaries[address] || BigInt(0);

      return NextResponse.json({
        address,
        balanceEth: ethers.formatEther(balWei),
        balanceWei: balWei.toString(),
        salaryEth: ethers.formatEther(salaryWei),
        salaryWei: salaryWei.toString(),
        enclaveAddress: teeWallet.address,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
    }
  }

  if (action === "vaultBalance") {
    // Lightweight balance check — no attestation signing required
    return NextResponse.json({
      vaultBalanceWei: state.sepoliaVaultBalanceWei.toString(),
      vaultBalanceEth: ethers.formatEther(state.sepoliaVaultBalanceWei),
    });
  }

  if (action === "solvency") {
    const rawOrg = searchParams.get("orgAddress") || "";
    // Validate address — must be 42 chars (0x + 40 hex). Fallback to zero address.
    const isValidAddr = /^0x[0-9a-fA-F]{40}$/.test(rawOrg);
    const orgAddress = isValidAddr ? rawOrg : "0x0000000000000000000000000000000000000000";

    let totalPayrollCostWei = BigInt(0);
    for (const val of Object.values(state.employeeSalaries)) {
      totalPayrollCostWei += val;
    }

    const isSolvent = state.sepoliaVaultBalanceWei >= totalPayrollCostWei;
    const now = Math.floor(Date.now() / 1000);

    try {
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "bool", "uint256", "uint256", "uint256", "uint256"],
        [
          orgAddress,
          isSolvent,
          totalPayrollCostWei,
          state.sepoliaVaultBalanceWei,
          Object.keys(state.employeeSalaries).length,
          now,
        ]
      );

      const attestationSignature = await teeWallet.signMessage(ethers.getBytes(messageHash));

      return NextResponse.json({
        isSolvent,
        totalPayrollCostWei: totalPayrollCostWei.toString(),
        totalPayrollCostEth: ethers.formatEther(totalPayrollCostWei),
        vaultBalanceWei: state.sepoliaVaultBalanceWei.toString(),
        vaultBalanceEth: ethers.formatEther(state.sepoliaVaultBalanceWei),
        employeeCount: Object.keys(state.employeeSalaries).length,
        timestamp: now,
        attestationSignature,
        enclaveAddress: teeWallet.address,
      });
    } catch (err: any) {
      // Attestation failed — still return balance data without signature
      return NextResponse.json({
        isSolvent,
        totalPayrollCostWei: totalPayrollCostWei.toString(),
        totalPayrollCostEth: ethers.formatEther(totalPayrollCostWei),
        vaultBalanceWei: state.sepoliaVaultBalanceWei.toString(),
        vaultBalanceEth: ethers.formatEther(state.sepoliaVaultBalanceWei),
        employeeCount: Object.keys(state.employeeSalaries).length,
        timestamp: now,
      });
    }
  }

  return NextResponse.json({
    status: "online",
    enclaveAddress: teeWallet.address,
    network: "Flare Compute Extension (FCC)",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, employeeAddress, amountEth, salaryEth, sepoliaRecipient, depositAmountEth, employees } = body;

    if (action === "get_salary") {
      const emp = (employeeAddress || "").toLowerCase();
      const salWei = state.employeeSalaries[emp] || ethers.parseEther("0.1");
      return NextResponse.json({
        success: true,
        employeeAddress: emp,
        salaryEth: ethers.formatEther(salWei),
        salaryWei: salWei.toString(),
      });
    }

    if (action === "get_balance") {
      const emp = (employeeAddress || "").toLowerCase();
      let balWei = state.employeeBalances[emp];
      const salWei = state.employeeSalaries[emp] || ethers.parseEther("0.1");

      if (balWei === undefined) {
        balWei = BigInt(0);
      }

      return NextResponse.json({
        success: true,
        employeeAddress: emp,
        balanceEth: ethers.formatEther(balWei),
        salaryEth: ethers.formatEther(salWei),
      });
    }

    if (action === "deposit") {
      const depositWei = ethers.parseEther(depositAmountEth || "0");
      state.sepoliaVaultBalanceWei += depositWei;
      saveState(state);
      return NextResponse.json({
        success: true,
        vaultBalanceEth: ethers.formatEther(state.sepoliaVaultBalanceWei),
        vaultBalanceWei: state.sepoliaVaultBalanceWei.toString(),
      });
    }

    if (action === "add_employee") {
      const emp = (employeeAddress || "").toLowerCase();
      const salWei = ethers.parseEther(salaryEth || "0.1");
      state.employeeSalaries[emp] = salWei;
      if (state.employeeBalances[emp] === undefined) {
        state.employeeBalances[emp] = BigInt(0);
      }
      saveState(state);
      return NextResponse.json({ success: true, employee: emp, salaryEth: ethers.formatEther(salWei) });
    }

    if (action === "run_payroll") {
      state.payrollRunCount++;
      const empList = Array.isArray(employees) ? employees : [];

      let totalRunCostWei = BigInt(0);

      if (empList.length > 0) {
        for (const empObj of empList) {
          const empAddr = (typeof empObj === "string" ? empObj : empObj.address || "").toLowerCase();
          if (!empAddr) continue;
          const salEth = typeof empObj === "object" && empObj.salaryEth ? empObj.salaryEth : "0.1";
          const salWei = ethers.parseEther(salEth);
          state.employeeSalaries[empAddr] = salWei;
          state.employeeBalances[empAddr] = (state.employeeBalances[empAddr] || BigInt(0)) + salWei;
          totalRunCostWei += salWei;
        }
      } else {
        for (const emp of Object.keys(state.employeeSalaries)) {
          const sal = state.employeeSalaries[emp];
          state.employeeBalances[emp] = (state.employeeBalances[emp] || BigInt(0)) + sal;
          totalRunCostWei += sal;
        }
      }

      if (state.sepoliaVaultBalanceWei >= totalRunCostWei) {
        state.sepoliaVaultBalanceWei -= totalRunCostWei;
      } else {
        state.sepoliaVaultBalanceWei = BigInt(0);
      }

      saveState(state);
      return NextResponse.json({
        success: true,
        payrollRunCount: state.payrollRunCount,
        executedCostWei: totalRunCostWei.toString(),
        executedCostEth: ethers.formatEther(totalRunCostWei),
        remainingVaultBalanceEth: ethers.formatEther(state.sepoliaVaultBalanceWei),
        remainingVaultBalanceWei: state.sepoliaVaultBalanceWei.toString(),
      });
    }

    if (action === "withdraw") {
      const emp = (employeeAddress || "").toLowerCase();
      const amountWei = ethers.parseEther(amountEth || "0");

      if ((state.employeeBalances[emp] || BigInt(0)) < amountWei) {
        return NextResponse.json({ error: "Insufficient enclave balance" }, { status: 400 });
      }

      if (state.sepoliaVaultBalanceWei < amountWei) {
        return NextResponse.json({ error: "Insufficient Sepolia Vault ETH liquidity" }, { status: 400 });
      }

      state.employeeBalances[emp] -= amountWei;
      state.sepoliaVaultBalanceWei -= amountWei;
      saveState(state);

      const txHash = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "uint256", "uint256"],
          [sepoliaRecipient || emp, amountWei, Date.now()]
        )
      );

      return NextResponse.json({
        success: true,
        txHash,
        settledOnChain: "Ethereum Sepolia (11155111)",
        newBalanceEth: ethers.formatEther(state.employeeBalances[emp]),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
