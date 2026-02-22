"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useEffect, useState } from "react";

export default function SectionClose() {
  const { ref, isInView } = useInView(0.3);
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
    <section ref={ref} className="relative py-32 min-h-[80vh] flex items-center">
      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Divider */}
          <div className="w-16 h-px bg-accent/30 mx-auto mb-16" />

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-[1.1]">
            Accountability should not
            <br />
            depend on trust.
          </h2>

          <p className="font-mono text-sm text-muted/60 mb-16 max-w-md mx-auto">
            Notara Chain places proof in a system no single party controls.
            What was approved is provable. What was changed is visible.
            With mathematical certainty.
          </p>

          {/* CTA — subtle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="inline-flex flex-col items-center gap-6"
          >
            <a
              href="mailto:sanjay.somashekar@gmail.com"
              className="px-8 py-3.5 border border-accent/30 rounded font-mono text-sm tracking-[0.1em] text-accent hover:bg-accent/5 hover:border-accent/50 transition-all duration-300"
            >
              sanjay.somashekar@gmail.com
            </a>

            <div className="flex items-center gap-4 font-mono text-[10px] text-muted/30">
              <span>Dublin, Ireland</span>
              <div className="w-px h-3 bg-border" />
              <span>notarachain.io</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border/30">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-accent rounded-full pulse-verified" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted/40">
              NOTARA CHAIN
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted/20">
            {currentTime}
          </span>
          <span className="font-mono text-[10px] text-muted/20">
            Solana Mainnet
          </span>
        </div>
      </div>
    </section>
  );
}
