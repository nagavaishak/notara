"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import EarthArc from "./EarthArc";

const layers = [
  {
    label: "TRUST",
    name: "Solana",
    description:
      "Document hashes, GPS coordinates, approval signatures, revision history. Confirmed by 1,000+ validators worldwide.",
    detail: "Anchor Framework · PDAs · Squads Protocol v4",
    color: "accent",
  },
  {
    label: "STORAGE",
    name: "Cloud + Arweave",
    description:
      "BIM files, CAD drawings, inspection reports. Content-addressed hashing. Optional permanent archival.",
    detail: "Content-Addressed · Encrypted · Redundant",
    color: "accent",
  },
  {
    label: "LOGIC",
    name: "Node.js",
    description:
      "API gateway, submission queue, event indexing, searchable metadata. All country-specific logic lives here.",
    detail: "Helius Indexing · PostgreSQL · Event-Driven",
    color: "accent",
  },
  {
    label: "CLIENT",
    name: "Next.js",
    description:
      "Upload dashboard, approval workflows, wallet connection, and the public BIM Link verification page.",
    detail: "Phantom · Backpack · Public Verification",
    color: "accent",
  },
];

export default function SectionProtocol() {
  const { ref, isInView } = useInView(0.15);

  return (
    <section
      id="protocol"
      ref={ref}
      className="relative min-h-screen flex items-center py-32"
    >
      {/* Scroll-driven Earth arc background */}
      <EarthArc />

      <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-accent/40" />
            <span className="mono-label">Architecture</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl">
            One protocol.
            <br />
            <span className="text-accent">Every market.</span>
          </h2>

          <p className="font-mono text-sm text-muted mb-16 max-w-lg">
            The on-chain layer stores universal primitives: hashes, coordinates,
            timestamps, signatures. All country-specific logic lives off-chain.
          </p>

          {/* Architecture layers */}
          <div className="space-y-3 max-w-3xl">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, x: -15 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group flex items-stretch border border-border rounded-lg overflow-hidden bg-surface/30 hover:border-accent/20 transition-all duration-300"
              >
                {/* Layer indicator */}
                <div className="w-1 bg-accent/20 group-hover:bg-accent/50 transition-colors duration-300" />

                {/* Layer label */}
                <div className="w-28 sm:w-32 flex-shrink-0 flex flex-col justify-center px-4 py-4 border-r border-border">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-accent/50 block mb-1">
                    LAYER {i + 1}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.15em] text-foreground/60 uppercase">
                    {layer.label}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 px-5 py-4">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-display text-sm font-semibold text-foreground/90">
                      {layer.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mb-2">
                    {layer.description}
                  </p>
                  <span className="font-mono text-[10px] text-accent/40">
                    {layer.detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Markets */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-16 grid sm:grid-cols-2 gap-4 max-w-3xl"
          >
            <div className="p-5 border border-border rounded-lg bg-surface/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] tracking-[0.15em] text-accent/50 uppercase">
                  Launch
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">
                Ireland
              </h3>
              <p className="text-xs text-muted leading-relaxed mb-3">
                BCAR compliance. Assigned Certifiers with personal liability.
                Direct market access from Dublin.
              </p>
              <span className="font-mono text-[10px] text-foreground/30">
                Market size: ~15B by 2030
              </span>
            </div>

            <div className="p-5 border border-border rounded-lg bg-surface/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] tracking-[0.15em] text-accent/50 uppercase">
                  Scale
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">
                India
              </h3>
              <p className="text-xs text-muted leading-relaxed mb-3">
                RERA mandatory project registration. 35,000+ registered
                projects. Documented corruption and building collapses.
              </p>
              <span className="font-mono text-[10px] text-foreground/30">
                Market size: $200B+ annually
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
