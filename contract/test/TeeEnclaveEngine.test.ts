import { expect } from "chai";
import { ethers } from "hardhat";
import { TeeEnclaveEngine } from "../src/enclave/TeeEnclaveEngine";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Flare Confidential Compute (FCC) TEE Enclave Engine", function () {
  let enclave: TeeEnclaveEngine;
  let teeWallet: HardhatEthersSigner;
  let employee1: HardhatEthersSigner;
  let employee2: HardhatEthersSigner;
  let employer: HardhatEthersSigner;
  const mockOrgAddress = "0x1111222233334444555566667777888899990000";

  beforeEach(async function () {
    [teeWallet, employee1, employee2, employer] = await ethers.getSigners();
    // Initialize enclave engine with TEE private key
    enclave = new TeeEnclaveEngine(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Hardhat account 0 private key
      mockOrgAddress
    );
  });

  it("should initialize with correct TEE enclave address", function () {
    expect(enclave.getEnclaveAddress()).to.equal(teeWallet.address);
  });

  it("should process Sepolia native ETH deposits", function () {
    expect(enclave.getVaultBalanceWei()).to.equal(0n);
    enclave.syncSepoliaDeposit("10.0");
    expect(enclave.getVaultBalanceWei()).to.equal(ethers.parseEther("10.0"));
  });

  it("should process payroll runs and accrue confidential balances inside enclave", async function () {
    enclave.syncSepoliaDeposit("10.0");
    enclave.addOrUpdateEmployee(employee1.address, "1.5", "payload1");
    enclave.addOrUpdateEmployee(employee2.address, "2.0", "payload2");

    // Run 1 payroll
    enclave.processPayrollRun();

    // Authenticated query for employee1
    const timestamp = Math.floor(Date.now() / 1000);
    const msg1 = `Request Umbra Pay Balance: ${employee1.address.toLowerCase()}:${timestamp}`;
    const sig1 = await employee1.signMessage(msg1);

    const bal1 = await enclave.getAuthenticatedBalance(employee1.address, sig1, timestamp);
    expect(bal1.balanceEth).to.equal("1.5");

    // Run 2nd payroll
    enclave.processPayrollRun();

    const bal1_updated = await enclave.getAuthenticatedBalance(employee1.address, sig1, timestamp);
    expect(bal1_updated.balanceEth).to.equal("3.0");
  });

  it("should reject unauthorized signature queries for confidential balance", async function () {
    enclave.addOrUpdateEmployee(employee1.address, "1.5", "payload1");
    enclave.processPayrollRun();

    const timestamp = Math.floor(Date.now() / 1000);
    const msg = `Request Umbra Pay Balance: ${employee1.address.toLowerCase()}:${timestamp}`;
    const wrongSig = await employee2.signMessage(msg); // employee2 trying to read employee1 balance!

    await expect(
      enclave.getAuthenticatedBalance(employee1.address, wrongSig, timestamp)
    ).to.be.rejectedWith("Invalid signature authentication");
  });

  it("should generate verifiable solvency proof attestation for auditors", async function () {
    enclave.syncSepoliaDeposit("5.0");
    enclave.addOrUpdateEmployee(employee1.address, "2.0", "payload1");
    enclave.addOrUpdateEmployee(employee2.address, "2.0", "payload2");

    const proof = await enclave.generateSolvencyProof();
    expect(proof.isSolvent).to.be.true; // 5.0 ETH deposit >= 4.0 ETH total payroll cost
    expect(proof.employeeCount).to.equal(2);
    expect(proof.enclaveAddress).to.equal(teeWallet.address);

    // Verify attestation signature
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "bool", "uint256", "uint256", "uint256", "uint256"],
      [
        mockOrgAddress.toLowerCase(),
        proof.isSolvent,
        proof.totalPayrollCostWei,
        proof.vaultBalanceWei,
        proof.employeeCount,
        proof.timestamp,
      ]
    );

    const recovered = ethers.verifyMessage(ethers.getBytes(messageHash), proof.attestationSignature);
    expect(recovered).to.equal(teeWallet.address);
  });

  it("should execute withdrawal settlement and update enclave balance", async function () {
    enclave.syncSepoliaDeposit("10.0");
    enclave.addOrUpdateEmployee(employee1.address, "2.0", "payload1");
    enclave.processPayrollRun(); // balance = 2.0 ETH

    const withdrawAmount = ethers.parseEther("0.8");
    const res = await enclave.processWithdrawalRequest(
      0,
      employee1.address,
      withdrawAmount,
      employee1.address
    );

    expect(res.success).to.be.true;
    expect(res.txHash).to.not.be.empty;

    // Verify balance after withdrawal = 1.2 ETH
    const timestamp = Math.floor(Date.now() / 1000);
    const msg = `Request Umbra Pay Balance: ${employee1.address.toLowerCase()}:${timestamp}`;
    const sig = await employee1.signMessage(msg);
    const balAfter = await enclave.getAuthenticatedBalance(employee1.address, sig, timestamp);
    expect(balAfter.balanceEth).to.equal("1.2");
  });
});
