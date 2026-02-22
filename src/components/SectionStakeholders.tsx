"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

const stakeholders = [
  {
    role: "Developers",
    action: "Submit documents. Get cryptographic proof of compliance.",
    protection: "If there is ever a dispute, lawsuit, or audit — the record speaks.",
  },
  {
    role: "Architects & Engineers",
    action: "Sign off on designs. Record is tied to their identity.",
    protection: "Personal liability protected by independent, immutable proof.",
  },
  {
    role: "Insurance Companies",
    action: "Access verified project data via API.",
    protection: "Cleaner risk assessment. Lower disputes. Better pricing.",
  },
  {
    role: "Regulators",
    action: "Recognize cryptographic verification as compliance evidence.",
    protection: "No system changes needed. The proof exists independently.",
  },
  {
    role: "The Public",
    action: "Click a BIM Link. Verify any building.",
    protection: "Accountability through technology. No trust required.",
  },
];

export default function SectionStakeholders() {
  const { ref, isInView } = useInView(0.15);

  return (
    <section ref={ref} className="relative py-32">
      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-accent/40" />
            <span className="mono-label">Participants</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl">
            Everyone verifies.
            <br />
            <span className="text-accent">No one is trusted.</span>
          </h2>

          <p className="font-mono text-sm text-muted mb-16 max-w-lg">
            The system does not depend on the honesty of any participant.
            It depends on cryptography.
          </p>

          <div className="space-y-2 max-w-3xl">
            {stakeholders.map((s, i) => (
              <motion.div
                key={s.role}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0 p-4 border border-border rounded-lg bg-surface/20 hover:border-accent/15 transition-all duration-300"
              >
                <div className="sm:w-44 flex-shrink-0">
                  <span className="font-mono text-xs font-semibold text-foreground/80">
                    {s.role}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground/60 mb-1">{s.action}</p>
                  <p className="font-mono text-[11px] text-accent/50">
                    {s.protection}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
