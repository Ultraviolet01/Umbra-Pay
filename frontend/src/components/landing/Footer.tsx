import { Logo } from "@/components/shared/Logo";

const FOOTER_LINKS = ["Features", "How it Works", "Security"];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="mx-auto flex max-w-[var(--max-width)] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <Logo size="sm" />

        <div className="flex items-center gap-8">
          {FOOTER_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
            >
              {item}
            </a>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          &copy; 2026 Umbra Pay. Built with Flare Confidential Compute.
        </p>
      </div>
    </footer>
  );
}
