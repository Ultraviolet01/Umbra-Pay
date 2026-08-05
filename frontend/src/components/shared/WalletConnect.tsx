"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

interface WalletConnectProps {
  compact?: boolean;
}

/**
 * Custom-styled RainbowKit connect button that matches Umbra Pay's design.
 * Uses RainbowKit's custom render for full control over appearance.
 */
export function WalletConnect({ compact = false }: WalletConnectProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none" as const,
                userSelect: "none" as const,
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="btn-primary text-sm !py-2.5 !px-5"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  {!compact && (
                    <button
                      onClick={openChainModal}
                      className="hidden items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] md:flex"
                    >
                      <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      {chain.name}
                    </button>
                  )}
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 transition-colors hover:border-[var(--border-hover)]"
                  >
                    <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
                      {account.displayName}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
