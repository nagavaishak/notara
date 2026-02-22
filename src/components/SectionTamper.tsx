"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { sha256 } from "@/lib/crypto";

const originalDocument = {
  title: "Structural Engineering Report — Block C",
  architect: "O'Brien & Associates",
  ref: "DCC-2026-07234",
  loadRating: "4.2 kN/m²",
  material: "Grade C40 Reinforced Concrete",
  coordinates: "53.3498° N, 6.2603° W",
};

// Ghost coordinate canvas — renders the flickering invalid coordinate
function GhostCoordinateCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 320 * dpr;
    canvas.height = 20 * dpr;
    ctx.scale(dpr, dpr);

    startTime.current = performance.now();
    let running = true;

    const animate = (now: number) => {
      if (!running) return;
      const elapsed = now - startTime.current;
      ctx.clearRect(0, 0, 320, 20);

      if (elapsed < 400) {
        // Flicker phase: ghost coordinate jitters
        const flickerPhase = elapsed / 400;
        const jitterX = Math.sin(elapsed * 0.05) * (3 - flickerPhase * 3);
        const jitterY = Math.cos(elapsed * 0.07) * (2 - flickerPhase * 2);
        const flickerAlpha =
          0.3 + Math.sin(elapsed * 0.03) * 0.2 + flickerPhase * 0.4;

        ctx.save();
        ctx.translate(jitterX, jitterY);
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(239, 68, 68, ${flickerAlpha})`;
        ctx.fillText("53.3498° N, 6.2611° W", 0, 14);

        // Glitch: horizontal slice displacement
        if (flickerPhase < 0.6 && Math.random() > 0.5) {
          const sliceY = 4 + Math.random() * 10;
          const sliceH = 2 + Math.random() * 4;
          const sliceShift = (Math.random() - 0.5) * 6;
          const imageData = ctx.getImageData(0, sliceY * dpr, 320 * dpr, sliceH * dpr);
          ctx.putImageData(imageData, sliceShift * dpr, sliceY * dpr);
        }
        ctx.restore();

        frameRef.current = requestAnimationFrame(animate);
      } else {
        // Settled: static invalid coordinate
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(239, 68, 68, 0.7)";
        ctx.fillText("53.3498° N, 6.2611° W", 0, 14);
        // Strikethrough
        const textWidth = ctx.measureText("53.3498° N, 6.2611° W").width;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 9);
        ctx.lineTo(textWidth, 9);
        ctx.stroke();
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{ width: 320, height: 20 }}
    />
  );
}

export default function SectionTamper() {
  const { ref, isInView } = useInView(0.2);
  const [tampered, setTampered] = useState(false);
  const [detected, setDetected] = useState(false);
  const [originalHash, setOriginalHash] = useState("");
  const [currentHash, setCurrentHash] = useState("");
  const [modifiedField, setModifiedField] = useState<string | null>(null);

  const computeOriginalHash = useCallback(async () => {
    const h = await sha256(JSON.stringify(originalDocument));
    setOriginalHash(h);
    setCurrentHash(h);
  }, []);

  useEffect(() => {
    if (isInView && !originalHash) {
      computeOriginalHash();
    }
  }, [isInView, originalHash, computeOriginalHash]);

  const attemptTamper = async (field: string) => {
    setModifiedField(field);
    setTampered(true);
    setDetected(false);

    const modified = { ...originalDocument };
    if (field === "loadRating") modified.loadRating = "2.8 kN/m²";
    if (field === "material")
      modified.material = "Grade C20 Standard Concrete";
    if (field === "coordinates")
      modified.coordinates = "53.2891° N, 6.3142° W";

    const newHash = await sha256(JSON.stringify(modified));
    setCurrentHash(newHash);

    await new Promise((r) => setTimeout(r, 800));
    setDetected(true);
  };

  const resetState = () => {
    setTampered(false);
    setDetected(false);
    setCurrentHash(originalHash);
    setModifiedField(null);
  };

  const fields = [
    {
      key: "loadRating",
      label: "Load Rating",
      original: "4.2 kN/m²",
      tampered: "2.8 kN/m²",
    },
    {
      key: "material",
      label: "Material Spec",
      original: "Grade C40 Reinforced Concrete",
      tampered: "Grade C20 Standard Concrete",
    },
    {
      key: "coordinates",
      label: "GPS Coordinates",
      original: "53.3498° N, 6.2603° W",
      tampered: "53.2891° N, 6.3142° W",
    },
  ];

  return (
    <section
      id="tamper"
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
            <div className="w-8 h-px bg-warning/40" />
            <span className="mono-label text-warning/60">
              Interactive Verification
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl">
            Try to change it.
            <br />
            <span className="text-muted">See what happens.</span>
          </h2>

          <p className="font-mono text-sm text-muted mb-16 max-w-lg">
            Every modification changes the hash. Every change is detected. There
            is no silent alteration.
          </p>

          {/* Tamper console */}
          <div
            className={`border rounded-lg overflow-hidden transition-all duration-500 ${
              detected
                ? "border-danger/40 glow-invalid"
                : tampered
                ? "border-warning/30"
                : "border-border"
            }`}
          >
            {/* Console header */}
            <div
              className={`flex items-center justify-between px-5 py-3 border-b transition-colors duration-500 ${
                detected
                  ? "bg-danger/5 border-danger/20"
                  : "bg-surface border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  {detected ? (
                    <motion.div
                      key="invalid"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-danger rounded-full"
                    />
                  ) : tampered ? (
                    <motion.div
                      key="processing"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-warning rounded-full"
                    />
                  ) : (
                    <motion.div
                      key="valid"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-accent rounded-full"
                    />
                  )}
                </AnimatePresence>
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted">
                  Document Verification Console
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={
                    detected
                      ? "tampered"
                      : tampered
                      ? "checking"
                      : "verified"
                  }
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className={`font-mono text-[10px] tracking-[0.15em] uppercase font-semibold ${
                    detected
                      ? "text-danger"
                      : tampered
                      ? "text-warning"
                      : "text-accent"
                  }`}
                >
                  {detected
                    ? "TAMPERING DETECTED"
                    : tampered
                    ? "VERIFYING..."
                    : "VERIFIED"}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Document fields */}
            <div className="p-5 bg-surface/50">
              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="mono-label block mb-1">Document</span>
                    <span className="font-mono text-xs text-foreground/70">
                      {originalDocument.title}
                    </span>
                  </div>
                  <div>
                    <span className="mono-label block mb-1">Reference</span>
                    <span className="font-mono text-xs text-foreground/70">
                      {originalDocument.ref}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Tamperable fields */}
                <div className="space-y-3">
                  <span className="mono-label block text-warning/60">
                    Click a field to attempt modification
                  </span>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {fields.map((field) => (
                      <button
                        key={field.key}
                        onClick={() => {
                          if (!tampered) attemptTamper(field.key);
                        }}
                        disabled={tampered}
                        className={`text-left p-3 rounded border transition-all duration-300 ${
                          modifiedField === field.key && detected
                            ? "border-danger/40 bg-danger/5"
                            : modifiedField === field.key && tampered
                            ? "border-warning/30 bg-warning/5"
                            : "border-border bg-surface-elevated hover:border-warning/20 hover:bg-warning/5"
                        } disabled:cursor-not-allowed`}
                      >
                        <span className="mono-label block mb-1">
                          {field.label}
                        </span>
                        <span
                          className={`font-mono text-xs transition-colors duration-300 ${
                            modifiedField === field.key && tampered
                              ? "text-danger line-through"
                              : "text-foreground/70"
                          }`}
                        >
                          {field.original}
                        </span>
                        {modifiedField === field.key && tampered && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="block font-mono text-xs text-warning mt-1"
                          >
                            {field.tampered}
                          </motion.span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hash comparison */}
              <div className="h-px bg-border mb-4" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <span className="mono-label block mb-2">
                    Original Hash (On-Chain)
                  </span>
                  <div className="p-3 bg-surface rounded border border-accent/10">
                    <p className="font-mono text-[10px] text-accent/70 break-all leading-relaxed">
                      {originalHash || "Computing..."}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="mono-label block mb-2">Current Hash</span>
                  <div
                    className={`p-3 bg-surface rounded border transition-colors duration-500 ${
                      detected
                        ? "border-danger/30"
                        : tampered
                        ? "border-warning/20"
                        : "border-accent/10"
                    }`}
                  >
                    <p
                      className={`font-mono text-[10px] break-all leading-relaxed transition-colors duration-500 ${
                        detected ? "text-danger/70" : "text-accent/70"
                      }`}
                    >
                      {currentHash || "Computing..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* === COORDINATE CONTRADICTION === */}
              <AnimatePresence>
                {tampered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border border-border/40 rounded bg-surface/80">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          className="text-muted/40"
                        >
                          <path d="M8 1.5c-2.5 0-4.5 2-4.5 4.5C3.5 9.5 8 14.5 8 14.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
                          <circle cx="8" cy="6" r="1.5" />
                        </svg>
                        <span className="mono-label text-muted/40">
                          Geospatial Verification
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {/* Original — verified */}
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] text-foreground/70 tabular-nums">
                            53.3498° N, 6.2603° W
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 bg-accent/5 border border-accent/15 rounded">
                            <span className="font-mono text-[9px] text-accent font-medium">
                              ✓
                            </span>
                            <span className="font-mono text-[8px] text-accent/50 tracking-wider uppercase">
                              Approved
                            </span>
                          </span>
                        </div>

                        {/* Ghost — canvas-rendered flicker */}
                        <div className="flex items-center gap-3 min-h-[20px]">
                          <GhostCoordinateCanvas active={detected} />
                          {detected && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.45 }}
                              className="inline-flex items-center gap-1.5 px-1.5 py-0.5 bg-danger/5 border border-danger/15 rounded flex-shrink-0"
                            >
                              <span className="font-mono text-[9px] text-danger font-medium">
                                ✕
                              </span>
                              <span className="font-mono text-[8px] text-danger/50 tracking-wider uppercase">
                                Rejected
                              </span>
                            </motion.span>
                          )}
                        </div>

                        {/* Collapse message */}
                        {detected && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.35 }}
                            className="pt-3 border-t border-border/20"
                          >
                            <p className="font-mono text-[10px] text-danger/60 leading-relaxed">
                              This no longer matches the approved site.
                              <br />
                              <span className="text-danger/35">
                                Coordinate deviation: 0.0008° — ~89m from
                                approved origin
                              </span>
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Match indicator */}
              <AnimatePresence>
                {detected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-danger/5 border border-danger/20 rounded">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 flex items-center justify-center border border-danger/40 rounded mt-0.5">
                          <span className="text-danger text-xs font-bold">
                            !
                          </span>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-danger font-semibold mb-1">
                            Hash mismatch detected
                          </p>
                          <p className="font-mono text-[11px] text-danger/60 leading-relaxed">
                            The document fingerprint does not match the on-chain
                            record. Field &quot;{modifiedField}&quot; was altered
                            after submission. This modification is now
                            permanently logged.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={resetState}
                      className="mt-4 w-full py-2.5 border border-border rounded font-mono text-[10px] tracking-[0.15em] uppercase text-muted hover:text-foreground hover:border-accent/20 transition-all duration-300"
                    >
                      Reset verification
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
