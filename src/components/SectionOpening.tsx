"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SectionOpening() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-overlay">
      {/* Subtle scan line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-px bg-accent/10 scanline" />
      </div>

      {/* Corner coordinates */}
      <div className="absolute top-20 left-6 font-mono text-[10px] text-muted/40 space-y-1">
        <div>53.3498° N</div>
        <div>6.2603° W</div>
      </div>
      <div className="absolute top-20 right-6 font-mono text-[10px] text-muted/40">
        {currentTime}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-12"
        >
          <div className="w-1.5 h-1.5 bg-accent rounded-full pulse-verified" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-accent/70 uppercase">
            Verification Protocol Active
          </span>
        </motion.div>

        {/* The Rule */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-6"
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="block text-foreground"
            >
              What was approved
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="block text-accent"
            >
              must remain provable.
            </motion.span>
          </h1>
        </motion.div>

        {/* Sub-rule */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="font-mono text-sm text-muted max-w-md mx-auto mb-16"
        >
          Tamper-proof verification for every construction document,
          approval, and revision. Permanently recorded. Impossible to forge.
        </motion.p>

        {/* Protocol status block */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="inline-flex items-center gap-6 px-6 py-3 border border-border rounded bg-surface/50"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Chain</span>
            <span className="font-mono text-xs text-foreground/70">Solana</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Finality</span>
            <span className="font-mono text-xs text-foreground/70">~400ms</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Status</span>
            <span className="font-mono text-xs text-accent">Active</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[9px] text-muted/40 tracking-[0.2em] uppercase">
          Scroll to commit
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-muted/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
