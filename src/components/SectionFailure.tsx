"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useInView } from "@/hooks/useInView";

const timeline = [
  {
    phase: "APPROVAL",
    year: "Day 0",
    title: "Plans submitted and approved",
    detail: "Building design passes review. Permit issued.",
    status: "valid",
    mono: "STATUS: APPROVED",
  },
  {
    phase: "MODIFICATION",
    year: "Day 47",
    title: "Plans quietly replaced",
    detail:
      "Cheaper materials substituted. Load-bearing calculations altered. Database record updated by admin.",
    status: "warning",
    mono: "STATUS: MODIFIED — NO RECORD",
  },
  {
    phase: "CONSTRUCTION",
    year: "Month 14",
    title: "Building constructed to altered plans",
    detail:
      "Inspectors reference the modified file. The original no longer exists in the system.",
    status: "warning",
    mono: "ORIGINAL HASH: NOT FOUND",
  },
  {
    phase: "COLLAPSE",
    year: "Year 3",
    title: "Structural failure. 74 dead.",
    detail:
      "Investigation launched. Officials deny alterations. The database shows only the current version. There is no proof.",
    status: "danger",
    mono: "VERIFICATION: IMPOSSIBLE",
  },
];

export default function SectionFailure() {
  const { ref, isInView } = useInView(0.15);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ["0%", "100%"]);

  return (
    <section
      id="failure"
      ref={ref}
      className="relative min-h-screen py-32"
    >
      <div ref={containerRef} className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-danger/40" />
            <span className="mono-label text-danger/60">Failure Pattern</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl">
            This is how buildings fail.
            <br />
            <span className="text-danger/80">The records fail first.</span>
          </h2>

          <p className="font-mono text-sm text-muted mb-20 max-w-lg">
            Thane, India. 74 people. Celtic Tiger, Ireland. 100,000 apartments.
            The pattern is always the same.
          </p>

          {/* Timeline */}
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border">
              <motion.div
                className="w-full bg-danger/40 origin-top"
                style={{ height: lineHeight }}
              />
            </div>

            <div className="space-y-16">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative pl-14"
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-3 top-1 w-3 h-3 rounded-full border-2 ${
                      item.status === "valid"
                        ? "border-accent bg-accent/20"
                        : item.status === "warning"
                        ? "border-warning bg-warning/20"
                        : "border-danger bg-danger/20"
                    }`}
                  />

                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`font-mono text-[10px] tracking-[0.15em] uppercase ${
                        item.status === "valid"
                          ? "text-accent/60"
                          : item.status === "warning"
                          ? "text-warning/60"
                          : "text-danger/60"
                      }`}
                    >
                      {item.phase}
                    </span>
                    <span className="font-mono text-[10px] text-muted/40">
                      {item.year}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-2 text-foreground/90">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted leading-relaxed mb-3">
                    {item.detail}
                  </p>

                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded font-mono text-[10px] tracking-wider ${
                      item.status === "valid"
                        ? "bg-accent/5 text-accent/70 border border-accent/10"
                        : item.status === "warning"
                        ? "bg-warning/5 text-warning/70 border border-warning/10"
                        : "bg-danger/5 text-danger/70 border border-danger/10"
                    }`}
                  >
                    {item.mono}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom statement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-20 pt-8 border-t border-danger/10"
            >
              <p className="font-mono text-sm text-danger/60 text-center">
                Without an independent record, there is no accountability.
                <br />
                There is only the version someone chose to keep.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
