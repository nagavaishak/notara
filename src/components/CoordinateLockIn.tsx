"use client";

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";

export default function CoordinateLockIn() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "center 0.45"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.65], [0, 0.2, 1]);
  const letterSpacing = useTransform(scrollYProgress, [0, 0.4, 0.8], [12, 4, 0]);
  const borderOpacity = useTransform(scrollYProgress, [0.55, 0.9], [0, 1]);
  const scale = useTransform(scrollYProgress, [0.5, 0.9], [1.03, 1]);
  const labelY = useTransform(scrollYProgress, [0.5, 0.85], [6, 0]);
  const scanWidth = useTransform(scrollYProgress, [0.3, 0.85], [0, 100]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.88 && !locked) setLocked(true);
  });

  return (
    <div ref={containerRef} className="relative my-16 py-8">
      <motion.div
        style={{ opacity, scale }}
        className="flex flex-col items-center gap-1 relative"
      >
        {/* Label */}
        <motion.span
          style={{ opacity, y: labelY }}
          className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted/40 mb-4"
        >
          Document Origin
        </motion.span>

        {/* Coordinate display */}
        <div className="relative px-8 py-4">
          {/* Bounding box */}
          <motion.div
            style={{ opacity: borderOpacity }}
            className="absolute -inset-x-3 -inset-y-1"
          >
            {/* Main border — animates from dashed to solid feel */}
            <div
              className={`absolute inset-0 border rounded transition-all duration-500 ${
                locked ? "border-accent/35" : "border-accent/10"
              }`}
            />

            {/* Corner brackets — forensic precision */}
            <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-accent/50 rounded-tl-[2px]" />
            <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-accent/50 rounded-tr-[2px]" />
            <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-accent/50 rounded-bl-[2px]" />
            <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-accent/50 rounded-br-[2px]" />

            {/* Horizontal scan line — sweeps once during lock-in */}
            <motion.div
              style={{
                width: scanWidth,
                opacity: borderOpacity,
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-accent/30 via-accent/15 to-transparent"
              // width expressed as motion value mapped to %
            />
          </motion.div>

          <div className="flex flex-col items-center gap-1">
            <motion.span
              style={{ letterSpacing }}
              className={`font-mono text-xl sm:text-2xl tabular-nums transition-colors duration-500 ${
                locked ? "text-foreground" : "text-foreground/80"
              }`}
            >
              53.3498° N
            </motion.span>
            <motion.span
              style={{ letterSpacing }}
              className={`font-mono text-xl sm:text-2xl tabular-nums transition-colors duration-500 ${
                locked ? "text-foreground" : "text-foreground/80"
              }`}
            >
              6.2603° W
            </motion.span>
          </div>

          {/* Lock icon — snaps in */}
          {locked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -right-14 top-1/2 -translate-y-1/2"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded border border-accent/30 bg-accent/[0.04]">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-accent/70"
                >
                  <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" />
                  <path d="M4 5V3.5a2 2 0 114 0V5" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            </motion.div>
          )}
        </div>

        {/* Status line */}
        <motion.div
          style={{ opacity: borderOpacity }}
          className="mt-5 flex items-center gap-2.5"
        >
          <div
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              locked ? "bg-accent shadow-[0_0_6px_rgba(16,185,129,0.4)]" : "bg-muted/20"
            }`}
          />
          <span
            className={`font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-500 ${
              locked ? "text-accent/60" : "text-muted/25"
            }`}
          >
            {locked ? "Position Locked — Immutable" : "Resolving coordinates..."}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
