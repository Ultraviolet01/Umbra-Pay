"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lock,
  Shield,
  FileText,
  ExternalLink,
  Eye,
  Printer,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { Modal } from "@/components/shared/Modal";

interface PayslipModalProps {
  onClose: () => void;
  orgAddress: `0x${string}`;
  orgName: string;
  txHash: string;
  blockNumber: bigint;
  tokenSymbol: string;
  tokenDecimals: number;
  mode: "employee" | "employer";
  employeeAddress?: `0x${string}`;
  employeeCount?: number;
}

const ETHERSCAN_URL = "https://sepolia.etherscan.io/tx";

export function PayslipModal({
  onClose,
  orgAddress,
  orgName,
  txHash,
  blockNumber,
  tokenSymbol,
  mode,
  employeeAddress,
  employeeCount,
}: PayslipModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [salary, setSalary] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [printTheme, setPrintTheme] = useState<"dark" | "light">("dark");
  const [decryptError, setDecryptError] = useState("");

  const handleDecryptSalary = useCallback(async () => {
    if (!employeeAddress) return;
    setIsDecrypting(true);
    setDecryptError("");

    try {
      const res = await fetch("/api/enclave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_balance",
          employeeAddress,
          orgAddress,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSalary(data.balanceEth);
      } else {
        setDecryptError(data.error || "TEE Query failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Decryption failed";
      setDecryptError(message);
    } finally {
      setIsDecrypting(false);
    }
  }, [employeeAddress]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const type = mode === "employee" ? "Payslip" : "Payroll Receipt";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Umbra Pay ${type} - ${orgName}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          :root {
            --accent: #00e5a0;
            --text-main: ${printTheme === "dark" ? "#fafafa" : "#09090b"};
            --text-muted: ${printTheme === "dark" ? "#a1a1aa" : "#71717a"};
            --border: ${printTheme === "dark" ? "#27272a" : "#e4e4e7"};
            --bg-light: ${printTheme === "dark" ? "#18181b" : "#f4f4f5"};
            --bg-page: ${printTheme === "dark" ? "#09090b" : "#ffffff"};
            --bg-card: ${printTheme === "dark" ? "#0c0c10" : "#ffffff"};
            --border-card: ${printTheme === "dark" ? "#27272a" : "var(--text-main)"};
          }

          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-page);
            color: var(--text-main);
            line-height: 1.5;
          }

          .print-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }

          .payslip {
            border: 2px solid var(--border-card);
            background: var(--bg-card);
            position: relative;
            overflow: hidden;
          }

          .header {
            padding: 30px;
            border-bottom: 2px solid var(--border-card);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .brand {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .logo-text {
            font-size: 28px;
            font-weight: 800;
            color: var(--accent);
            letter-spacing: -1px;
          }

          .doc-type {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--text-muted);
          }

          .badge-verified {
            font-size: 10px;
            font-weight: 700;
            padding: 4px 12px;
            border: 1px solid var(--accent);
            border-radius: 4px;
            color: #059669;
            background: #ecfdf5;
            text-transform: uppercase;
          }

          .content-body {
            padding: 40px;
          }

          .org-section {
            margin-bottom: 40px;
          }

          .org-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .org-title {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
          }

          .info-box {
            background: var(--bg-light);
            padding: 16px;
            border-radius: 8px;
          }

          .info-label {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .info-value {
            font-size: 14px;
            font-weight: 700;
            word-break: break-all;
          }

          .info-value.mono {
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
          }

          .amount-section {
            margin-top: 40px;
            padding: 30px;
            border: 2px dashed var(--border);
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .amount-label {
            font-size: 16px;
            font-weight: 600;
          }

          .amount-value {
            font-size: 36px;
            font-weight: 800;
            color: var(--text-main);
          }

          .footer {
            padding: 30px;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-text {
            font-size: 10px;
            color: var(--text-muted);
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="payslip">
            <div class="header">
              <div class="brand">
                <span class="logo-text">Umbra Pay</span>
                <span class="doc-type">${type}</span>
              </div>
              <div class="badge-verified">
                Flare TEE Verified
              </div>
            </div>

            <div class="content-body">
              <div class="org-section">
                <div class="org-label">Organization</div>
                <div class="org-title">${orgName}</div>
              </div>

              <div class="grid">
                <div class="info-box">
                  <div class="info-label">Date Issued</div>
                  <div class="info-value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Network</div>
                  <div class="info-value">Coston2 (114) / Sepolia (11155111)</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Contract Address</div>
                  <div class="info-value mono">${orgAddress}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Block Number</div>
                  <div class="info-value">#${blockNumber.toString()}</div>
                </div>
                ${
                  mode === "employee" && employeeAddress
                    ? `
                <div class="info-box" style="grid-column: span 2;">
                  <div class="info-label">Recipient Address</div>
                  <div class="info-value mono">${employeeAddress}</div>
                </div>
                `
                    : ""
                }
              </div>

              ${
                mode === "employee" && salary
                  ? `
              <div class="amount-section">
                <div class="amount-label">Net Salary Payment</div>
                <div class="amount-wrap">
                  <span class="amount-value">${salary} ETH</span>
                </div>
              </div>
              `
                  : ""
              }
            </div>

            <div class="footer">
              <div class="footer-text">Verified on Flare Coston2 and Ethereum Sepolia.</div>
              <div class="footer-text" style="font-weight: 600;">umbrapay.eth</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shortTx = txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}` : "";
  const shortOrg = `${orgAddress.slice(0, 6)}...${orgAddress.slice(-4)}`;
  const shortEmp = employeeAddress
    ? `${employeeAddress.slice(0, 6)}...${employeeAddress.slice(-4)}`
    : "";

  const modalIcon = (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] shadow-inner">
      <FileText className="h-5 w-5 text-[var(--accent)]" />
    </div>
  );

  return (
    <Modal
      onClose={onClose}
      title={mode === "employee" ? "Official Payslip" : "Payroll Receipt"}
      icon={modalIcon}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <div ref={printRef} className="relative overflow-hidden group">
          <div className="relative payslip rounded-2xl border border-[var(--border-accent)] bg-[#0c0c14] overflow-hidden shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50"></div>

            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-white/2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent)] shadow-[0_0_15px_rgba(0,229,160,0.3)]">
                  <Shield className="h-4 w-4 text-[#060608]" />
                </div>
                <span
                  className="logo text-xl font-black tracking-tighter text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  UMBRA<span className="text-[var(--accent)]">PAY</span>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest opacity-80 mb-1">
                  TEE Protocol
                </span>
                <span className="badge flex items-center gap-1 rounded-md bg-[var(--accent-muted)] border border-[var(--border-accent)] px-2 py-0.5 text-[9px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  FLARE TEE VERIFIED
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-1">
                    {mode === "employee" ? "Employee Payslip" : "Payroll Summary"}
                  </h3>
                  <h2
                    className="text-2xl font-extrabold text-[#f0f0f2] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {orgName}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">
                    TIMESTAMP
                  </p>
                  <p className="text-xs font-bold text-[var(--text-secondary)]">
                    {date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-3 rounded-xl bg-white/3 border border-white/5">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase mb-1">
                    Network
                  </span>
                  <span className="text-xs font-semibold text-white">
                    Flare Coston2 (114)
                  </span>
                </div>
                <div className="flex flex-col p-3 rounded-xl bg-white/3 border border-white/5">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase mb-1">
                    Block Height
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--accent)]">
                    #{blockNumber.toString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl bg-white/2 px-4 py-3">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    Organization
                  </span>
                  <span className="text-xs font-mono font-semibold text-white">
                    {shortOrg}
                  </span>
                </div>

                {mode === "employee" && employeeAddress && (
                  <div className="flex items-center justify-between rounded-xl bg-white/2 px-4 py-3">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Recipient
                    </span>
                    <span className="text-xs font-mono font-semibold text-white">
                      {shortEmp}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl bg-white/2 px-4 py-3">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    Transaction
                  </span>
                  <a
                    href={`${ETHERSCAN_URL}/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--accent)]"
                  >
                    {shortTx}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {mode === "employee" && (
                <div className="relative mt-4">
                  <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0e1614] p-8">
                    <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] mb-3">
                      DISBURSED AMOUNT
                    </span>

                    <AnimatePresence mode="wait">
                      {salary ? (
                        <motion.div
                          key="revealed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-baseline gap-2"
                        >
                          <span
                            className="text-4xl font-black text-white tracking-tighter"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {salary}
                          </span>
                          <span className="text-lg font-bold text-[var(--accent)]">
                            {tokenSymbol}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="encrypted"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)]">
                            <Lock className="h-3 w-3" />
                            CONFIDENTIAL TEE STATE
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {mode === "employer" && (
                <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/2 p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-4 ring-1 ring-[var(--accent)]/20">
                    <CheckCircle2 className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <h4 className="text-xl font-bold text-white tracking-tight mb-1">
                    Coston2 Payroll Verified
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-50 leading-relaxed mx-auto">
                    This transaction has been successfully confirmed and verified on Flare Coston2.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-white/1 border-t border-white/5">
              <span className="text-[9px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                ID: {txHash.slice(2, 10).toUpperCase()}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-medium text-[var(--text-muted)]">
                  umbrapay.eth
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></div>
                  ON-CHAIN
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {mode === "employee" && !salary && (
            <button
              onClick={handleDecryptSalary}
              disabled={isDecrypting}
              className="group relative w-full overflow-hidden rounded-xl bg-white/3 p-px transition-all hover:bg-white/5 disabled:opacity-50"
            >
              <div className="relative flex items-center justify-center gap-2 rounded-xl bg-[#09090b] px-6 py-4 text-sm font-bold text-white transition-all">
                {isDecrypting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                    <span>TEE QUERYING...</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-[var(--accent)]" />
                    <span>REVEAL PAYSLIP DETAILS</span>
                  </>
                )}
              </div>
            </button>
          )}

          {decryptError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 justify-center">
              <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                {decryptError}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-1">
            <button
              onClick={() => setPrintTheme("dark")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                printTheme === "dark"
                  ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)] border border-[rgba(0,229,160,0.2)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Dark PDF
            </button>
            <button
              onClick={() => setPrintTheme("light")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                printTheme === "light"
                  ? "bg-[rgba(0,229,160,0.1)] text-[var(--accent)] border border-[rgba(0,229,160,0.2)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Light PDF
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="group relative flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 text-sm font-bold text-[#060608] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="h-4 w-4" />
            <span>PRINT / GENERATE PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
