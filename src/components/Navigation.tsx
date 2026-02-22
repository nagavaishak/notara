"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "record", label: "RECORD" },
  { id: "failure", label: "FAILURE" },
  { id: "tamper", label: "TAMPER" },
  { id: "bimlink", label: "BIM LINK" },
  { id: "immutable", label: "IMMUTABLE" },
  { id: "protocol", label: "PROTOCOL" },
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [blockHeight, setBlockHeight] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);
      setBlockHeight(Math.floor(progress * 847291) + 284719263);

      const sections = navItems.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return { id: item.id, top: 0 };
        return { id: item.id, top: el.getBoundingClientRect().top };
      });

      const current = sections
        .filter((s) => s.top <= window.innerHeight / 3)
        .pop();
      if (current) setActiveSection(current.id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-12 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-accent rounded-full pulse-verified" />
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-foreground">
            NOTARA CHAIN
          </span>
        </div>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] transition-all duration-300 rounded ${
                activeSection === item.id
                  ? "text-accent bg-accent/5"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-muted">
            <span className="text-accent/60">BLK</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={blockHeight}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="text-foreground/50 tabular-nums"
              >
                {blockHeight.toLocaleString()}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
            <span className="font-mono text-[10px] text-accent/80">LIVE</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-px w-full bg-border/50 relative">
        <motion.div
          className="h-px bg-accent/40 absolute left-0 top-0"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </motion.nav>
  );
}
