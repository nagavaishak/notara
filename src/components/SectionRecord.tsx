"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useState, useEffect, useCallback } from "react";
import { sha256 } from "@/lib/crypto";

export default function SectionRecord() {
  const { ref, isInView } = useInView(0.3);
  const [documentContent, setDocumentContent] = useState(
    "BCAR Compliance Certificate — Residential Block A-7\nArchitect: M. Sullivan | Ref: DCC-2026-04819\nStructural Load Rating: 4.2 kN/m²"
  );
  const [hash, setHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);

  const computeHash = useCallback(async () => {
    setIsHashing(true);
    setIsRecorded(false);
    const result = await sha256(documentContent);
    await new Promise((r) => setTimeout(r, 400));
    setHash(result);
    setIsHashing(false);
    await new Promise((r) => setTimeout(r, 600));
    setIsRecorded(true);
  }, [documentContent]);

  useEffect(() => {
    if (isInView && !hash) {
      computeHash();
    }
  }, [isInView, hash, computeHash]);

  return (
    <section
      id="record"
      ref={ref}
      className="relative min-h-screen flex items-center py-32"
    >
      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Section label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-accent/40" />
            <span className="mono-label">How a record is created</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-2xl">
            A document enters.
            <br />
            <span className="text-accent">A fingerprint stays forever.</span>
          </h2>

          <p className="font-mono text-sm text-muted mb-16 max-w-lg">
            Every file is reduced to a unique cryptographic hash. The hash is
            written to Solana. The file can change — the proof cannot.
          </p>

          {/* Interactive demo */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Document input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="mono-label">Document Input</span>
                <span className="mono-label text-accent/60">Editable</span>
              </div>
              <div className="relative">
                <textarea
                  value={documentContent}
                  onChange={(e) => {
                    setDocumentContent(e.target.value);
                    setHash("");
                    setIsRecorded(false);
                  }}
                  className="w-full h-48 bg-surface border border-border rounded p-4 font-mono text-sm text-foreground/80 resize-none focus:outline-none focus:border-accent/30 transition-colors duration-300"
                />
                <div className="absolute bottom-3 right-3 mono-label">
                  {documentContent.length} bytes
                </div>
              </div>
              <button
                onClick={computeHash}
                disabled={isHashing}
                className="w-full py-3 bg-surface-elevated border border-border rounded font-mono text-xs tracking-[0.15em] uppercase text-muted hover:text-foreground hover:border-accent/30 transition-all duration-300 disabled:opacity-50"
              >
                {isHashing ? "Computing hash..." : "Generate Fingerprint"}
              </button>
            </div>

            {/* Hash output */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="mono-label">On-Chain Record</span>
                {isRecorded && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mono-label text-accent"
                  >
                    Confirmed
                  </motion.span>
                )}
              </div>
              <div
                className={`h-48 bg-surface border rounded p-4 transition-all duration-500 ${
                  isRecorded
                    ? "border-accent/30 glow-verified"
                    : "border-border"
                }`}
              >
                <div className="space-y-3">
                  <div>
                    <span className="mono-label block mb-1">SHA-256</span>
                    {hash ? (
                      <motion.p
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.5 }}
                        className="font-mono text-xs text-accent break-all leading-relaxed"
                      >
                        {hash}
                      </motion.p>
                    ) : (
                      <p className="font-mono text-xs text-muted/30">
                        Awaiting input...
                      </p>
                    )}
                  </div>
                  <div className="h-px bg-border" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="mono-label block mb-1">Timestamp</span>
                      <span className="font-mono text-[11px] text-foreground/50">
                        {isRecorded
                          ? new Date()
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 19)
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="mono-label block mb-1">Block</span>
                      <span className="font-mono text-[11px] text-foreground/50">
                        {isRecorded ? "284,719,847" : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="mono-label block mb-1">Coordinates</span>
                      <span className="font-mono text-[11px] text-foreground/50">
                        {isRecorded ? "53.3498°N, 6.2603°W" : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="mono-label block mb-1">Finality</span>
                      <span className="font-mono text-[11px] text-foreground/50">
                        {isRecorded ? "412ms" : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation bar */}
              {isRecorded && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded"
                >
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span className="font-mono text-[10px] text-accent">
                    Written to Solana. Confirmed by 1,847 validators. Irreversible.
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
