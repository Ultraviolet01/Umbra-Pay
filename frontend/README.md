# Umbra Pay - Frontend

The Next.js 16 frontend application for **Umbra Pay**, privacy-first on-chain payroll powered by Flare Confidential Compute (FCC).

For full architecture details, smart contract addresses, and execution flows, see the main [Root README](../README.md).

## Development Setup

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

## Environment Variables

Configure `.env.local` with deployed Coston2 contract addresses:

```env
NEXT_PUBLIC_FACTORY_ADDRESS=0x8C00cab72b52644c0F98570c5DC094E3E214B241
NEXT_PUBLIC_DEMO_ORG_ADDRESS=0x89E6fBd9B415D6E16b2cbeD92D4924659B8e9D94
NEXT_PUBLIC_TEE_VAULT_ADDRESS=0x294dB937C2b9f02A29987472a3F16918a08d1185
```

## Roadmap

Future network support planned for:
1. **XRP Network (XRPL / XRPL EVM)**
2. **BNB Chain**
3. **Arbitrum Network**
4. **Base Network**

