"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import CoordinateLockIn from "./CoordinateLockIn";

const immutableFields = [
  {
    label: "Timestamp",
    value: "2026-02-18T14:32:07Z",
    description: "The exact moment the document was recorded",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Author Identity",
    value: "5Tz9...kR4w (Verified Wallet)",
    description: "Cryptographic proof of who submitted the document",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="8" cy="6" r="3" />
        <path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "GPS Coordinates",
    value: "53.3498° N, 6.2603° W",
    description: "Where the document was submitted from",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M8 1.5c-2.5 0-4.5 2-4.5 4.5C3.5 9.5 8 14.5 8 14.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
        <circle cx="8" cy="6" r="1.5" />
      </svg>
    ),
  },
  {
    label: "File Fingerprint",
    value: "SHA-256: a7f3b2c9...d8e0f2a4",
    description: "Mathematically unique to the exact file contents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="2" width="12" height="12" rx="2" />
        <path d="M5 8h6M8 5v6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Approval Chain",
    value: "3 signatures (Architect, Engineer, Inspector)",
    description: "Every sign-off recorded with identity and timestamp",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M4 8l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Revision History",
    value: "Version 1 of 1 — No modifications",
    description: "Complete, ordered history of every change",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M3 4h10M3 8h7M3 12h4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function SectionImmutable() {
  const { ref, isInView } = useInView(0.15);

  return (
    <section
      id="immutable"
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
            <span className="mono-label">Immutable Record</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl">
            A fingerprint stays forever.
          </h2>

          <p className="font-mono text-sm text-muted mb-8 max-w-lg">
            Once written to Solana, these fields are confirmed by 1,000+
            independent validators. No single party can modify them. Not
            the developer. Not the government. Not us.
          </p>

          {/* Coordinate Lock-In */}
          <CoordinateLockIn />

          {/* Fields grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {immutableFields.map((field, i) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative p-5 border border-border rounded-lg bg-surface/30 hover:border-accent/20 hover:bg-surface/60 transition-all duration-300"
              >
                {/* Lock icon */}
                <div className="absolute top-4 right-4">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-muted/20 group-hover:text-accent/40 transition-colors duration-300"
                  >
                    <rect
                      x="2"
                      y="5"
                      width="8"
                      height="6"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <path
                      d="M4 5V3.5a2 2 0 114 0V5"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                </div>

                <div className="text-accent/50 mb-3">{field.icon}</div>

                <span className="font-mono text-[10px] tracking-[0.15em] text-muted uppercase block mb-2">
                  {field.label}
                </span>

                <p className="font-mono text-xs text-foreground/70 mb-2">
                  {field.value}
                </p>

                <p className="text-[11px] text-muted/60 leading-relaxed">
                  {field.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 flex items-center gap-3 px-4 py-3 border border-accent/10 rounded bg-accent/[0.02]"
          >
            <div className="w-1 h-8 bg-accent/30 rounded-full" />
            <p className="font-mono text-[11px] text-accent/50 leading-relaxed">
              These are not features. They are constraints enforced by
              cryptography and distributed consensus. They cannot be turned
              off.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
