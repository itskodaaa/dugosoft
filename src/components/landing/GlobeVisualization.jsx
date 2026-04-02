import React, { useEffect, useRef } from "react";

const NODES = [
  { lat: 40.7, lng: -74.0, label: "New York" },
  { lat: 51.5, lng: -0.1, label: "London" },
  { lat: 48.8, lng: 2.35, label: "Paris" },
  { lat: 35.7, lng: 139.7, label: "Tokyo" },
  { lat: -23.5, lng: -46.6, label: "São Paulo" },
  { lat: 1.35, lng: 103.8, label: "Singapore" },
  { lat: 55.7, lng: 37.6, label: "Moscow" },
  { lat: -33.9, lng: 18.4, label: "Cape Town" },
  { lat: 19.4, lng: -99.1, label: "Mexico City" },
  { lat: 28.6, lng: 77.2, label: "Delhi" },
  { lat: 31.2, lng: 121.5, label: "Shanghai" },
  { lat: 52.5, lng: 13.4, label: "Berlin" },
  { lat: -37.8, lng: 144.9, label: "Melbourne" },
  { lat: 25.2, lng: 55.3, label: "Dubai" },
];

function latLngToXY(lat, lng, radius, cx, cy, rotation) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + rotation) * (Math.PI / 180);
  const x = cx + radius * Math.sin(phi) * Math.cos(theta);
  const y = cy + radius * Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  return { x, y, z };
}

export default function GlobeVisualization() {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const frameRef = useRef(null);
  const pulseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.38;

    const COLORS = { orange: "#f97316", green: "#10b981", blue: "#4f8ef7" };

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const rot = rotationRef.current;
      pulseRef.current += 0.04;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.3);
      outerGlow.addColorStop(0, "rgba(79,142,247,0.08)");
      outerGlow.addColorStop(0.5, "rgba(16,185,129,0.05)");
      outerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Globe base gradient
      const grad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
      grad.addColorStop(0, "rgba(30,41,59,0.95)");
      grad.addColorStop(0.6, "rgba(15,23,42,0.98)");
      grad.addColorStop(1, "rgba(10,15,30,1)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Globe border
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(79,142,247,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const phi = (90 - lat) * (Math.PI / 180);
        const yr = cy + R * Math.cos(phi);
        const xr = R * Math.sin(phi);
        if (xr > 0) {
          ctx.beginPath();
          ctx.ellipse(cx, yr, xr, xr * 0.18, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(79,142,247,0.12)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Longitude lines
      for (let lng = 0; lng < 360; lng += 30) {
        const theta = (lng + rot) * (Math.PI / 180);
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 5) {
          const phi = (90 - lat) * (Math.PI / 180);
          const x = cx + R * Math.sin(phi) * Math.cos(theta);
          const y = cy + R * Math.cos(phi);
          const z = Math.sin(phi) * Math.sin(theta);
          if (lat === -90) ctx.moveTo(x, y);
          else if (z >= 0) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = "rgba(79,142,247,0.1)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Arc connections between nodes
      const frontNodes = NODES.map(n => ({ ...n, ...latLngToXY(n.lat, n.lng, R, cx, cy, rot) })).filter(n => n.z >= -0.1);
      const arcPairs = [[0,1],[1,2],[2,3],[3,9],[9,10],[10,7],[0,5],[5,4],[4,8],[6,11],[11,7],[13,9]];
      arcPairs.forEach(([ai, bi]) => {
        const a = frontNodes.find(n => n.label === NODES[ai]?.label);
        const b = frontNodes.find(n => n.label === NODES[bi]?.label);
        if (!a || !b) return;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - R * 0.15;
        const prog = (Math.sin(pulseRef.current * 0.7 + ai) + 1) / 2;
        const grad2 = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad2.addColorStop(0, "rgba(16,185,129,0)");
        grad2.addColorStop(0.5, "rgba(16,185,129,0.4)");
        grad2.addColorStop(1, "rgba(79,142,247,0)");
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.strokeStyle = grad2;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Moving dot on arc
        const t = prog;
        const dotX = (1-t)*(1-t)*a.x + 2*(1-t)*t*mx + t*t*b.x;
        const dotY = (1-t)*(1-t)*a.y + 2*(1-t)*t*my + t*t*b.y;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981";
        ctx.fill();
      });

      // Nodes
      frontNodes.forEach((node, i) => {
        const pulse = (Math.sin(pulseRef.current + i * 0.8) + 1) / 2;
        const c = i % 3 === 0 ? COLORS.orange : i % 3 === 1 ? COLORS.green : COLORS.blue;
        // Outer ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = c.replace(")", ",0.15)").replace("rgb", "rgba");
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.fill();
        // Glow
        const nodeGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 10);
        nodeGlow.addColorStop(0, c + "88");
        nodeGlow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = nodeGlow;
        ctx.fill();
      });

      // Highlight ring
      const ringPulse = (Math.sin(pulseRef.current * 0.5) + 1) / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 4 + ringPulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(249,115,22,${0.1 + ringPulse * 0.15})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      rotationRef.current += 0.15;
      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={520}
      className="w-full max-w-[520px] h-auto drop-shadow-2xl"
    />
  );
}