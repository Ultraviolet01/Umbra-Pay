"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  Lock,
  Wallet,
  HelpCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  { icon: HelpCircle, label: "What is Umbra Pay?" },
  { icon: Lock, label: "How does TEE keep salaries private?" },
  { icon: Wallet, label: "How do I get started as an employer?" },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setHasInteracted(true);
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();
        const reply = data.reply || data.error || "Sorry, something went wrong.";

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: reply,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Connection error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* ── Floating Button ──────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <div className="relative">
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 animate-ping" />
              {/* Glow */}
              <div className="absolute -inset-1 rounded-full bg-[var(--accent)] opacity-10 blur-md group-hover:opacity-20 transition-opacity duration-300" />
              {/* Button */}
              <div className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] text-[#09090b] shadow-[0_4px_24px_rgba(0,229,160,0.3)] transition-all duration-300 group-hover:shadow-[0_4px_32px_rgba(0,229,160,0.5)] group-hover:scale-105">
                <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] max-h-[100dvh] sm:max-h-[560px] flex flex-col sm:rounded-2xl border border-[var(--border)] bg-[#0c0c10] shadow-[0_16px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              {/* Subtle header glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 100% at 30% 0%, rgba(0,229,160,0.06) 0%, transparent 70%)",
                }}
              />
              <div className="relative flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-muted)] border border-[var(--border-accent)]">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Umbra Pay AI
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[280px] max-h-[380px]">
              {!hasInteracted && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-4"
                >
                  {/* Welcome */}
                  <div className="text-center py-2">
                    <p
                      className="text-sm font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Hey, how can I help?
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Ask me anything about Umbra Pay
                    </p>
                  </div>

                  {/* Quick questions */}
                  <div className="space-y-2">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={q.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                        onClick={() => sendMessage(q.label)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.015)] px-4 py-3 text-left transition-all duration-200 hover:border-[var(--border-accent)] hover:bg-[rgba(0,229,160,0.03)]"
                      >
                        <q.icon className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                        <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          {q.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[var(--accent)] text-[#09090b] rounded-br-md font-medium"
                        : "bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-[rgba(255,255,255,0.04)] border border-[var(--border)] px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[var(--border)] px-4 py-3">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Umbra Pay..."
                  disabled={isLoading}
                  className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-accent)] transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[#09090b] transition-all duration-200 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-[var(--text-muted)]">
                Powered by AI · May make mistakes
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
