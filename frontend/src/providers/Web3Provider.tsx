"use client";

import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const umbraPayTheme = darkTheme({
  accentColor: "#00e5a0",
  accentColorForeground: "#04040c",
  borderRadius: "medium",
  overlayBlur: "small",
});

// Override specific theme tokens to match Umbra Pay's design system
const customTheme = {
  ...umbraPayTheme,
  colors: {
    ...umbraPayTheme.colors,
    modalBackground: "#0e0e24",
    modalBorder: "rgba(255, 255, 255, 0.06)",
    profileForeground: "#08081a",
    connectButtonBackground: "#08081a",
    connectButtonInnerBackground: "rgba(255, 255, 255, 0.03)",
  },
  fonts: {
    body: "var(--font-jakarta), system-ui, sans-serif",
  },
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
