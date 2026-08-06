import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { getOrg, updateOrg } from "@/lib/enclaveDb";

const TEE_PRIVATE_KEY = process.env.TEE_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const teeWallet = new ethers.Wallet(TEE_PRIVATE_KEY);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const orgAddress = searchParams.get("orgAddress");

  const org = getOrg(orgAddress);

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

      const balWei = BigInt(org.employeeBalances[address] || "0");
      const salaryWei = BigInt(org.employeeSalaries[address] || "100000000000000000"); // 0.1 ETH fallback

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
    const vaultWei = BigInt(org.vaultBalanceWei || "0");
    return NextResponse.json({
      vaultBalanceWei: vaultWei.toString(),
      vaultBalanceEth: ethers.formatEther(vaultWei),
    });
  }

  if (action === "solvency") {
    const rawOrg = orgAddress || "";
    const isValidAddr = /^0x[0-9a-fA-F]{40}$/.test(rawOrg);
    const validOrgAddr = isValidAddr ? rawOrg : "0x0000000000000000000000000000000000000000";

    let totalPayrollCostWei = BigInt(0);
    for (const valStr of Object.values(org.employeeSalaries)) {
      totalPayrollCostWei += BigInt(valStr);
    }

    const vaultWei = BigInt(org.vaultBalanceWei || "0");
    const isSolvent = vaultWei >= totalPayrollCostWei;
    const now = Math.floor(Date.now() / 1000);
    const empCount = Object.keys(org.employeeSalaries).length;

    try {
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "bool", "uint256", "uint256", "uint256", "uint256"],
        [
          validOrgAddr,
          isSolvent,
          totalPayrollCostWei,
          vaultWei,
          empCount,
          now,
        ]
      );

      const attestationSignature = await teeWallet.signMessage(ethers.getBytes(messageHash));

      return NextResponse.json({
        isSolvent,
        totalPayrollCostWei: totalPayrollCostWei.toString(),
        totalPayrollCostEth: ethers.formatEther(totalPayrollCostWei),
        vaultBalanceWei: vaultWei.toString(),
        vaultBalanceEth: ethers.formatEther(vaultWei),
        employeeCount: empCount,
        timestamp: now,
        attestationSignature,
        enclaveAddress: teeWallet.address,
      });
    } catch (err: any) {
      return NextResponse.json({
        isSolvent,
        totalPayrollCostWei: totalPayrollCostWei.toString(),
        totalPayrollCostEth: ethers.formatEther(totalPayrollCostWei),
        vaultBalanceWei: vaultWei.toString(),
        vaultBalanceEth: ethers.formatEther(vaultWei),
        employeeCount: empCount,
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
    const { action, employeeAddress, amountEth, salaryEth, sepoliaRecipient, depositAmountEth, employees, orgAddress } = body;

    const org = getOrg(orgAddress);

    if (action === "get_salary") {
      const emp = (employeeAddress || "").toLowerCase();
      const salStr = org.employeeSalaries[emp] || "100000000000000000"; // 0.1 ETH default
      const salWei = BigInt(salStr);
      return NextResponse.json({
        success: true,
        employeeAddress: emp,
        salaryEth: ethers.formatEther(salWei),
        salaryWei: salWei.toString(),
      });
    }

    if (action === "get_balance") {
      const emp = (employeeAddress || "").toLowerCase();
      const balWei = BigInt(org.employeeBalances[emp] || "0");
      const salWei = BigInt(org.employeeSalaries[emp] || "100000000000000000");

      return NextResponse.json({
        success: true,
        employeeAddress: emp,
        balanceEth: ethers.formatEther(balWei),
        salaryEth: ethers.formatEther(salWei),
      });
    }

    if (action === "deposit") {
      const depositWei = ethers.parseEther(depositAmountEth || "0");
      const updatedOrg = updateOrg(orgAddress, (state) => {
        const currentWei = BigInt(state.vaultBalanceWei || "0");
        state.vaultBalanceWei = (currentWei + depositWei).toString();
        state.deposits.unshift({
          amountEth: depositAmountEth || "0",
          timestamp: Date.now(),
        });
      });

      return NextResponse.json({
        success: true,
        vaultBalanceEth: ethers.formatEther(BigInt(updatedOrg.vaultBalanceWei)),
        vaultBalanceWei: updatedOrg.vaultBalanceWei,
      });
    }

    if (action === "add_employee") {
      const emp = (employeeAddress || "").toLowerCase();
      const salWei = ethers.parseEther(salaryEth || "0.1");

      updateOrg(orgAddress, (state) => {
        state.employeeSalaries[emp] = salWei.toString();
        if (state.employeeBalances[emp] === undefined) {
          state.employeeBalances[emp] = "0";
        }
      });

      return NextResponse.json({ success: true, employee: emp, salaryEth: ethers.formatEther(salWei) });
    }

    if (action === "run_payroll") {
      const empList = Array.isArray(employees) ? employees : [];

      let totalRunCostWei = BigInt(0);

      const updatedOrg = updateOrg(orgAddress, (state) => {
        state.payrollRunCount++;

        if (empList.length > 0) {
          for (const empObj of empList) {
            const empAddr = (typeof empObj === "string" ? empObj : empObj.address || "").toLowerCase();
            if (!empAddr) continue;
            const salEth = typeof empObj === "object" && empObj.salaryEth ? empObj.salaryEth : "0.1";
            const salWei = ethers.parseEther(salEth);
            state.employeeSalaries[empAddr] = salWei.toString();

            const curBalWei = BigInt(state.employeeBalances[empAddr] || "0");
            state.employeeBalances[empAddr] = (curBalWei + salWei).toString();
            totalRunCostWei += salWei;
          }
        } else {
          for (const [emp, salStr] of Object.entries(state.employeeSalaries)) {
            const salWei = BigInt(salStr);
            const curBalWei = BigInt(state.employeeBalances[emp] || "0");
            state.employeeBalances[emp] = (curBalWei + salWei).toString();
            totalRunCostWei += salWei;
          }
        }

        const currentVaultWei = BigInt(state.vaultBalanceWei || "0");
        if (currentVaultWei >= totalRunCostWei) {
          state.vaultBalanceWei = (currentVaultWei - totalRunCostWei).toString();
        } else {
          state.vaultBalanceWei = "0";
        }

        state.payrollHistory.unshift({
          runId: state.payrollRunCount,
          executedCostEth: ethers.formatEther(totalRunCostWei),
          employeeCount: empList.length || Object.keys(state.employeeSalaries).length,
          timestamp: Date.now(),
        });
      });

      const remainingVaultWei = BigInt(updatedOrg.vaultBalanceWei);

      return NextResponse.json({
        success: true,
        payrollRunCount: updatedOrg.payrollRunCount,
        executedCostWei: totalRunCostWei.toString(),
        executedCostEth: ethers.formatEther(totalRunCostWei),
        remainingVaultBalanceEth: ethers.formatEther(remainingVaultWei),
        remainingVaultBalanceWei: remainingVaultWei.toString(),
      });
    }

    if (action === "withdraw") {
      const emp = (employeeAddress || "").toLowerCase();
      const amountWei = ethers.parseEther(amountEth || "0");

      const curEmpBalWei = BigInt(org.employeeBalances[emp] || "0");
      if (curEmpBalWei < amountWei) {
        return NextResponse.json({ error: "Insufficient enclave balance" }, { status: 400 });
      }

      const curVaultWei = BigInt(org.vaultBalanceWei || "0");
      if (curVaultWei < amountWei) {
        return NextResponse.json({ error: "Insufficient Sepolia Vault ETH liquidity" }, { status: 400 });
      }

      const txHash = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "uint256", "uint256"],
          [sepoliaRecipient || emp, amountWei, Date.now()]
        )
      );

      const updatedOrg = updateOrg(orgAddress, (state) => {
        const ebWei = BigInt(state.employeeBalances[emp] || "0");
        const vbWei = BigInt(state.vaultBalanceWei || "0");
        state.employeeBalances[emp] = (ebWei - amountWei).toString();
        state.vaultBalanceWei = (vbWei - amountWei).toString();

        state.withdrawals.unshift({
          txHash,
          employeeAddress: emp,
          amountEth: amountEth || "0",
          timestamp: Date.now(),
        });
      });

      const newEmpBalWei = BigInt(updatedOrg.employeeBalances[emp] || "0");

      return NextResponse.json({
        success: true,
        txHash,
        settledOnChain: "Ethereum Sepolia (11155111)",
        newBalanceEth: ethers.formatEther(newEmpBalWei),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
