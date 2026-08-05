"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Table2 } from "lucide-react";

interface ExportEvent {
  type: string;
  details: string;
  txHash: string;
  blockNumber: string;
  etherscanLink: string;
}

interface ExportHistoryProps {
  events: ExportEvent[];
  orgName: string;
  tokenSymbol: string;
  /** "employer" or "employee" - affects filename and PDF title */
  mode: "employer" | "employee";
}

const ETHERSCAN_URL = "https://sepolia.etherscan.io/tx";

export function ExportHistory({ events, orgName, tokenSymbol, mode }: ExportHistoryProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (events.length === 0) return null;

  const safeName = orgName.replace(/\s+/g, "-").toLowerCase();
  const filePrefix = mode === "employer" ? `umbrapay-history-${safeName}` : `umbrapay-transactions-${safeName}`;

  const handleCSV = () => {
    const rows = [
      ["Type", "Details", "Transaction Hash", "Block Number", "Etherscan Link"],
      ...events.map((e) => [e.type, e.details, e.txHash, e.blockNumber, e.etherscanLink]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filePrefix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const handlePDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    setOpen(false);

    const title = mode === "employer" ? "Activity Report" : "Transaction Report";
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const eventRows = events
      .map(
        (e, i) => `
        <tr class="${i % 2 === 0 ? "row-even" : ""}">
          <td>
            <span class="type-badge ${e.type.includes("Payroll") ? "type-payroll" : e.type.includes("Deposit") ? "type-deposit" : "type-withdrawal"}">
              ${e.type}
            </span>
          </td>
          <td class="details">${e.details}</td>
          <td class="mono"><a href="${e.etherscanLink}" class="tx-link">${e.txHash.slice(0, 10)}...${e.txHash.slice(-6)}</a></td>
          <td class="mono">#${e.blockNumber}</td>
        </tr>`
      )
      .join("");

    // Count summaries
    const payrollCount = events.filter((e) => e.type.includes("Payroll")).length;
    const depositCount = events.filter((e) => e.type.includes("Deposit")).length;
    const withdrawalCount = events.filter((e) => e.type.includes("Withdrawal")).length;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Umbra Pay ${title} - ${orgName}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #ffffff;
            color: #09090b;
            line-height: 1.6;
          }

          .page {
            max-width: 900px;
            margin: 0 auto;
            padding: 48px 40px;
          }

          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 24px;
            border-bottom: 2px solid #09090b;
          }

          .brand {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .logo {
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -1px;
            color: #09090b;
          }

          .logo span { color: #00c48c; }

          .doc-type {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #71717a;
          }

          .meta {
            text-align: right;
          }

          .meta-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #a1a1aa;
            margin-bottom: 2px;
          }

          .meta-value {
            font-size: 13px;
            font-weight: 600;
            color: #09090b;
          }

          .meta-row { margin-bottom: 8px; }

          /* Org info */
          .org-section {
            margin-bottom: 32px;
          }

          .org-name {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 4px;
          }

          .org-sub {
            font-size: 13px;
            color: #71717a;
          }

          /* Summary cards */
          .summary {
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
          }

          .summary-card {
            flex: 1;
            padding: 16px 20px;
            background: #fafafa;
            border-radius: 10px;
            border: 1px solid #f0f0f0;
          }

          .summary-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #a1a1aa;
            margin-bottom: 4px;
          }

          .summary-value {
            font-size: 24px;
            font-weight: 800;
            color: #09090b;
          }

          .summary-value.accent { color: #00c48c; }

          /* Table */
          .table-wrap {
            border: 1px solid #e4e4e7;
            border-radius: 12px;
            overflow: hidden;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          thead th {
            text-align: left;
            padding: 12px 16px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #71717a;
            background: #fafafa;
            border-bottom: 1px solid #e4e4e7;
          }

          tbody td {
            padding: 12px 16px;
            font-size: 13px;
            border-bottom: 1px solid #f4f4f5;
            vertical-align: middle;
          }

          tbody tr:last-child td { border-bottom: none; }
          .row-even { background: #fafafa; }

          .mono {
            font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
            font-size: 12px;
          }

          .details { font-weight: 500; }

          .type-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }

          .type-payroll { background: #ecfdf5; color: #059669; }
          .type-deposit { background: #eff6ff; color: #2563eb; }
          .type-withdrawal { background: #fef2f2; color: #dc2626; }

          .tx-link {
            color: #059669;
            text-decoration: none;
          }

          .tx-link:hover { text-decoration: underline; }

          /* Footer */
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e4e4e7;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-text {
            font-size: 10px;
            color: #a1a1aa;
          }

          .footer-badge {
            font-size: 10px;
            font-weight: 700;
            color: #059669;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .footer-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #00c48c;
          }

          .no-print { text-align: center; margin-top: 20px; }

          @media print {
            .page { padding: 24px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              <div class="logo">UMBRA<span>PAY</span></div>
              <div class="doc-type">${title}</div>
            </div>
            <div class="meta">
              <div class="meta-row">
                <div class="meta-label">Generated</div>
                <div class="meta-value">${date}</div>
              </div>
              <div class="meta-row">
                <div class="meta-label">Network</div>
                <div class="meta-value">Ethereum Sepolia</div>
              </div>
              <div class="meta-row">
                <div class="meta-label">Currency</div>
                <div class="meta-value">${tokenSymbol}</div>
              </div>
            </div>
          </div>

          <div class="org-section">
            <div class="org-name">${orgName}</div>
            <div class="org-sub">${events.length} transactions on record</div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Total Events</div>
              <div class="summary-value">${events.length}</div>
            </div>
            ${payrollCount > 0 ? `
            <div class="summary-card">
              <div class="summary-label">${mode === "employer" ? "Payroll Runs" : "Payroll Credits"}</div>
              <div class="summary-value accent">${payrollCount}</div>
            </div>` : ""}
            ${depositCount > 0 ? `
            <div class="summary-card">
              <div class="summary-label">Deposits</div>
              <div class="summary-value">${depositCount}</div>
            </div>` : ""}
            ${withdrawalCount > 0 ? `
            <div class="summary-card">
              <div class="summary-label">Withdrawals</div>
              <div class="summary-value">${withdrawalCount}</div>
            </div>` : ""}
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Transaction</th>
                  <th>Block</th>
                </tr>
              </thead>
              <tbody>
                ${eventRows}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div class="footer-text">
              This report was generated from on-chain data on the Ethereum Sepolia network.
              All transactions are publicly verifiable via Etherscan.
            </div>
            <div class="footer-badge">
              <div class="footer-dot"></div>
              ON-CHAIN VERIFIED
            </div>
          </div>

          <div class="no-print">
            <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 4px;">
              Use <strong>Ctrl+P</strong> / <strong>Cmd+P</strong> to save as PDF
            </p>
            <p style="font-size: 11px; color: #d4d4d8;">
              Tip: Enable "Background Graphics" in print settings for best results.
            </p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500);
    };
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--border-accent)] hover:bg-[rgba(0,229,160,0.04)] transition-all"
        title="Export history"
      >
        <Download className="h-3 w-3" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-[var(--border-accent)] bg-[var(--bg-primary)] shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,229,160,0.05)] overflow-hidden"
          >
            <div className="p-1">
              <button
                onClick={handlePDF}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[rgba(0,229,160,0.06)] transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Export as PDF
              </button>
              <button
                onClick={handleCSV}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[rgba(0,229,160,0.06)] transition-colors"
              >
                <Table2 className="h-3.5 w-3.5" />
                Export as CSV
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
