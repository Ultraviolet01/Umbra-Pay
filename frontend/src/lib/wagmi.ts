import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "viem/chains";
import { http, Chain } from "viem";

export const flareCoston2: Chain = {
  id: 114,
  name: "Flare Coston2",
  nativeCurrency: {
    name: "Coston2 Flare",
    symbol: "CFLR",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_COSTON2_RPC || "https://coston2-api.flare.network/ext/C/rpc"],
    },
    public: {
      http: ["https://coston2-api.flare.network/ext/C/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Coston2 Explorer",
      url: "https://coston2-explorer.flare.network",
    },
  },
  testnet: true,
};

const COSTON2_RPC = process.env.NEXT_PUBLIC_COSTON2_RPC || "https://coston2-api.flare.network/ext/C/rpc";
const SEPOLIA_RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com";

export const config = getDefaultConfig({
  appName: "Umbra Pay",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c4f79cc821944d9680842e34466bfb00",
  chains: [flareCoston2, sepolia],
  ssr: true,
  transports: {
    [flareCoston2.id]: http(COSTON2_RPC),
    [sepolia.id]: http(SEPOLIA_RPC),
  },
});
