# CLAUDE.md — Umbra Pay

## Project Overview

Umbra Pay is a privacy-first on-chain payroll platform built on **Flare Confidential Compute (FCC)** using isolated **Trusted Execution Environment (TEE)** enclaves. Employers can create organizations on Flare Coston2, add employees, assign encrypted salaries, and trigger manual batch payroll — all while keeping salary amounts, balances, and disbursements fully encrypted inside the enclave state.

No plain text salary is ever stored or exposed on-chain. Settlements are signed natively on **Ethereum Sepolia** by the hardware TEE vault itself.

---

## Two-Chain Architecture

1. **Coston2 Testnet (Chain ID 114)** — Coordination Chain
   - `UmbraOrgFactory.sol` and `UmbraOrg.sol` live here.
   - All admin and employee logic that isn't a deposit or withdrawal settlement signs here (create org, add employee, update salary, run payroll, request withdrawal).
2. **Ethereum Sepolia (Chain ID 11155111)** — Money Chain
   - Native ETH deposits land directly in the TEE Vault address (`0x294dB937C2b9f02A29987472a3F16918a08d1185`).
   - Withdrawal settlements are executed natively on Sepolia, signed directly by the hardware TEE vault enclave key.

---

## Architecture & Components

- **Smart Contracts** (`/contract`):
  - `UmbraOrgFactory.sol`: Deploys organization coordination instances on Coston2.
  - `UmbraOrg.sol`: Manages employee lists, encrypted salary hex records, payroll batch logs, and withdrawal requests on Coston2.
- **Frontend** (`/frontend`):
  - Next.js 16 + TypeScript + Wagmi + Viem + RainbowKit.
  - UI styled with a liquid dark theme, modern cards, glassmorphic elements, and rich animations.
  - Enclave API route (`/api/enclave`): Acts as the backend interface for confidential solvency proof generation, enclave salary sync, and withdrawal settlement execution.

---

## Core User Flows

### Flow 1: Employer Creates Organization
1. Employer connects wallet to Flare Coston2.
2. Calls `createOrg(name, teeVaultAddress)` on `UmbraOrgFactory.sol`.
3. Organization deployed on Coston2.

### Flow 2: Employer Adds Employee
1. Employer inputs employee wallet address & salary (ETH).
2. Frontend serializes salary into encrypted payload hex and submits to `addEmployees()` on `UmbraOrg.sol`.
3. Payload synced with TEE Enclave API (`/api/enclave`).

### Flow 3: Employer Deposits Funds
1. Employer sends plain native ETH directly to the TEE Vault address on **Ethereum Sepolia**.
2. TEE Vault balance update is verifiable via hardware solvency proofs (`action=solvency`).

### Flow 4: Employer Runs Batch Payroll
1. Employer clicks **"Run Payroll"** on Coston2.
2. `runPayroll()` transaction updates batch state on `UmbraOrg.sol`.
3. TEE Enclave updates employee private balance ledgers inside hardware isolation.

### Flow 5: Employee Withdraws Funds
1. Employee requests withdrawal on Coston2 (`requestWithdrawal`).
2. TEE Enclave verifies ledger allocation and issues a native ETH transaction directly on **Ethereum Sepolia** to the employee's recipient wallet.
