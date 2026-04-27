import { useRef, useEffect, useState } from 'react';
import { Wind, Info } from 'lucide-react';

export default function ChemistryDiffusion() {
  const canvasRef = useRef(null);
  const [temperature, setTemperature] = useState(20);
  const [molecularMass, setMolecularMass] = useState(2); // H2=2, O2=32, CO2=44
  const [barrier, setBarrier] = useState(true);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Maxwell-Boltzmann: v ~ sqrt(RT/M)
    const speedFactor = Math.sqrt((temperature + 273) / (molecularMass * 10));

    const particles = [];
    for (let i = 0; i < 120; i++) {
      const isLeft = i < 60;
      particles.push({
        x: isLeft ? 20 + Math.random() * (W / 2 - 40) : W / 2 + 20 + Math.random() * (W / 2 - 40),
        y: 20 + Math.random() * (H - 40),
        vx: (Math.random() - 0.5) * speedFactor * 4,
        vy: (Math.random() - 0.5) * speedFactor * 4,
        type: isLeft ? 'A' : 'B',
        r: 5,
      });
    }

    let barrierOpen = !barrier;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      time++;

      const sp = Math.sqrt((temperature + 273) / (molecularMass * 10));

      // Auto open barrier after 2s
      if (time > 120) barrierOpen = true;

      // Draw particles
      let leftA = 0, rightA = 0, leftB = 0, rightB = 0;
      particles.forEach(p => {
        // normalize speed
        const curSpeed = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        const targetSpeed = sp * 4;
        if (curSpeed > 0) {
          p.vx = (p.vx / curSpeed) * targetSpeed;
          p.vy = (p.vy / curSpeed) * targetSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wall bounces
        if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx); }
        if (p.x > W - p.r) { p.x = W - p.r; p.vx = -Math.abs(p.vx); }
        if (p.y < p.r) { p.y = p.r; p.vy = Math.abs(p.vy); }
        if (p.y > H - p.r) { p.y = H - p.r; p.vy = -Math.abs(p.vy); }

        // Barrier in center
        if (!barrierOpen) {
          if (p.vx > 0 && p.x > W / 2 - 5 && p.x < W / 2 + 5) p.vx *= -1;
          if (p.vx < 0 && p.x < W / 2 + 5 && p.x > W / 2 - 5) p.vx *= -1;
        }

        if (p.x < W / 2) {
          if (p.type === 'A') leftA++; else leftB++;
        } else {
          if (p.type === 'A') rightA++; else rightB++;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'A' ? 'rgba(59,130,246,0.85)' : 'rgba(239,68,68,0.85)';
        ctx.shadowBlur = 4; ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Barrier
      if (!barrierOpen) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 6;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Перегородка', W / 2, H / 2 - 10);
        ctx.fillText('(снимается через 2с)', W / 2, H / 2 + 8);
      }

      // Labels
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`Вещество A: ${leftA + rightA}`, W * 0.25, 20);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`Вещество B: ${leftB + rightB}`, W * 0.75, 20);

      // Концентрация gradient bars
      const mixLevel = Math.min(rightA, leftB) / 60;
      ctx.fillStyle = `rgba(59,130,246,${mixLevel * 0.3})`;
      ctx.fillRect(W / 2, 0, W / 2, H);
      ctx.fillStyle = `rgba(239,68,68,${mixLevel * 0.3})`;
      ctx.fillRect(0, 0, W / 2, H);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [temperature, molecularMass, barrier]);

  const molecules = [
    { val: 2, name: 'H₂ (водород)' },
    { val: 32, name: 'O₂ (кислород)' },
    { val: 44, name: 'CO₂ (углекислый газ)' },
    { val: 128, name: 'HI (иодоводород)' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={440} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Wind className="text-sky-400" /> Диффузия газов
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Молекулы разных веществ самопроизвольно перемешиваются (закон Фика). Скорость зависит от температуры и молярной массы газа (закон Грэма).
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-orange-400 text-sm">
          Температура: {temperature}°C
          <input type="range" min="-50" max="300" step="10" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="accent-orange-500" />
          <span className="text-xs text-slate-400">Скорость диффузии ∝ √T</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
          Молярная масса газа A:
          <select value={molecularMass} onChange={e => setMolecularMass(Number(e.target.value))} className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm">
            {molecules.map(m => <option key={m.val} value={m.val}>{m.name} (M={m.val})</option>)}
          </select>
          <span className="text-xs text-slate-400">Тяжелый газ диффундирует медленнее (закон Грэма: v ∝ 1/√M)</span>
        </label>
        <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-600">
          <input type="checkbox" id="barrier" checked={barrier} onChange={e => setBarrier(e.target.checked)} className="w-5 h-5 accent-sky-500" />
          <label htmlFor="barrier" className="text-sky-400 font-bold cursor-pointer text-sm">Начать с перегородкой</label>
        </div>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-sky-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-sky-400" />
          <div><strong>Закон Грэма:</strong> Скорость диффузии H₂ в 4 раза больше, чем O₂, так как он легче в 16 раз, а √16 = 4.</div>
        </div>
      </div>
    </div>
  );
}
