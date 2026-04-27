import { useRef, useEffect, useState } from 'react';
import { Zap, Info } from 'lucide-react';

// Double slit interference (Young's experiment)
export default function PhysicsInterference() {
  const canvasRef = useRef(null);
  const [wavelength, setWavelength] = useState(550); // nm, 400-700
  const [slitSeparation, setSlitSeparation] = useState(4); // in px units
  const [slitWidth, setSlitWidth] = useState(2);
  const [showIntensity, setShowIntensity] = useState(true);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Wavelength to visible color
    const wlToColor = (wl) => {
      let r, g, b;
      if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; g = 0; b = 1; }
      else if (wl < 490) { r = 0; g = (wl - 440) / 50; b = 1; }
      else if (wl < 510) { r = 0; g = 1; b = -(wl - 510) / 20; }
      else if (wl < 580) { r = (wl - 510) / 70; g = 1; b = 0; }
      else if (wl < 645) { r = 1; g = -(wl - 645) / 65; b = 0; }
      else { r = 1; g = 0; b = 0; }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);
      time += 0.05;

      const [wr, wg, wb] = wlToColor(wavelength);

      // Slit positions
      const slitX = W * 0.25;
      const slit1Y = H / 2 - slitSeparation * 15;
      const slit2Y = H / 2 + slitSeparation * 15;

      // INCIDENT WAVE (left side)
      for (let y = 0; y < H; y++) {
        const waveFront = 1 + 0.5 * Math.sin(2 * Math.PI * (y / 80 - time));
        ctx.fillStyle = `rgba(${wr},${wg},${wb},${waveFront * 0.15})`;
        ctx.fillRect(0, y, slitX, 1);
      }

      // Draw barrier
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(slitX - 5, 0, 10, slit1Y - slitWidth * 8);
      ctx.fillRect(slitX - 5, slit1Y + slitWidth * 8, 10, slit2Y - slit1Y - slitWidth * 16);
      ctx.fillRect(slitX - 5, slit2Y + slitWidth * 8, 10, H - slit2Y - slitWidth * 8);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(slitX - 5, 0, 10, H);

      // Slit labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('S₁', slitX, slit1Y);
      ctx.fillText('S₂', slitX, slit2Y);

      // INTERFERENCE PATTERN on right side - pixel by pixel
      const screenX = W * 0.7;
      const imgData = ctx.createImageData(W - screenX, H);

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W - screenX; x++) {
          const px = screenX + x;
          const py = y;

          // Distance from each slit
          const r1 = Math.sqrt((px - slitX) ** 2 + (py - slit1Y) ** 2);
          const r2 = Math.sqrt((px - slitX) ** 2 + (py - slit2Y) ** 2);

          const k = (2 * Math.PI) / (wavelength / 80); // scale
          const phase1 = k * r1 - time * 5;
          const phase2 = k * r2 - time * 5;

          const amp = Math.sin(phase1) + Math.sin(phase2);
          const intensity = Math.max(0, (amp + 2) / 4); // 0 to 1

          const idx = (y * (W - screenX) + x) * 4;
          imgData.data[idx] = wr * intensity;
          imgData.data[idx + 1] = wg * intensity;
          imgData.data[idx + 2] = wb * intensity;
          imgData.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, screenX, 0);

      // Screen line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W * 0.95, 0);
      ctx.lineTo(W * 0.95, H);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Экран', W * 0.95, 20);

      // Intensity profile on screen (right edge)
      if (showIntensity) {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let y = 0; y < H; y++) {
          const r1 = Math.sqrt((W * 0.95 - slitX) ** 2 + (y - slit1Y) ** 2);
          const r2 = Math.sqrt((W * 0.95 - slitX) ** 2 + (y - slit2Y) ** 2);
          const k = (2 * Math.PI) / (wavelength / 80);
          const dPhase = k * (r1 - r2);
          const intensity = Math.cos(dPhase / 2) ** 2;
          const barLen = intensity * 30;
          if (y === 0) ctx.moveTo(W * 0.95, y);
          else ctx.lineTo(W * 0.95 - barLen, y);
        }
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`λ = ${wavelength} нм`, 10, 20);
      ctx.fillText(`d = ${slitSeparation} мкм`, 10, 38);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [wavelength, slitSeparation, slitWidth, showIntensity]);

  const wlColor = wavelength < 450 ? '#8b5cf6' : wavelength < 510 ? '#3b82f6' : wavelength < 570 ? '#22c55e' : wavelength < 630 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Zap className="text-purple-400" /> Интерференция (Опыт Юнга)
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Свет из двух щелей S₁ и S₂ накладывается. Где гребни волн совпадают — яркая полоса (конструктивная). Где гребень + впадина — темная (деструктивная).
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-sm" style={{ color: wlColor }}>
          Длина волны: {wavelength} нм
          <input type="range" min="380" max="700" step="5" value={wavelength} onChange={e => setWavelength(Number(e.target.value))} className="accent-purple-500" />
          <span className="text-xs text-slate-400">380нм = фиолетовый ↔ 700нм = красный</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
          Расстояние между щелями (d): {slitSeparation} мкм
          <input type="range" min="1" max="12" step="1" value={slitSeparation} onChange={e => setSlitSeparation(Number(e.target.value))} className="accent-sky-500" />
          <span className="text-xs text-slate-400">Ширина полос: Δy = λL/d. Уменьши d → полосы шире.</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-slate-300 text-sm">
          Ширина щели: {slitWidth} у.е.
          <input type="range" min="1" max="6" step="1" value={slitWidth} onChange={e => setSlitWidth(Number(e.target.value))} className="accent-slate-400" />
        </label>
        <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-600">
          <input type="checkbox" id="intensity" checked={showIntensity} onChange={e => setShowIntensity(e.target.checked)} className="w-5 h-5 accent-white" />
          <label htmlFor="intensity" className="font-bold cursor-pointer text-sm">Показать профиль интенсивности</label>
        </div>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-purple-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-purple-400" />
          <div><strong>Открытие Юнга (1801):</strong> Этот опыт доказал волновую природу света и решил спор между Ньютоном (частицы) и Гюйгенсом (волны)!</div>
        </div>
      </div>
    </div>
  );
}
