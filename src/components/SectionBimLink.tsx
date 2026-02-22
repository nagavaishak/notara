"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "@/hooks/useInView";
import { sha256 } from "@/lib/crypto";

export default function SectionBimLink() {
  const { ref, isInView } = useInView(0.2);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [linkHash, setLinkHash] = useState("");

  const generateLink = useCallback(async () => {
    const h = await sha256(
      "BIM-DCC-2026-04819-Block-A7-v1.0-Sullivan-Architects"
    );
    setLinkHash(h.slice(0, 16));
  }, []);

  useEffect(() => {
    if (isInView && !linkHash) {
      generateLink();
    }
  }, [isInView, linkHash, generateLink]);

  const handleVerify = async () => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    setVerifying(false);
    setVerified(true);
  };

  return (
    <section
      id="bimlink"
      ref={ref}
      className="relative min-h-screen flex items-center py-32"
    >
      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-accent/40" />
            <span className="mono-label">Permanent Artifact</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl">
            One link.
            <br />
            <span className="text-accent">Permanent proof.</span>
          </h2>

          <p className="font-mono text-sm text-muted mb-20 max-w-lg">
            The BIM Link is not a URL. It is a sealed verification artifact.
            Anyone can click it. No login. No technical knowledge.
            The truth is one click away.
          </p>

          {/* BIM Link artifact */}
          <div className="max-w-2xl mx-auto">
            <div
              className={`relative border rounded-lg overflow-hidden transition-all duration-700 ${
                verified
                  ? "border-accent/40 glow-verified"
                  : "border-border"
              }`}
            >
              {/* Seal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 border border-border rounded">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={`transition-colors duration-500 ${
                        verified ? "text-accent" : "text-muted"
                      }`}
                    >
                      <path
                        d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V4L8 1z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill={verified ? "currentColor" : "none"}
                        fillOpacity={verified ? 0.15 : 0}
                      />
                      {verified && (
                        <path
                          d="M5.5 8L7 9.5L10.5 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.15em] text-muted uppercase block">
                      BIM Link
                    </span>
                    <span className="font-mono text-xs text-foreground/70">
                      notara.io/verify/{linkHash || "..."}
                    </span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {verified ? (
                    <motion.div
                      key="verified"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="stamp-in flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded"
                    >
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      <span className="font-mono text-[10px] text-accent font-semibold tracking-wider">
                        VERIFIED
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-surface-elevated border border-border rounded"
                    >
                      <div className="w-1.5 h-1.5 bg-muted/50 rounded-full" />
                      <span className="font-mono text-[10px] text-muted tracking-wider">
                        PENDING
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Document details */}
              <div className="p-6 bg-surface/30 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="mono-label block mb-1.5">Document</span>
                    <span className="text-sm text-foreground/80">
                      Residential Block A-7 — Structural Design
                    </span>
                  </div>
                  <div>
                    <span className="mono-label block mb-1.5">Submitted by</span>
                    <span className="text-sm text-foreground/80">
                      Sullivan Architects Ltd
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="mono-label block mb-1.5">Filed</span>
                    <span className="font-mono text-xs text-foreground/60">
                      2026-02-18
                    </span>
                  </div>
                  <div>
                    <span className="mono-label block mb-1.5">Approvals</span>
                    <span className="font-mono text-xs text-foreground/60">
                      3 of 3 signed
                    </span>
                  </div>
                  <div>
                    <span className="mono-label block mb-1.5">Revisions</span>
                    <span className="font-mono text-xs text-foreground/60">
                      1 (current)
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <span className="mono-label block mb-1.5">
                    Document Fingerprint
                  </span>
                  <div className="p-3 bg-background rounded border border-border">
                    <p className="font-mono text-[10px] text-foreground/40 break-all leading-relaxed">
                      a7f3b2c9d1e4f5a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4
                    </p>
                  </div>
                </div>

                {/* Approval chain */}
                <div>
                  <span className="mono-label block mb-3">
                    Approval Chain (On-Chain)
                  </span>
                  <div className="space-y-2">
                    {[
                      {
                        role: "Architect",
                        name: "M. Sullivan",
                        date: "2026-02-18",
                      },
                      {
                        role: "Structural Eng.",
                        name: "K. Brennan",
                        date: "2026-02-19",
                      },
                      {
                        role: "Building Inspector",
                        name: "DCC Compliance",
                        date: "2026-02-20",
                      },
                    ].map((approver) => (
                      <div
                        key={approver.role}
                        className="flex items-center justify-between px-3 py-2 bg-surface-elevated rounded border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                          <span className="font-mono text-[10px] text-accent/60 w-28">
                            {approver.role}
                          </span>
                          <span className="text-xs text-foreground/70">
                            {approver.name}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted">
                          {approver.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verify button */}
              <div className="p-6 border-t border-border bg-surface/50">
                <button
                  onClick={handleVerify}
                  disabled={verified || verifying}
                  className={`w-full py-4 rounded font-mono text-sm tracking-[0.15em] uppercase transition-all duration-500 ${
                    verified
                      ? "bg-accent/10 border border-accent/30 text-accent cursor-default"
                      : verifying
                      ? "bg-surface-elevated border border-warning/20 text-warning/70 cursor-wait"
                      : "bg-surface-elevated border border-border text-foreground/80 hover:border-accent/30 hover:text-accent"
                  }`}
                >
                  {verified
                    ? "Document integrity confirmed"
                    : verifying
                    ? "Verifying against on-chain record..."
                    : "Verify this document"}
                </button>
              </div>
            </div>

            {/* Below link note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center font-mono text-[11px] text-muted/40 mt-6"
            >
              No account required. No software needed. One click. One truth.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
