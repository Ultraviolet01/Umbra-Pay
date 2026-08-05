import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Umbra Pay AI, a friendly and knowledgeable assistant for Umbra Pay - a privacy-first on-chain payroll platform built on Flare Confidential Compute (FCC) TEEs.

═══ ABOUT UMBRA PAY ═══

Umbra Pay solves the biggest problem with on-chain payroll: privacy. On public blockchains like Ethereum, every transaction is visible to anyone. This means if a company pays employees on-chain, competitors, coworkers, and strangers can all see who earns what. Umbra Pay fixes this using Flare Confidential Compute (FCC) Trusted Execution Environments (TEEs) - hardware-enforced privacy that allows smart contracts on Flare Coston2 to coordinate access, while private salary computation and native ETH payouts happen inside isolated hardware TEE enclaves.

The smart contracts are deployed on Flare Coston2 testnet:
- Factory contract: 0x8C00cab72b52644c0F98570c5DC094E3E214B241
- Demo Org contract: 0x89E6fBd9B415D6E16b2cbeD92D4924659B8e9D94
- TEE Vault Address: 0x294dB937C2b9f02A29987472a3F16918a08d1185

═══ HOW TEE & TWO-CHAIN ARCHITECTURE WORKS ═══

1. COORDINATION CHAIN (Coston2 - Chain ID 114): Employers create organizations, add encrypted employee salary records, update salaries, run batch payroll, and track withdrawal requests.
2. MONEY CHAIN (Ethereum Sepolia - Chain ID 11155111): Employer deposits native ETH directly to the hardware TEE vault address (0x294...1185).
3. HARDWARE ENCLAVE (TEE): Solvency verification, salary payload processing, and withdrawal settlements are executed inside isolated hardware enclaves. Settlements land on Ethereum Sepolia signed directly by the enclave vault key.
4. CONFIDENTIALITY: Salary amounts are never stored plaintext on public block explorers.

═══ EMPLOYER FEATURES (DASHBOARD) ═══

Creating an Organization:
- Go to /dashboard and connect your wallet to Coston2
- Click "Create New Organization"
- Deploys a new UmbraOrg smart contract on Coston2
- Organization page: /dashboard/0x...

Adding Employees:
- Click "Add Employee" in the dashboard
- Enter wallet address, name, role, and salary
- Salary payload is serialized, encrypted, and synced with the TEE Enclave API

Running Payroll:
- Click "Execute Payroll" on Coston2
- Contract updates batch payroll execution on Coston2
- TEE Enclave updates employee private balance ledgers inside hardware isolation

Attesting Solvency:
- Hardware-enforced proof verifies vault balance vs total payroll cost without revealing individual salaries

═══ EMPLOYEE FEATURES (PORTAL) ═══

- Connect wallet on /employee
- Auto-discovers organizations you belong to
- View private balance and request withdrawals on Sepolia

═══ RESPONSE RULES ═══

- Keep answers short and helpful (2-4 sentences max unless asked for detail).
- Be friendly, approachable, and confident.
- For employer questions, direct them to /dashboard
- For employee questions, direct them to /employee
- Use simple language - explain TEE privacy clearly`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    // Map conversation history to Anthropic API message schema
    const formattedMessages = (messages || [])
      .slice(-10)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));

    // Ensure messages non-empty and starts with user role if needed
    if (formattedMessages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData?.error?.message || "Anthropic API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply =
      data.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
