<p align="center">
  <img src="frontend/src/app/icon.svg" alt="Umbra Pay Logo" width="64" height="64" />
</p>

<h1 align="center">Umbra Pay</h1>

<p align="center">
  <strong>Privacy-first on-chain payroll powered by Flare Confidential Compute (FCC) TEEs.</strong>
</p>

<p align="center">
  <a href="https://coston2-explorer.flare.network/address/0x8C00cab72b52644c0F98570c5DC094E3E214B241">Coston2 Factory</a> &middot;
  <a href="https://sepolia.etherscan.io/address/0x294dB937C2b9f02A29987472a3F16918a08d1185">Sepolia Vault</a> &middot;
  Built with <a href="https://flare.network">Flare Confidential Compute</a>
</p>

---

## The Problem

Payroll on-chain sounds great until you realize **everyone can see what everyone earns**. Every salary, payment, and balance is public on the blockchain for anyone to inspect. That's not how the real world works, and it shouldn't be how Web3 works either.

## The Solution

Umbra Pay uses **Flare Confidential Compute (FCC)** and isolated **Trusted Execution Environments (TEEs)** to make on-chain payroll truly private and instant. 

Instead of heavy, slow homomorphic operations or complex keypair re-encryption, Umbra Pay executes salary privacy, solvency attestation, and payout allocations inside isolated hardware enclave environments.

- **Private Salary Storage**: Salary payloads are encrypted and managed inside hardware TEE isolation.
- **Hardware-Attested Solvency**: Employers can prove total payroll solvency without revealing individual compensation amounts.
- **Two-Chain Architecture**:
  - **Coston2 (Chain ID 114)**: Fast, low-cost coordination chain for org deployment, employee management, and payroll batch execution.
  - **Ethereum Sepolia (Chain ID 11155111)**: Secure money chain where direct native ETH deposits land and enclave-signed withdrawal settlement transactions execute.

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend Interface (Next.js 16 / Wagmi v2)"]
        Employer["Employer Dashboard"]
        Employee["Employee Portal"]
    end

    subgraph CoordinationChain["Flare Coston2 Testnet (Chain ID 114)"]
        Factory["UmbraOrgFactory Contract"]
        OrgContract["UmbraOrg Contract"]
    end

    subgraph ConfidentialCompute["Flare Confidential Compute (TEE Enclave)"]
        EnclaveAPI["TEE Enclave Engine (/api/enclave)"]
        EnclaveLedger["Confidential State & Encrypted Ledger"]
        EnclaveSigner["TEE Enclave Key Signer"]
    end

    subgraph SettlementChain["Ethereum Sepolia (Chain ID 11155111)"]
        SepoliaVault["TEE Settlement Vault (0x294d...1185)"]
        EmployeeWallet["Employee Sepolia Wallet"]
    end

    Employer -- "1. Create Org" --> Factory
    Factory -- "Deploys" --> OrgContract
    Employer -- "2. Add Employee / Salary" --> OrgContract
    OrgContract -- "Sync Payload" --> EnclaveAPI
    Employer -- "3. Deposit Native ETH" --> SepoliaVault
    Employer -- "4. Run Payroll Batch" --> OrgContract
    OrgContract -- "Trigger Allocation" --> EnclaveAPI
    EnclaveAPI --> EnclaveLedger

    Employee -- "5. EIP-712 Decrypt Balance" --> EnclaveAPI
    Employee -- "6. Request Withdrawal" --> OrgContract
    OrgContract -- "Verify & Attest" --> EnclaveSigner
    EnclaveSigner -- "7. Signed ETH Payout" --> SepoliaVault
    SepoliaVault -- "Disburse Native ETH" --> EmployeeWallet

    style Client fill:#09090b,stroke:#00e5a0,color:#fff
    style CoordinationChain fill:#111,stroke:#ff4b4b,color:#fff
    style ConfidentialCompute fill:#0c1612,stroke:#00e5a0,color:#fff
    style SettlementChain fill:#111,stroke:#627eea,color:#fff
```

---

## How It Works

```
Employer                          Coston2 / TEE Enclave                   Employee
   |                                        |                                 |
   |-- Create Organization ---------------->| (UmbraOrgFactory)              |
   |                                        |                                 |
   |-- Add Employee (Encrypted Salary) ---->| (UmbraOrg & TEE Enclave State)  |
   |                                        |                                 |
   |-- Deposit Native ETH (Sepolia Vault) ->| (TEE Hardware Vault)            |
   |                                        |                                 |
   |-- Run Payroll (Coston2) -------------->| (TEE Ledger Balance Update)     |
   |                                        |                                 |
   |                                        |<--- Request Withdrawal ---------|
   |                                        |     (Enclave verifies balance)  |
   |                                        |                                 |
   |                                        |==== Native Sepolia Settlement =>|
   |                                              (Enclave-Signed ETH Tx)
```

1. **Employer creates an organization** on Flare Coston2 via `UmbraOrgFactory.sol`.
2. **Adds employees with encrypted salaries** — salary details are serialized into encrypted payloads and synced to the Coston2 contract and TEE Enclave API.
3. **Deposits funds** — plain native ETH is deposited directly to the TEE Vault address on **Ethereum Sepolia** (`0x294dB937C2b9f02A29987472a3F16918a08d1185`).
4. **Runs payroll** — one click on Coston2 updates the batch state and triggers hardware-enclave ledger balance allocations.
5. **Employees withdraw confidentially** — requests withdrawal on Coston2, and the TEE hardware enclave signs and broadcasts a native ETH settlement transaction on **Ethereum Sepolia**.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **TEE Enclave** | [Flare Confidential Compute (FCC)](https://flare.network) isolated hardware environment |
| **Coordination Chain** | Flare Coston2 Testnet (Chain ID 114) |
| **Settlement Chain** | Ethereum Sepolia (Chain ID 11155111) |
| **Contracts** | Solidity 0.8.27, Hardhat, Ethers v6 |
| **Frontend** | Next.js 16, React 19, TypeScript, Webpack |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Wallet** | wagmi v2, viem, RainbowKit |

---

## Smart Contracts (Coston2 Testnet)

| Contract | Address |
| :--- | :--- |
| **UmbraOrgFactory** | [`0x8C00cab72b52644c0F98570c5DC094E3E214B241`](https://coston2-explorer.flare.network/address/0x8C00cab72b52644c0F98570c5DC094E3E214B241) |
| **Demo UmbraOrg** | [`0x89E6fBd9B415D6E16b2cbeD92D4924659B8e9D94`](https://coston2-explorer.flare.network/address/0x89E6fBd9B415D6E16b2cbeD92D4924659B8e9D94) |
| **TEE Vault Address (Sepolia)** | `0x294dB937C2b9f02A29987472a3F16918a08d1185` |

---

## Quickstart

### Prerequisites

- Node.js 18+
- pnpm or npm
- Wallet connected to Flare Coston2 and Ethereum Sepolia testnets

### 1. Clone & Install

```bash
git clone https://github.com/Ultraviolet01/Umbra-Pay.git UmbraPay
cd UmbraPay

# Install contract dependencies
cd contract && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Run Frontend Development Server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

<p align="center">
  <sub>Salaries are private. Payments are trustless. That's Umbra Pay.</sub>
</p>
