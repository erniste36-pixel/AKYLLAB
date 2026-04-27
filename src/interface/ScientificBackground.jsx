import { useEffect, useRef } from 'react';

export default function ScientificBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Read live theme colors from CSS variables
    const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#00ffb3';


    // ─── Particles (nodes in a neural/molecular network) ───
    const NODE_COUNT = 80;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.5 + Math.random() * 2.5,
      type: Math.random() < 0.3 ? 'nucleus' : 'electron', // nucleus = larger node
      phase: Math.random() * Math.PI * 2,
    }));

    // ─── Orbiting electrons around a few fixed nuclei ───
    const NUCLEI = Array.from({ length: 4 }, (_, i) => ({
      x: 0.15 * window.innerWidth + i * 0.25 * window.innerWidth,
      y: 0.25 * window.innerHeight + (i % 2) * 0.5 * window.innerHeight,
      orbitR: [40, 70, 100][Math.floor(Math.random() * 3)],
      electrons: Array.from({ length: 3 }, (__, j) => ({
        angle: (j / 3) * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.006,
        orbitR: 35 + j * 22,
        tilt: Math.random() * Math.PI,
      })),
    }));

    // ─── DNA strand helix ───
    const DNA_POINTS = 40;
    let dnaScroll = 0;

    // ─── Grid lines (spacetime metric) ───
    // Helper: convert any color keyword / hex to rgba
    const hexToRgba = (hex, alpha) => {
      try {
        const h = hex.trim().replace('#','');
        if (h.length === 6) {
          const r = parseInt(h.slice(0,2),16);
          const g = parseInt(h.slice(2,4),16);
          const b = parseInt(h.slice(4,6),16);
          return `rgba(${r},${g},${b},${alpha})`;
        }
      } catch(_) {}
      return `rgba(0,255,179,${alpha})`;
    };

    let time = 0;
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, W(), H());

      // Read theme colors live every frame
      const primary = getCSSVar('--neon-primary') || '#00ffb3';
      const secondary = getCSSVar('--neon-accent') || '#7c3aed';
      const bgColor = getCSSVar('--forge-bg') || '#07080d';

      time += 0.012;
      dnaScroll += 0.018;

      // Background fill using theme bg
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W(), H());

      // ════════════════════════════════════════
      // 1. WARPED GRID — themed color
      // ════════════════════════════════════════
      const gridStep = 55;
      const distortAmp = 8;
      for (let gx = 0; gx < W() + gridStep; gx += gridStep) {
        ctx.beginPath();
        for (let gy = 0; gy <= H(); gy += 8) {
          const distort = Math.sin((gx + gy) / 200 + time * 0.6) * distortAmp;
          if (gy === 0) ctx.moveTo(gx + distort, gy);
          else ctx.lineTo(gx + distort, gy);
        }
        ctx.strokeStyle = hexToRgba(primary, 0.05);
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
      for (let gy = 0; gy < H() + gridStep; gy += gridStep) {
        ctx.beginPath();
        for (let gx = 0; gx <= W(); gx += 8) {
          const distort = Math.sin((gx + gy) / 200 + time * 0.6) * distortAmp;
          if (gx === 0) ctx.moveTo(gx, gy + distort);
          else ctx.lineTo(gx, gy + distort);
        }
        ctx.strokeStyle = hexToRgba(primary, 0.04);
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // ════════════════════════════════════════
      // 2. NEURAL NETWORK CONNECTIONS — primary
      // ════════════════════════════════════════
      const MAX_DIST = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.22;
            const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i * 0.3 + j * 0.1);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = hexToRgba(primary, alpha * pulse);
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // ════════════════════════════════════════
      // 3. NODES — nucleus (primary) / electron (secondary)
      // ════════════════════════════════════════
      nodes.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.phase += 0.02;
        if (p.x < 0) p.x = W(); if (p.x > W()) p.x = 0;
        if (p.y < 0) p.y = H(); if (p.y > H()) p.y = 0;
        const glow = 0.4 + 0.4 * Math.sin(p.phase);
        if (p.type === 'nucleus') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          grad.addColorStop(0, hexToRgba(primary, glow * 0.9));
          grad.addColorStop(1, hexToRgba(primary, 0));
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${glow * 0.8})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = hexToRgba(secondary, 0.5 + glow * 0.4);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
      });

      // ════════════════════════════════════════
      // 4. ATOMIC ORBITALS — warm yellow (unchanged)
      // ════════════════════════════════════════
      NUCLEI.forEach(nucleus => {
        const nGradient = ctx.createRadialGradient(nucleus.x, nucleus.y, 0, nucleus.x, nucleus.y, 20);
        nGradient.addColorStop(0, 'rgba(255,200,100,0.55)');
        nGradient.addColorStop(0.5, 'rgba(255,120,50,0.12)');
        nGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = nGradient;
        ctx.beginPath(); ctx.arc(nucleus.x, nucleus.y, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,200,100,0.7)';
        ctx.beginPath(); ctx.arc(nucleus.x, nucleus.y, 4, 0, Math.PI * 2); ctx.fill();

        nucleus.electrons.forEach(el => {
          ctx.save(); ctx.translate(nucleus.x, nucleus.y); ctx.rotate(el.tilt);
          ctx.beginPath(); ctx.ellipse(0, 0, el.orbitR, el.orbitR * 0.45, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,200,100,0.07)'; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.restore();
          el.angle += el.speed;
          const ex = nucleus.x + Math.cos(el.angle) * el.orbitR;
          const ey = nucleus.y + Math.sin(el.angle) * el.orbitR * 0.45 * Math.cos(el.tilt);
          const eGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
          eGrad.addColorStop(0, hexToRgba(primary, 0.85));
          eGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = eGrad;
          ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = hexToRgba(primary, 0.9);
          ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
        });
      });

      // ════════════════════════════════════════
      // 5. DNA DOUBLE HELIX — primary / secondary
      // ════════════════════════════════════════
      const dnaX = W() - 120;
      const dnaSpan = Math.min(H() * 0.8, 500);
      const dnaTop = (H() - dnaSpan) / 2;
      for (let i = 0; i < DNA_POINTS; i++) {
        const t = (i / DNA_POINTS) * Math.PI * 5 + dnaScroll;
        const y = dnaTop + (i / DNA_POINTS) * dnaSpan;
        const amp = 45;
        const x1 = dnaX + Math.cos(t) * amp;
        const x2 = dnaX + Math.cos(t + Math.PI) * amp;
        if (i > 0) {
          const pt = ((i-1)/DNA_POINTS)*Math.PI*5 + dnaScroll;
          const py = dnaTop + ((i-1)/DNA_POINTS)*dnaSpan;
          ctx.beginPath(); ctx.moveTo(dnaX+Math.cos(pt)*amp,py); ctx.lineTo(x1,y);
          ctx.strokeStyle = hexToRgba(primary, 0.5); ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(dnaX+Math.cos(pt+Math.PI)*amp,py); ctx.lineTo(x2,y);
          ctx.strokeStyle = hexToRgba(secondary, 0.5); ctx.lineWidth = 1.5; ctx.stroke();
        }
        if (i % 3 === 0) {
          const rungAlpha = 0.15 + 0.2*((Math.cos(t)+1)/2);
          ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y);
          ctx.strokeStyle = `rgba(255,255,255,${rungAlpha})`; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = hexToRgba(primary, 0.7);
          ctx.beginPath(); ctx.arc(x1,y,2.5,0,Math.PI*2); ctx.fill();
          ctx.fillStyle = hexToRgba(secondary, 0.7);
          ctx.beginPath(); ctx.arc(x2,y,2.5,0,Math.PI*2); ctx.fill();
        }
      }

      // ════════════════════════════════════════
      // 6. EKG signal — primary theme
      // ════════════════════════════════════════
      const waveY = H() - 80;
      ctx.beginPath();
      for (let x = 0; x <= W(); x += 3) {
        const phase = (x / 80 - time * 2) % (Math.PI * 2);
        let y;
        if (phase > 0 && phase < 0.3) y = waveY - Math.sin(phase/0.3*Math.PI)*10;
        else if (phase >= 0.3 && phase < 0.5) y = waveY + 8;
        else if (phase >= 0.5 && phase < 0.65) y = waveY - 45;
        else if (phase >= 0.65 && phase < 0.8) y = waveY + 18;
        else if (phase >= 1.8 && phase < 2.6) y = waveY - Math.sin((phase-1.8)/0.8*Math.PI)*15;
        else y = waveY;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = hexToRgba(primary, 0.2);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ════════════════════════════════════════
      // 7. FLOATING FORMULA FRAGMENTS
      // ════════════════════════════════════════
      const formulas = ['E=mc²', 'ΔH<0', 'λ=h/p', 'pH=-log[H⁺]', 'F=ma', 'PV=nRT', '∇²ψ', 'e=2.718'];
      formulas.forEach((f, i) => {
        const fx = 0.08 * W() + ((i * 0.127 * W()) % (W() * 0.85));
        const fy = 0.1 * H() + Math.sin(time * 0.3 + i * 1.2) * 30 + i * 0.09 * H();
        const alpha = 0.05 + 0.04 * Math.sin(time * 0.5 + i);
        ctx.fillStyle = `rgba(0,255,179,${alpha})`;
        ctx.font = `${11 + i % 3 * 2}px JetBrains Mono, monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(f, fx % W(), fy % H());
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
