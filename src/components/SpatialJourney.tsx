"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const N = 800;
const GLOBE_R = 400;
const FOV = 800;
const VH = 200;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const TILT = 0.4; // globe Y-rotation so Dublin is off-center initially
const DUB_LAT = (53.35 * Math.PI) / 180;
const DUB_LON = (-6.26 * Math.PI) / 180;

// ═══════════════════════════════════════════════════════════════
// 3D MATH
// ═══════════════════════════════════════════════════════════════
function rY(x: number, z: number, a: number): [number, number] {
  const c = Math.cos(a),
    s = Math.sin(a);
  return [x * c - z * s, x * s + z * c];
}
function rX(y: number, z: number, a: number): [number, number] {
  const c = Math.cos(a),
    s = Math.sin(a);
  return [y * c - z * s, y * s + z * c];
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ss = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

type Proj = { x: number; y: number; s: number; d: number };

function proj(
  px: number,
  py: number,
  pz: number,
  cx: number,
  cy: number,
  cz: number,
  crY: number,
  crX: number,
  hw: number,
  hh: number
): Proj | null {
  let dx = px - cx,
    dy = py - cy,
    dz = pz - cz;
  [dx, dz] = rY(dx, dz, -crY);
  [dy, dz] = rX(dy, dz, -crX);
  if (dz < 2) return null;
  const s = FOV / dz;
  return { x: dx * s + hw, y: -dy * s + hh, s, d: dz };
}

// ═══════════════════════════════════════════════════════════════
// CAMERA PATH
// ═══════════════════════════════════════════════════════════════
//              p      x     y       z      rY     rX
type CK = readonly [number, number, number, number, number, number];
const CAM: CK[] = [
  [0.0, 0, 0, -5500, 0, 0], // deep space
  [0.15, 0, 0, -4000, 0, 0], // drifting
  [0.2, 0, 0, -2800, 0, 0], // stars begin collapse
  [0.35, 0, 0, -1500, 0, 0], // globe forming
  [0.4, 0, 0, -1200, 0, 0], // globe full
  [0.45, 0, 50, -1050, -0.12, -0.18], // panning toward Dublin
  [0.55, 0, 90, -850, -0.12, -0.18], // Dublin centered
  [0.6, 0, 160, -550, -0.06, 0.2], // begin descent
  [0.7, 0, 450, -50, 0, 0.95], // diving through
  [0.78, 0, 550, 40, 0, 1.2], // overhead
  [0.85, 0, 520, 50, 0, 1.18], // land view
  [0.92, 0, 480, 55, 0, 1.12], // site forming
  [1.0, 0, 460, 55, 0, 1.1], // locked
];

function getCam(p: number) {
  let i = 0;
  while (i < CAM.length - 2 && CAM[i + 1][0] < p) i++;
  const a = CAM[i],
    b = CAM[i + 1];
  const t = ss(a[0], b[0], p);
  return {
    x: lerp(a[1], b[1], t),
    y: lerp(a[2], b[2], t),
    z: lerp(a[3], b[3], t),
    rY: lerp(a[4], b[4], t),
    rX: lerp(a[5], b[5], t),
  };
}

// ═══════════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════
interface Pt {
  sx: number;
  sy: number;
  sz: number; // space
  gx: number;
  gy: number;
  gz: number; // globe
  lx: number;
  ly: number;
  lz: number; // land
  cx: number;
  cy: number;
  cz: number; // construction
  dub: boolean;
  br: number;
}

function generate(n: number): Pt[] {
  // Dublin on globe
  let dubGx = GLOBE_R * Math.cos(DUB_LAT) * Math.sin(DUB_LON);
  const dubGy = GLOBE_R * Math.sin(DUB_LAT);
  let dubGz = -GLOBE_R * Math.cos(DUB_LAT) * Math.cos(DUB_LON);
  [dubGx, dubGz] = rY(dubGx, dubGz, TILT);

  const gW = Math.ceil(Math.sqrt(n));
  const gSp = 22;
  const sW = 20;
  const sSp = 16;
  const pts: Pt[] = [];

  for (let i = 0; i < n; i++) {
    // Space scatter
    const sx = (Math.random() - 0.5) * 9000;
    const sy = (Math.random() - 0.5) * 7000;
    const sz = (Math.random() - 0.5) * 9000;

    // Globe (fibonacci sphere)
    const theta = Math.acos(1 - (2 * (i + 0.5)) / n);
    const phi = GOLDEN * i;
    let gx = GLOBE_R * Math.sin(theta) * Math.cos(phi);
    const gy = GLOBE_R * Math.cos(theta);
    let gz = -GLOBE_R * Math.sin(theta) * Math.sin(phi);
    [gx, gz] = rY(gx, gz, TILT);

    const dub =
      Math.sqrt(
        (gx - dubGx) ** 2 + (gy - dubGy) ** 2 + (gz - dubGz) ** 2
      ) < 75;

    // Land grid
    const row = Math.floor(i / gW),
      col = i % gW;
    const lx = (col - gW / 2) * gSp;
    const lz = (row - gW / 2) * gSp;

    // Construction site (smaller, denser)
    const sRow = Math.floor(i / sW),
      sCol = i % sW;
    const ccx = (sCol - sW / 2) * sSp;
    const ccz = (sRow - sW / 2) * sSp;

    pts.push({
      sx,
      sy,
      sz,
      gx,
      gy,
      gz,
      lx,
      ly: 0,
      lz,
      cx: ccx,
      cy: 0,
      cz: ccz,
      dub,
      br: 0.25 + Math.random() * 0.75,
    });
  }
  return pts;
}

// ═══════════════════════════════════════════════════════════════
// WIREFRAME GLOBE HELPERS
// ═══════════════════════════════════════════════════════════════
function drawCircle(
  ctx: CanvasRenderingContext2D,
  points: (Proj | null)[],
  alpha: number,
  lineWidth: number = 0.5
) {
  ctx.strokeStyle = `rgba(16,185,129,${alpha})`;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  let moved = false;
  for (const p of points) {
    if (p) {
      if (!moved) {
        ctx.moveTo(p.x, p.y);
        moved = true;
      } else ctx.lineTo(p.x, p.y);
    } else {
      moved = false;
    }
  }
  ctx.stroke();
}

function globeCirclePoints(
  latDeg: number,
  cam: ReturnType<typeof getCam>,
  hw: number,
  hh: number,
  segments: number = 72
): (Proj | null)[] {
  const latRad = (latDeg * Math.PI) / 180;
  const r = GLOBE_R * Math.cos(latRad);
  const y = GLOBE_R * Math.sin(latRad);
  const pts: (Proj | null)[] = [];
  for (let s = 0; s <= segments; s++) {
    const a = ((s / segments) * Math.PI * 2);
    let px = r * Math.cos(a);
    let pz = r * Math.sin(a);
    [px, pz] = rY(px, pz, TILT);
    // Only draw front-facing hemisphere (facing camera)
    const toCamera = [cam.x - px, cam.y - y, cam.z - pz];
    const dot = px * toCamera[0] + y * toCamera[1] + pz * toCamera[2];
    if (dot < 0) {
      pts.push(null);
      continue;
    }
    pts.push(proj(px, y, pz, cam.x, cam.y, cam.z, cam.rY, cam.rX, hw, hh));
  }
  return pts;
}

function meridianPoints(
  lonDeg: number,
  cam: ReturnType<typeof getCam>,
  hw: number,
  hh: number,
  segments: number = 72
): (Proj | null)[] {
  const lonRad = (lonDeg * Math.PI) / 180;
  const pts: (Proj | null)[] = [];
  for (let s = 0; s <= segments; s++) {
    const latRad = ((s / segments) * Math.PI - Math.PI / 2);
    let px = GLOBE_R * Math.cos(latRad) * Math.sin(lonRad);
    const py = GLOBE_R * Math.sin(latRad);
    let pz = -GLOBE_R * Math.cos(latRad) * Math.cos(lonRad);
    [px, pz] = rY(px, pz, TILT);
    const toCamera = [cam.x - px, cam.y - py, cam.z - pz];
    const dot = px * toCamera[0] + py * toCamera[1] + pz * toCamera[2];
    if (dot < 0) {
      pts.push(null);
      continue;
    }
    pts.push(
      proj(px, py, pz, cam.x, cam.y, cam.z, cam.rY, cam.rX, hw, hh)
    );
  }
  return pts;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function SpatialJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useMemo(() => generate(N), []);
  const rafRef = useRef(0);
  const lastP = useRef(-1);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth,
      h = innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + "px";
    c.style.height = h + "px";
    sizeRef.current = { w, h, dpr };
  }, []);

  // ─── Main draw ────────────────────────────────────────────
  const draw = useCallback(
    (p: number) => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d", { alpha: false });
      if (!ctx) return;
      const { w, h, dpr } = sizeRef.current;
      if (!w) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#08090a";
      ctx.fillRect(0, 0, w, h);

      const hw = w / 2,
        hh = h / 2;
      const cam = getCam(p);

      // ── Morph factors ─────────────────────────────────────
      const toGlobe = ss(0.14, 0.36, p);
      const globeDim = ss(0.42, 0.5, p); // dim non-Dublin in scene 3
      const toDescend = ss(0.56, 0.73, p);
      const toSite = ss(0.84, 0.96, p);
      const stretchPeak =
        ss(0.57, 0.64, p) * (1 - ss(0.67, 0.74, p));
      const fadeInSpace = ss(0.0, 0.04, p);

      // ── SCENE 1–2: Draw particles ────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        let x: number, y: number, z: number;

        if (p < 0.56) {
          // Space → Globe
          x = lerp(pt.sx, pt.gx, toGlobe);
          y = lerp(pt.sy, pt.gy, toGlobe);
          z = lerp(pt.sz, pt.gz, toGlobe);
        } else if (p < 0.84) {
          // Globe → Land
          x = lerp(pt.gx, pt.lx, toDescend);
          y = lerp(pt.gy, pt.ly, toDescend);
          z = lerp(pt.gz, pt.lz, toDescend);
          // Vertical stretch during descent
          const dir = pt.gy > 0 ? 1 : -1;
          y += stretchPeak * dir * 280 * (1 - toDescend);
        } else {
          // Land → Site
          x = lerp(pt.lx, pt.cx, toSite);
          y = lerp(pt.ly, pt.cy, toSite);
          z = lerp(pt.lz, pt.cz, toSite);
        }

        const pr = proj(
          x, y, z,
          cam.x, cam.y, cam.z, cam.rY, cam.rX,
          hw, hh
        );
        if (!pr) continue;
        if (pr.x < -80 || pr.x > w + 80 || pr.y < -80 || pr.y > h + 80)
          continue;

        let alpha = pt.br * fadeInSpace;
        let size = clamp(180 * pr.s, 0.4, 3.5);
        let r = 255,
          g = 255,
          b = 255;

        // ── Scene-specific appearance ───────────────────
        if (p < 0.2) {
          // Scene 1: Abstract space — sparse white dots
          alpha *= 0.35;
          size *= 0.55;
        } else if (p < 0.42) {
          // Scene 2: Collapsing into globe
          const globeBlend = ss(0.2, 0.36, p);
          r = Math.round(lerp(255, 16, globeBlend));
          g = Math.round(lerp(255, 185, globeBlend));
          b = Math.round(lerp(255, 129, globeBlend));
          alpha *= lerp(0.35, 0.65, globeBlend);
        } else if (p < 0.56) {
          // Scene 3: Globe with Dublin highlight
          r = 16; g = 185; b = 129;
          if (pt.dub) {
            alpha = clamp(fadeInSpace * 1.2, 0, 1);
            size *= 2.0;
          } else {
            alpha *= lerp(0.6, 0.12, globeDim);
          }
        } else if (p < 0.73) {
          // Scene 4: Descent — stretching lines
          r = 16; g = 185; b = 129;
          alpha *= 0.3 * (1 - toDescend * 0.4);

          // Draw stretch lines
          if (stretchPeak > 0.05) {
            const lineLen = stretchPeak * 18 * pr.s * 200;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16,185,129,${alpha * 0.25})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pr.x, pr.y - lineLen / 2);
            ctx.lineTo(pr.x, pr.y + lineLen / 2);
            ctx.stroke();
          }
        } else if (p < 0.85) {
          // Scene 5: Land grid
          r = 16; g = 185; b = 129;
          alpha *= 0.4;
        } else {
          // Scene 6: Construction site
          r = 16; g = 185; b = 129;
          alpha *= 0.3 + toSite * 0.4;
          size = clamp(size * (1 + toSite * 0.5), 0.5, 3);
        }

        // Draw particle
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.arc(pr.x, pr.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════
      // SCENE OVERLAYS
      // ═══════════════════════════════════════════════════════

      // ── Globe wireframe (Scenes 2–3) ──────────────────────
      if (p > 0.26 && p < 0.57) {
        const wfA = ss(0.28, 0.36, p) * (1 - ss(0.53, 0.57, p));
        if (wfA > 0.005) {
          // Latitude circles
          const lats = [0, 23.4, -23.4, 53.35, -40, 66.5];
          for (const lat of lats) {
            const isDublinLat = Math.abs(lat - 53.35) < 0.1;
            const pts = globeCirclePoints(lat, cam, hw, hh);
            drawCircle(
              ctx, pts,
              isDublinLat ? wfA * 0.25 : wfA * 0.1,
              isDublinLat ? 0.8 : 0.4
            );
          }
          // Meridians
          const mers = [-60, -30, -6.26, 0, 30, 60, 90];
          for (const lon of mers) {
            const isDublinMer = Math.abs(lon - -6.26) < 0.1;
            const pts = meridianPoints(lon, cam, hw, hh);
            drawCircle(
              ctx, pts,
              isDublinMer ? wfA * 0.25 : wfA * 0.1,
              isDublinMer ? 0.8 : 0.4
            );
          }
        }
      }

      // ── "Earth" label (Scene 2) ────────────────────────────
      if (p > 0.32 && p < 0.42) {
        const a = ss(0.33, 0.37, p) * (1 - ss(0.39, 0.42, p));
        if (a > 0.01) {
          const lbl = proj(
            0, -GLOBE_R * 1.25, 0,
            cam.x, cam.y, cam.z, cam.rY, cam.rX,
            hw, hh
          );
          if (lbl) {
            ctx.font = `300 11px 'JetBrains Mono', monospace`;
            ctx.textAlign = "center";
            ctx.fillStyle = `rgba(107,114,128,${a * 0.35})`;
            ctx.fillText("Earth", lbl.x, lbl.y);
            ctx.textAlign = "left";
          }
        }
      }

      // ── Dublin pulse + coordinates (Scene 3) ──────────────
      if (p > 0.42 && p < 0.58) {
        let dx = GLOBE_R * Math.cos(DUB_LAT) * Math.sin(DUB_LON);
        const dy = GLOBE_R * Math.sin(DUB_LAT);
        let dz = -GLOBE_R * Math.cos(DUB_LAT) * Math.cos(DUB_LON);
        [dx, dz] = rY(dx, dz, TILT);

        const dp = proj(
          dx, dy, dz,
          cam.x, cam.y, cam.z, cam.rY, cam.rX,
          hw, hh
        );
        if (dp) {
          // Expanding pulse rings
          const r1P = ss(0.42, 0.52, p);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(16,185,129,${(1 - r1P) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.arc(dp.x, dp.y, r1P * 35, 0, Math.PI * 2);
          ctx.stroke();

          const r2P = ss(0.45, 0.54, p);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(16,185,129,${(1 - r2P) * 0.35})`;
          ctx.lineWidth = 0.6;
          ctx.arc(dp.x, dp.y, r2P * 25, 0, Math.PI * 2);
          ctx.stroke();

          // Bright center dot
          ctx.beginPath();
          ctx.fillStyle = `rgba(16,185,129,0.9)`;
          ctx.arc(dp.x, dp.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Coordinates
          const tA = ss(0.46, 0.51, p) * (1 - ss(0.55, 0.58, p));
          if (tA > 0.01) {
            const slide = (1 - ss(0.46, 0.51, p)) * 10;
            ctx.font = `500 13px 'JetBrains Mono', monospace`;
            ctx.fillStyle = `rgba(16,185,129,${tA * 0.85})`;
            ctx.fillText("53.3498° N", dp.x + 24 + slide, dp.y - 10);
            ctx.fillText(" 6.2603° W", dp.x + 24 + slide, dp.y + 8);
          }
        }
      }

      // ── Plot outline (Scene 5) ─────────────────────────────
      if (p > 0.76 && p < 0.88) {
        const plotA = ss(0.77, 0.82, p) * (1 - ss(0.85, 0.88, p));
        if (plotA > 0.01) {
          const sz = 140;
          const corners = [
            [-sz, 0, -sz],
            [sz, 0, -sz],
            [sz, 0, sz],
            [-sz, 0, sz],
          ].map(([px, py, pz]) =>
            proj(
              px, py, pz,
              cam.x, cam.y, cam.z, cam.rY, cam.rX,
              hw, hh
            )
          );

          if (corners.every((c) => c !== null)) {
            // Fill
            ctx.fillStyle = `rgba(16,185,129,${plotA * 0.02})`;
            ctx.beginPath();
            ctx.moveTo(corners[0]!.x, corners[0]!.y);
            for (let i = 1; i < 4; i++)
              ctx.lineTo(corners[i]!.x, corners[i]!.y);
            ctx.closePath();
            ctx.fill();

            // Outline
            ctx.strokeStyle = `rgba(16,185,129,${plotA * 0.35})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Coordinates on ground
            const coordPt = proj(
              -sz - 30, 0, -sz - 10,
              cam.x, cam.y, cam.z, cam.rY, cam.rX,
              hw, hh
            );
            if (coordPt) {
              ctx.font = `400 10px 'JetBrains Mono', monospace`;
              ctx.fillStyle = `rgba(16,185,129,${plotA * 0.5})`;
              ctx.fillText("53.3498° N", coordPt.x, coordPt.y);
              ctx.fillText(" 6.2603° W", coordPt.x, coordPt.y + 13);
            }
          }
        }
      }

      // ── Construction site + lock (Scene 6) ─────────────────
      if (p > 0.86) {
        const siteA = ss(0.87, 0.93, p);
        const lockA = ss(0.95, 0.995, p);

        if (siteA > 0.01) {
          // Site boundary
          const bSz = 110;
          const bc = [
            [-bSz, 0, -bSz],
            [bSz, 0, -bSz],
            [bSz, 0, bSz],
            [-bSz, 0, bSz],
          ].map(([px, py, pz]) =>
            proj(
              px, py, pz,
              cam.x, cam.y, cam.z, cam.rY, cam.rX,
              hw, hh
            )
          );

          if (bc.every((c) => c !== null)) {
            // Filled ground
            ctx.fillStyle = `rgba(16,185,129,${siteA * 0.015})`;
            ctx.beginPath();
            ctx.moveTo(bc[0]!.x, bc[0]!.y);
            for (let i = 1; i < 4; i++) ctx.lineTo(bc[i]!.x, bc[i]!.y);
            ctx.closePath();
            ctx.fill();

            // Border
            ctx.strokeStyle = `rgba(16,185,129,${siteA * 0.45})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Corner brackets
            const bLen = 14;
            for (const corner of bc) {
              if (!corner) continue;
              const cx = corner.x,
                cy = corner.y;
              ctx.strokeStyle = `rgba(16,185,129,${siteA * 0.6})`;
              ctx.lineWidth = 1.5;
              // determine bracket direction based on corner position
              const dirX = cx < hw ? 1 : -1;
              const dirY = cy < hh ? 1 : -1;
              ctx.beginPath();
              ctx.moveTo(cx + dirX * bLen, cy);
              ctx.lineTo(cx, cy);
              ctx.lineTo(cx, cy + dirY * bLen);
              ctx.stroke();
            }
          }

          // Column grid (5x5)
          const colSp = 42;
          for (let row = -2; row <= 2; row++) {
            for (let col = -2; col <= 2; col++) {
              const cp = proj(
                col * colSp, 0, row * colSp,
                cam.x, cam.y, cam.z, cam.rY, cam.rX,
                hw, hh
              );
              if (cp) {
                // Column dot
                ctx.beginPath();
                ctx.fillStyle = `rgba(16,185,129,${siteA * 0.55})`;
                ctx.arc(cp.x, cp.y, 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Small cross
                ctx.strokeStyle = `rgba(16,185,129,${siteA * 0.2})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(cp.x - 5, cp.y);
                ctx.lineTo(cp.x + 5, cp.y);
                ctx.moveTo(cp.x, cp.y - 5);
                ctx.lineTo(cp.x, cp.y + 5);
                ctx.stroke();
              }
            }
          }

          // Grid lines connecting columns
          ctx.strokeStyle = `rgba(16,185,129,${siteA * 0.08})`;
          ctx.lineWidth = 0.4;
          for (let row = -2; row <= 2; row++) {
            ctx.beginPath();
            let started = false;
            for (let col = -2; col <= 2; col++) {
              const cp = proj(
                col * colSp, 0, row * colSp,
                cam.x, cam.y, cam.z, cam.rY, cam.rX,
                hw, hh
              );
              if (cp) {
                if (!started) {
                  ctx.moveTo(cp.x, cp.y);
                  started = true;
                } else ctx.lineTo(cp.x, cp.y);
              }
            }
            ctx.stroke();
          }
          for (let col = -2; col <= 2; col++) {
            ctx.beginPath();
            let started = false;
            for (let row = -2; row <= 2; row++) {
              const cp = proj(
                col * colSp, 0, row * colSp,
                cam.x, cam.y, cam.z, cam.rY, cam.rX,
                hw, hh
              );
              if (cp) {
                if (!started) {
                  ctx.moveTo(cp.x, cp.y);
                  started = true;
                } else ctx.lineTo(cp.x, cp.y);
              }
            }
            ctx.stroke();
          }
        }

        // ── "Origin locked." text ──────────────────────────
        if (lockA > 0.01) {
          ctx.textAlign = "center";

          // Lock icon (drawn as shapes)
          const lx = hw,
            ly = h - 100;
          ctx.strokeStyle = `rgba(16,185,129,${lockA * 0.6})`;
          ctx.lineWidth = 1.2;
          // Lock body
          ctx.strokeRect(lx - 8, ly, 16, 12);
          // Lock shackle
          ctx.beginPath();
          ctx.arc(lx, ly, 6, Math.PI, 0);
          ctx.stroke();

          // Text
          ctx.font = `500 14px 'JetBrains Mono', monospace`;
          ctx.fillStyle = `rgba(16,185,129,${lockA * 0.75})`;
          ctx.fillText("Origin locked.", hw, h - 60);

          ctx.font = `400 10px 'JetBrains Mono', monospace`;
          ctx.fillStyle = `rgba(107,114,128,${lockA * 0.45})`;
          ctx.fillText("53.3498° N  ·  6.2603° W", hw, h - 40);

          ctx.textAlign = "left";
        }
      }

      // ── Vignette ──────────────────────────────────────────
      const vig = ctx.createRadialGradient(hw, hh, h * 0.35, hw, hh, h * 0.85);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(8,9,10,0.45)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    },
    [particles]
  );

  // ─── Scroll-driven rendering ────────────────────────────────
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (Math.abs(v - lastP.current) > 0.0004) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        draw(v);
        lastP.current = v;
      });
    }
  });

  // ─── Setup ──────────────────────────────────────────────────
  useEffect(() => {
    resize();
    draw(0);

    const handleResize = () => {
      resize();
      draw(lastP.current < 0 ? 0 : lastP.current);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [resize, draw]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${VH}vh` }}
      className="relative z-[100] bg-[#08090a]"
    >
      <canvas
        ref={canvasRef}
        className="sticky top-0 block"
      />
    </div>
  );
}
