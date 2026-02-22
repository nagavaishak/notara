"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";

export default function EarthArc() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastDrawn = useRef(-1);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const arcProgress = useTransform(scrollYProgress, [0.05, 0.65], [0, 1]);

  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    sizeRef.current = { w, h, dpr };
  }, []);

  const draw = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const { w, h, dpr } = sizeRef.current;
    if (w === 0) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const p = Math.max(0, Math.min(1, progress));
    if (p < 0.01) return;

    // Arc positioned in the right half, sweeping upward
    const arcCx = w * 0.75;
    const arcCy = h * 1.5;
    const arcRadius = Math.min(w, h) * 1.3;

    // === MAIN ARC (Earth horizon silhouette) ===
    const maxSweep = Math.PI * 0.45;
    const startAngle = -Math.PI * 0.7;
    const sweep = maxSweep * p;

    // Draw with gradient-like fade at ends
    const arcSteps = 120;
    for (let s = 0; s < arcSteps; s++) {
      const t0 = s / arcSteps;
      const t1 = (s + 1) / arcSteps;
      const a0 = startAngle + sweep * t0;
      const a1 = startAngle + sweep * t1;

      // Fade at ends
      const edgeFade =
        Math.min(t0 / 0.1, 1) * Math.min((1 - t0) / 0.1, 1);
      const alpha = p * 0.08 * edgeFade;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.arc(arcCx, arcCy, arcRadius, a0, a1);
      ctx.stroke();
    }

    // === LATITUDE ARCS (parallel to main arc, inside) ===
    const numLats = 6;
    for (let i = 1; i <= numLats; i++) {
      const latR = arcRadius - i * (arcRadius * 0.06);
      const latSweep = sweep * (1 - i * 0.08);
      if (latSweep <= 0) continue;
      const latStart = startAngle + (sweep - latSweep) * 0.5;

      const latAlpha = p * 0.035 * (1 - i * 0.12);

      // Draw with edge fade
      const latSteps = 80;
      for (let s = 0; s < latSteps; s++) {
        const t0 = s / latSteps;
        const t1 = (s + 1) / latSteps;
        const a0 = latStart + latSweep * t0;
        const a1 = latStart + latSweep * t1;

        const edgeFade =
          Math.min(t0 / 0.15, 1) * Math.min((1 - t0) / 0.15, 1);
        const alpha = latAlpha * edgeFade;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 0.4;
        ctx.arc(arcCx, arcCy, latR, a0, a1);
        ctx.stroke();
      }
    }

    // === MERIDIANS (radial lines from arc center) ===
    if (p > 0.15) {
      const mp = Math.min(1, (p - 0.15) / 0.4);
      const numMeridians = 9;
      for (let i = 0; i < numMeridians; i++) {
        const t = (i + 0.5) / numMeridians;
        const angle = startAngle + sweep * t;
        const innerR = arcRadius - numLats * (arcRadius * 0.06);
        const outerR = arcRadius;

        // Fade at ends
        const mEdge = Math.min(t / 0.12, 1) * Math.min((1 - t) / 0.12, 1);
        const mAlpha = mp * 0.03 * mEdge;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(16, 185, 129, ${mAlpha})`;
        ctx.lineWidth = 0.35;
        ctx.moveTo(
          arcCx + Math.cos(angle) * innerR,
          arcCy + Math.sin(angle) * innerR
        );
        ctx.lineTo(
          arcCx + Math.cos(angle) * outerR,
          arcCy + Math.sin(angle) * outerR
        );
        ctx.stroke();
      }
    }

    // === DUBLIN MARKER on the arc ===
    if (p > 0.35) {
      const dp = Math.min(1, (p - 0.35) / 0.3);
      const eased = 1 - Math.pow(1 - dp, 3);

      // Dublin at ~30% along the arc
      const dubAngle = startAngle + sweep * 0.3;
      const dubR = arcRadius - 2 * (arcRadius * 0.06);
      const dx = arcCx + Math.cos(dubAngle) * dubR;
      const dy = arcCy + Math.sin(dubAngle) * dubR;

      const dAlpha = eased * 0.15;

      // Pulse ring
      ctx.beginPath();
      ctx.strokeStyle = `rgba(16, 185, 129, ${dAlpha * 0.5})`;
      ctx.lineWidth = 0.5;
      ctx.arc(dx, dy, 8 + (1 - eased) * 6, 0, Math.PI * 2);
      ctx.stroke();

      // Dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(16, 185, 129, ${dAlpha * 2})`;
      ctx.arc(dx, dy, 2, 0, Math.PI * 2);
      ctx.fill();

      // Label
      if (dp > 0.4) {
        const tAlpha = Math.min(1, (dp - 0.4) / 0.3) * 0.22;
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(16, 185, 129, ${tAlpha})`;

        // Position label above-right of dot
        const labelX = dx + 14;
        const labelY = dy - 12;
        ctx.fillText("Dublin", labelX, labelY);
        ctx.fillStyle = `rgba(16, 185, 129, ${tAlpha * 0.7})`;
        ctx.fillText("53.35°N 6.26°W", labelX, labelY + 12);
      }
    }
  }, []);

  useMotionValueEvent(arcProgress, "change", (latest) => {
    if (Math.abs(latest - lastDrawn.current) > 0.001) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        draw(latest);
        lastDrawn.current = latest;
        rafRef.current = null;
      });
    }
  });

  useEffect(() => {
    updateSize();
    draw(0);

    const onResize = () => {
      updateSize();
      draw(lastDrawn.current >= 0 ? lastDrawn.current : 0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw, updateSize]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
