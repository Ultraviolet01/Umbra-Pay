import { ethers, Signer, Wallet } from "ethers";

export interface EnclaveEmployeeState {
  address: string;
  salaryWei: bigint;
  balanceWei: bigint;
  encryptedSalaryPayload: string;
}

export interface SolvencyProof {
  isSolvent: boolean;
  totalPayrollCostWei: string;
  vaultBalanceWei: string;
  employeeCount: number;
  timestamp: number;
  attestationSignature: string;
  enclaveAddress: string;
}

export class TeeEnclaveEngine {
  private teeWallet: Wallet;
  private orgAddress: string;
  private employeeStates: Map<string, EnclaveEmployeeState> = new Map();
  private sepoliaVaultBalanceWei: bigint = 0n;
  private payrollRunCount: number = 0;
  private settlementLogs: Array<{
    requestId: number;
    employee: string;
    amountWei: bigint;
    sepoliaRecipient: string;
    txHash: string;
    timestamp: number;
  }> = [];

  constructor(teePrivateKey: string, orgAddress: string) {
    this.teeWallet = new Wallet(teePrivateKey);
    this.orgAddress = orgAddress.toLowerCase();
  }

  public getEnclaveAddress(): string {
    return this.teeWallet.address;
  }

  // Deposit sync from Sepolia (plain native ETH transfer)
  public syncSepoliaDeposit(depositAmountEth: string) {
    const depositWei = ethers.parseEther(depositAmountEth);
    this.sepoliaVaultBalanceWei += depositWei;
  }

  public getVaultBalanceWei(): bigint {
    return this.sepoliaVaultBalanceWei;
  }

  // Sync employee addition from Coston2 event
  public addOrUpdateEmployee(address: string, salaryEth: string, encryptedPayload: string) {
    const empAddr = address.toLowerCase();
    const salaryWei = ethers.parseEther(salaryEth);
    const existing = this.employeeStates.get(empAddr);

    if (existing) {
      existing.salaryWei = salaryWei;
      existing.encryptedSalaryPayload = encryptedPayload;
    } else {
      this.employeeStates.set(empAddr, {
        address: empAddr,
        salaryWei,
        balanceWei: 0n,
        encryptedSalaryPayload: encryptedPayload,
      });
    }
  }

  public removeEmployee(address: string) {
    this.employeeStates.delete(address.toLowerCase());
  }

  // Sync payroll run from Coston2 event
  public processPayrollRun() {
    this.payrollRunCount++;
    for (const [, state] of this.employeeStates) {
      state.balanceWei += state.salaryWei;
    }
  }

  // Get employee confidential balance authenticated by signature
  public async getAuthenticatedBalance(
    employeeAddress: string,
    signature: string,
    timestamp: number
  ): Promise<{ balanceEth: string; balanceWei: string }> {
    const empAddr = employeeAddress.toLowerCase();

    // Verify signature message: "Request Umbra Pay Balance: {employeeAddress}:{timestamp}"
    const expectedMessage = `Request Umbra Pay Balance: ${empAddr}:${timestamp}`;
    const recoveredAddress = ethers.verifyMessage(expectedMessage, signature).toLowerCase();

    if (recoveredAddress !== empAddr) {
      throw new Error("Invalid signature authentication for employee balance");
    }

    const state = this.employeeStates.get(empAddr);
    if (!state) {
      throw new Error("Employee not found in enclave records");
    }

    return {
      balanceEth: ethers.formatEther(state.balanceWei),
      balanceWei: state.balanceWei.toString(),
    };
  }

  // Solvency attestation proof (Auditor view)
  public async generateSolvencyProof(): Promise<SolvencyProof> {
    let totalPayrollCostWei = 0n;
    for (const [, state] of this.employeeStates) {
      totalPayrollCostWei += state.salaryWei;
    }

    const isSolvent = this.sepoliaVaultBalanceWei >= totalPayrollCostWei;
    const timestamp = Math.floor(Date.now() / 1000);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "bool", "uint256", "uint256", "uint256", "uint256"],
      [
        this.orgAddress,
        isSolvent,
        totalPayrollCostWei,
        this.sepoliaVaultBalanceWei,
        this.employeeStates.size,
        timestamp,
      ]
    );

    const attestationSignature = await this.teeWallet.signMessage(ethers.getBytes(messageHash));

    return {
      isSolvent,
      totalPayrollCostWei: totalPayrollCostWei.toString(),
      vaultBalanceWei: this.sepoliaVaultBalanceWei.toString(),
      employeeCount: this.employeeStates.size,
      timestamp,
      attestationSignature,
      enclaveAddress: this.teeWallet.address,
    };
  }

  // Process withdrawal request from Coston2 and trigger Sepolia ETH settlement
  public async processWithdrawalRequest(
    requestId: number,
    employeeAddress: string,
    amountWei: bigint,
    sepoliaRecipient: string,
    sepoliaSignerOrProvider?: Signer
  ): Promise<{ txHash: string; success: boolean }> {
    const empAddr = employeeAddress.toLowerCase();
    const state = this.employeeStates.get(empAddr);

    if (!state) {
      throw new Error(`Enclave Error: Employee ${employeeAddress} not registered`);
    }

    if (state.balanceWei < amountWei) {
      throw new Error(`Enclave Error: Insufficient enclave balance (${ethers.formatEther(state.balanceWei)} ETH < ${ethers.formatEther(amountWei)} ETH)`);
    }

    if (this.sepoliaVaultBalanceWei < amountWei) {
      throw new Error(`Enclave Error: Insufficient Sepolia Vault ETH liquidity`);
    }

    // Decrement confidential balance inside enclave
    state.balanceWei -= amountWei;
    this.sepoliaVaultBalanceWei -= amountWei;

    let txHash: string;
    if (sepoliaSignerOrProvider) {
      // Execute real native ETH transfer on Sepolia from TEE wallet
      const tx = await sepoliaSignerOrProvider.sendTransaction({
        to: sepoliaRecipient,
        value: amountWei,
      });
      const receipt = await tx.wait();
      txHash = receipt?.hash || tx.hash;
    } else {
      // Simulated/Local TEE signing
      txHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "uint256", "uint256"],
          [requestId, sepoliaRecipient, amountWei, Date.now()]
        )
      );
    }

    this.settlementLogs.push({
      requestId,
      employee: empAddr,
      amountWei,
      sepoliaRecipient,
      txHash,
      timestamp: Date.now(),
    });

    return { txHash, success: true };
  }

  public getSettlementLogs() {
    return this.settlementLogs;
  }
}
