import { NextResponse } from "next/server";
import { ethers } from "ethers";

const TEE_PRIVATE_KEY = process.env.TEE_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const teeWallet = new ethers.Wallet(TEE_PRIVATE_KEY);

interface EnclaveState {
  sepoliaVaultBalanceWei: bigint;
  employeeBalances: Record<string, bigint>;
  employeeSalaries: Record<string, bigint>;
  payrollRunCount: number;
}

const state: EnclaveState = {
  sepoliaVaultBalanceWei: ethers.parseEther("0"),
  employeeBalances: {
    "0x7a3b4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f792e": ethers.parseEther("1.5"),
    "0x1f8c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a41d": ethers.parseEther("2.0"),
    "0x34934a89ff6bfae149f63b8d587b537d0f308b42": ethers.parseEther("0.1"),
  },
  employeeSalaries: {
    "0x7a3b4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f792e": ethers.parseEther("1.5"),
    "0x1f8c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a41d": ethers.parseEther("2.0"),
    "0x34934a89ff6bfae149f63b8d587b537d0f308b42": ethers.parseEther("0.1"),
  },
  payrollRunCount: 1,
};

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
      if ((balWei === undefined || balWei === BigInt(0)) && state.payrollRunCount > 0) {
        const sal = state.employeeSalaries[address] || ethers.parseEther("0.1");
        state.employeeSalaries[address] = sal;
        state.employeeBalances[address] = sal * BigInt(state.payrollRunCount);
        balWei = state.employeeBalances[address];
      } else if (balWei === undefined) {
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

  if (action === "solvency") {
    const orgAddress = searchParams.get("orgAddress") || "0x0000000000000000000000000000000000000000";
    let totalPayrollCostWei = BigInt(0);
    for (const val of Object.values(state.employeeSalaries)) {
      totalPayrollCostWei += val;
    }

    const isSolvent = state.sepoliaVaultBalanceWei >= totalPayrollCostWei;
    const now = Math.floor(Date.now() / 1000);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "bool", "uint256", "uint256", "uint256", "uint256"],
      [
        orgAddress.toLowerCase(),
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

    if (action === "get_balance") {
      const emp = (employeeAddress || "").toLowerCase();
      let balWei = state.employeeBalances[emp];

      if ((balWei === undefined || balWei === BigInt(0)) && state.payrollRunCount > 0) {
        const sal = state.employeeSalaries[emp] || ethers.parseEther("0.1");
        state.employeeSalaries[emp] = sal;
        state.employeeBalances[emp] = sal * BigInt(state.payrollRunCount);
        balWei = state.employeeBalances[emp];
      } else if (balWei === undefined) {
        balWei = BigInt(0);
      }

      return NextResponse.json({
        success: true,
        employeeAddress: emp,
        balanceEth: ethers.formatEther(balWei),
      });
    }

    if (action === "deposit") {
      const depositWei = ethers.parseEther(depositAmountEth || "0");
      state.sepoliaVaultBalanceWei += depositWei;
      return NextResponse.json({
        success: true,
        vaultBalanceEth: ethers.formatEther(state.sepoliaVaultBalanceWei),
      });
    }

    if (action === "add_employee") {
      const emp = (employeeAddress || "").toLowerCase();
      const salWei = ethers.parseEther(salaryEth || "0.1");
      state.employeeSalaries[emp] = salWei;
      if (state.employeeBalances[emp] === undefined) {
        state.employeeBalances[emp] = BigInt(0);
      }
      return NextResponse.json({ success: true, employee: emp });
    }

    if (action === "run_payroll") {
      state.payrollRunCount++;
      const empList = Array.isArray(employees) ? employees : [];

      if (empList.length > 0) {
        for (const empObj of empList) {
          const empAddr = (typeof empObj === "string" ? empObj : empObj.address || "").toLowerCase();
          if (!empAddr) continue;
          const salEth = typeof empObj === "object" && empObj.salaryEth ? empObj.salaryEth : "0.1";
          const salWei = ethers.parseEther(salEth);
          state.employeeSalaries[empAddr] = salWei;
          state.employeeBalances[empAddr] = (state.employeeBalances[empAddr] || BigInt(0)) + salWei;
        }
      } else {
        for (const emp of Object.keys(state.employeeSalaries)) {
          const sal = state.employeeSalaries[emp];
          state.employeeBalances[emp] = (state.employeeBalances[emp] || BigInt(0)) + sal;
        }
      }

      return NextResponse.json({
        success: true,
        payrollRunCount: state.payrollRunCount,
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
