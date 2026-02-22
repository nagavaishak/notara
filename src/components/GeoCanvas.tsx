"use client";

import { useEffect, useRef, useCallback } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";

export default function GeoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastDrawnProgress = useRef(-1);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const { scrollYProgress } = useScroll();
  const curveProgress = useTransform(scrollYProgress, [0, 0.55], [0, 1]);

  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    sizeRef.current = { w, h, dpr };
  }, []);

  const drawGrid = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const { w, h, dpr } = sizeRef.current;
    if (w === 0) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const p = Math.max(0, Math.min(1, progress));

    // === ZOOM: subtle scale from 1.0 → 1.04 ===
    const zoom = 1 + p * 0.04;
    const zoomOffsetX = (w * (zoom - 1)) / 2;
    const zoomOffsetY = (h * (zoom - 1)) / 2;
    ctx.save();
    ctx.translate(-zoomOffsetX, -zoomOffsetY);
    ctx.scale(zoom, zoom);

    // Curvature center — far below viewport for gentle curve
    const cx = w / 2;
    const cy = h * 2.2;

    // === Grid opacities ===
    const gridAlpha = 0.025 + p * 0.035;
    const labelAlpha = Math.max(0, (p - 0.12) / 0.25) * 0.15;

    // === LONGITUDE LINES (vertical → converging) ===
    const spacingX = w < 640 ? 60 : 80;
    const numV = Math.ceil(w / spacingX) + 4;
    const originX = cx - Math.floor(numV / 2) * spacingX;

    for (let i = 0; i < numV; i++) {
      const baseX = originX + i * spacingX;
      // Highlight center meridian
      const distFromCenter = Math.abs(baseX - cx) / (w / 2);
      const isCenterish = distFromCenter < 0.15;
      const alpha = isCenterish
        ? gridAlpha * 1.6
        : gridAlpha * (1 - distFromCenter * 0.3);

      ctx.beginPath();
      ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
      ctx.lineWidth = isCenterish ? 0.7 : 0.4;

      const steps = 50;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const y = t * h;

        // Convergence: lines tilt inward as they descend
        const convergence = p * 0.35 * t * t;
        const dx = (baseX - cx) * (1 - convergence);

        // Edge lift: edges curve upward
        const edgeFactor = distFromCenter * distFromCenter;
        const lift = p * edgeFactor * 45 * t * t;

        const px = cx + dx;
        const py = y + lift;

        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // === LATITUDE LINES (horizontal → bowed) ===
    const spacingY = w < 640 ? 50 : 60;
    const numH = Math.ceil(h / spacingY) + 4;
    const originY = -(numH * spacingY - h) / 2;

    for (let i = 0; i < numH; i++) {
      const baseY = originY + i * spacingY;
      const yNorm = baseY / h;
      // Denser near Dublin latitude (~35% from top)
      const dublinDist = Math.abs(yNorm - 0.35);
      const isNearDublin = dublinDist < 0.1;
      const alpha = isNearDublin
        ? gridAlpha * 1.4
        : gridAlpha * 0.65 * (1 - dublinDist * 0.5);

      ctx.beginPath();
      ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
      ctx.lineWidth = isNearDublin ? 0.6 : 0.35;

      const steps = 70;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = t * w;

        const distX = (x - cx) / (w / 2);
        // Downward bow — stronger at edges, increasing with scroll
        const bow = p * distX * distX * 50 * (0.4 + yNorm * 0.6);

        const px = x;
        const py = baseY + bow;

        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // === COORDINATE LABELS ===
    if (labelAlpha > 0.005) {
      ctx.font = `9px 'JetBrains Mono', monospace`;
      ctx.fillStyle = `rgba(16, 185, 129, ${labelAlpha})`;
      ctx.textBaseline = "middle";

      // Latitude labels — left margin
      const lats = [
        { label: "70°N", y: 0.08 },
        { label: "60°N", y: 0.2 },
        { label: "53°N", y: 0.35 },
        { label: "40°N", y: 0.5 },
        { label: "30°N", y: 0.65 },
        { label: "20°N", y: 0.8 },
      ];
      lats.forEach(({ label, y: yFrac }) => {
        const by = yFrac * h;
        const distX = (16 - cx) / (w / 2);
        const bow = p * distX * distX * 50 * (0.4 + yFrac * 0.6);
        // Dublin latitude highlighted
        const isDublin = label === "53°N";
        if (isDublin) {
          ctx.fillStyle = `rgba(16, 185, 129, ${labelAlpha * 2.5})`;
          ctx.font = `bold 9px 'JetBrains Mono', monospace`;
        } else {
          ctx.fillStyle = `rgba(16, 185, 129, ${labelAlpha})`;
          ctx.font = `9px 'JetBrains Mono', monospace`;
        }
        ctx.fillText(label, 14, by + bow);
      });

      // Longitude labels — top margin
      ctx.font = `9px 'JetBrains Mono', monospace`;
      const lons = [
        { label: "30°W", x: 0.1 },
        { label: "20°W", x: 0.25 },
        { label: "6°W", x: 0.47 },
        { label: "0°", x: 0.55 },
        { label: "10°E", x: 0.7 },
        { label: "20°E", x: 0.85 },
      ];
      lons.forEach(({ label, x: xFrac }) => {
        const bx = xFrac * w;
        const isDublinLon = label === "6°W";
        ctx.fillStyle = isDublinLon
          ? `rgba(16, 185, 129, ${labelAlpha * 2.5})`
          : `rgba(16, 185, 129, ${labelAlpha})`;
        ctx.textAlign = "center";
        ctx.fillText(label, bx, 16);
      });
      ctx.textAlign = "left";
    }

    // === DUBLIN RETICLE ===
    if (p > 0.25) {
      const rp = Math.min(1, (p - 0.25) / 0.35);
      const eased = 1 - Math.pow(1 - rp, 3); // ease-out cubic

      // Dublin position: ~47% X (slightly west), ~35% Y
      const dubX = w * 0.47;
      const dubY = h * 0.35;
      // Apply same curvature displacement
      const distX = (dubX - cx) / (w / 2);
      const bow = p * distX * distX * 50 * (0.4 + 0.35 * 0.6);
      const convergence = p * 0.35 * 0.35 * 0.35;
      const dx = (dubX - cx) * (1 - convergence);
      const rx = cx + dx;
      const ry = dubY + bow;

      const rAlpha = eased * 0.12;

      // Outer ring — expands then contracts
      const ringSize = 18 - eased * 6;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(16, 185, 129, ${rAlpha * 0.6})`;
      ctx.lineWidth = 0.5;
      ctx.arc(rx, ry, ringSize, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair
      ctx.strokeStyle = `rgba(16, 185, 129, ${rAlpha})`;
      ctx.lineWidth = 0.6;
      const gap = 4;
      const arm = 12;
      ctx.beginPath();
      ctx.moveTo(rx - arm, ry);
      ctx.lineTo(rx - gap, ry);
      ctx.moveTo(rx + gap, ry);
      ctx.lineTo(rx + arm, ry);
      ctx.moveTo(rx, ry - arm);
      ctx.lineTo(rx, ry - gap);
      ctx.moveTo(rx, ry + gap);
      ctx.lineTo(rx, ry + arm);
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(16, 185, 129, ${rAlpha * 2.5})`;
      ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Coordinate label — slides in from right
      if (rp > 0.3) {
        const textAlpha = Math.min(1, (rp - 0.3) / 0.4) * 0.2;
        const textSlide = (1 - Math.min(1, (rp - 0.3) / 0.4)) * 8;
        ctx.font = `10px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `rgba(16, 185, 129, ${textAlpha})`;
        ctx.fillText("53.3498° N", rx + 22 + textSlide, ry - 5);
        ctx.fillText(" 6.2603° W", rx + 22 + textSlide, ry + 7);
      }
    }

    ctx.restore();
  }, []);

  useMotionValueEvent(curveProgress, "change", (latest) => {
    progressRef.current = latest;
    if (Math.abs(latest - lastDrawnProgress.current) > 0.0008) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        drawGrid(progressRef.current);
        lastDrawnProgress.current = progressRef.current;
        rafRef.current = null;
      });
    }
  });

  useEffect(() => {
    updateSize();
    drawGrid(0);

    const onResize = () => {
      updateSize();
      drawGrid(progressRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawGrid, updateSize]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
    />
  );
}
