import { useRef, useEffect, useState } from 'react';
import { Zap, Info } from 'lucide-react';

// Chemistry: Sublimation - solid to gas without liquid phase
export default function ChemistrySublimation() {
  const canvasRef = useRef(null);
  const [temperature, setTemperature] = useState(20);
  const [pressure, setPressure] = useState(1); // atm

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Ice/dry ice lattice at bottom, gas molecules rising
    const solidY = H * 0.65;
    const sublimatingParticles = [];
    let sublimatedCount = 0;
    let time = 0;

    // Iodine sublimation point: ~114°C at 1atm. Dry ice (CO2): -78.5°C at 1atm
    // We display iodine: purple crystals → purple gas
    const sublimationTemp = 114 - (1 - pressure) * 50; // Lower pressure = lower sublimation point

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient based on temperature
      const heatRatio = Math.min(1, Math.max(0, (temperature - 10) / 120));
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, `rgba(${Math.floor(heatRatio * 80)}, 20, 60, 0.5)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
      time++;

      const isSublimating = temperature >= sublimationTemp;
      const sublimationRate = isSublimating ? (temperature - sublimationTemp) * 0.01 * (1 / pressure) : 0;

      // Draw solid crystals (lattice)
      const numCols = 18, numRows = 5;
      const cW = (W - 40) / numCols;
      const cH = (H - solidY - 20) / numRows;
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const cx2 = 20 + c * cW + cW / 2;
          const cy2 = solidY + r * cH + cH / 2;
          // Vibrate at high temperature
          const vib = isSublimating ? (Math.random() - 0.5) * heatRatio * 6 : 0;
          ctx.beginPath();
          ctx.rect(cx2 - 7 + vib, cy2 - 7, 14, 14);
          ctx.fillStyle = `rgba(139, 92, 246, ${0.8 - sublimatedCount / 200})`;
          ctx.fill();
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 1;
          ctx.stroke();
          // Lattice bonds
          if (c < numCols - 1) {
            ctx.beginPath(); ctx.moveTo(cx2 + 7, cy2); ctx.lineTo(cx2 + cW - 7, cy2);
            ctx.strokeStyle = 'rgba(109,40,217,0.4)'; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      ctx.fillStyle = '#a78bfa'; ctx.font = '13px Arial'; ctx.textAlign = 'center';
      ctx.fillText('Кристаллический иод (I₂)', W / 2, solidY - 10);

      // Spawn sublimating particles
      if (isSublimating && Math.random() < sublimationRate * 20) {
        const col = Math.floor(Math.random() * numCols);
        sublimatingParticles.push({
          x: 20 + col * cW + cW / 2,
          y: solidY - 10,
          vx: (Math.random() - 0.5) * 3,
          vy: -(1 + Math.random() * 3),
          life: 100 + Math.random() * 80,
          maxLife: 180,
        });
        sublimatedCount = Math.min(200, sublimatedCount + 0.3);
      }

      // Update gas particles
      for (let i = sublimatingParticles.length - 1; i >= 0; i--) {
        const p = sublimatingParticles[i];
        p.x += p.vx + Math.sin(time * 0.05 + i) * 0.3;
        p.y += p.vy;
        p.vy *= 0.99;
        p.life--;
        if (p.life <= 0 || p.y < -10) { sublimatingParticles.splice(i, 1); continue; }
        const alpha = (p.life / p.maxLife) * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${alpha})`;
        ctx.shadowBlur = 8; ctx.shadowColor = '#a78bfa';
        ctx.fill();
        ctx.shadowBlur = 0;
        if (p.y < solidY - 40) {
          ctx.fillStyle = `rgba(167,139,250,${alpha * 0.6})`;
          ctx.font = '8px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('I₂', p.x, p.y);
        }
      }

      // Phase diagram indicator
      const boxX = 10, boxY = 10;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(boxX, boxY, 200, 80);
      ctx.strokeStyle = isSublimating ? '#a78bfa' : '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, 200, 80);
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Courier'; ctx.textAlign = 'left';
      ctx.fillText(`T = ${temperature}°C`, boxX + 8, boxY + 20);
      ctx.fillText(`P = ${pressure.toFixed(1)} атм`, boxX + 8, boxY + 38);
      ctx.fillText(`T суб. = ${sublimationTemp.toFixed(0)}°C`, boxX + 8, boxY + 56);
      ctx.fillStyle = isSublimating ? '#a78bfa' : '#64748b';
      ctx.fillText(isSublimating ? '⬆ СУБЛИМАЦИЯ ИДЁТ' : 'Ниже точки сублимации', boxX + 8, boxY + 72);

      // Gas density label above solid
      if (sublimatingParticles.length > 5) {
        ctx.fillStyle = 'rgba(167,139,250,0.6)';
        ctx.font = '12px Arial'; ctx.textAlign = 'center';
        ctx.fillText(`Пар I₂ (${sublimatingParticles.length} молекул)`, W / 2, H * 0.2);
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [temperature, pressure]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={460} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Zap className="text-purple-400" /> Сублимация (I₂)
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Переход вещества из твёрдого состояния прямо в газообразное, минуя жидкую фазу. Пример: иод, сухой лёд, нафталин.
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-orange-400 text-sm">
          Температура нагрева: {temperature}°C
          <input type="range" min="0" max="200" step="5" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="accent-orange-500" />
          <span className="text-xs text-slate-400">Иод сублимирует при ~114°C (1 атм). Нагревай до порога!</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
          Давление: {pressure.toFixed(1)} атм
          <input type="range" min="0.1" max="2" step="0.1" value={pressure} onChange={e => setPressure(Number(e.target.value))} className="accent-sky-500" />
          <span className="text-xs text-slate-400">Снижение давления понижает точку сублимации (как на вершине Эвереста).</span>
        </label>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-purple-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-purple-400" />
          <div><strong>Фазовая диаграмма:</strong> Сублимация происходит ниже тройной точки. Для CO₂ тройная точка: -56.6°C / 5.1 атм — поэтому «сухой лёд» не тает, а испаряется!</div>
        </div>
      </div>
    </div>
  );
}
