import { ShieldCheck, Lock, Fingerprint, Eye } from "lucide-react";

const PRIVACY_ITEMS = [
  {
    icon: Lock,
    text: "Your salary is protected inside Flare TEE enclaves and never exposed plaintext.",
  },
  {
    icon: Fingerprint,
    text: "Decryption requires your wallet signature via EIP-712.",
  },
  {
    icon: Eye,
    text: "No one, not your employer, validators, or Umbra Pay can see your balance.",
  },
];

export function PrivacyInfo() {
  return (
    <div className="glass-card p-4 sm:p-6 !hover:transform-none">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
        <h3
          className="font-bold text-sm"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Privacy Info
        </h3>
      </div>

      <div className="space-y-3">
        {PRIVACY_ITEMS.map((item) => (
          <div key={item.text} className="flex items-start gap-2.5">
            <item.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
