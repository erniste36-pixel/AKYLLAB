import { useRef, useEffect, useState } from 'react';
import { Globe, Info } from 'lucide-react';

export default function GeologyErosion() {
  const canvasRef = useRef(null);
  const [waterFlow, setWaterFlow] = useState(30);
  const [windStrength, setWindStrength] = useState(20);
  const [rockHardness, setRockHardness] = useState(60);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const terrain = Array.from({ length: W }, (_, x) => {
      return H * 0.4 - Math.sin(x / 60) * 80 - Math.sin(x / 25) * 30 - Math.random() * 20;
    });

    const waterParticles = [];
    const windParticles = [];
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(0, 0, W, H);
      time++;

      const erosionRate = 0.001 * (waterFlow / 100) * (100 / Math.max(10, rockHardness));
      const windErosion = 0.0003 * (windStrength / 100) * (100 / Math.max(10, rockHardness));

      for (let x = 1; x < W - 1; x++) {
        if (Math.random() < waterFlow / 2000) {
          const slope = terrain[x - 1] - terrain[x];
          terrain[x] += erosionRate * (slope > 0 ? slope * 0.5 : 0);
          terrain[x] = Math.min(terrain[x], H * 0.8);
        }
        if (Math.random() < windStrength / 5000 && x < W - 10) {
          const carry = windErosion * 20;
          terrain[x] += carry * 0.5;
          terrain[x + 5] -= carry * 0.3;
          terrain[x + 10] -= carry * 0.2;
        }
      }

      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x < W; x++) ctx.lineTo(x, terrain[x]);
      ctx.lineTo(W, H);
      ctx.closePath();
      const rockGrad = ctx.createLinearGradient(0, 0, 0, H);
      rockGrad.addColorStop(0, rockHardness > 70 ? '#78716c' : rockHardness > 40 ? '#92400e' : '#ca8a04');
      rockGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = rockGrad;
      ctx.fill();
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (Math.random() < waterFlow / 200) waterParticles.push({ x: Math.random() * W, y: 0, vy: 3, vx: (Math.random() - 0.5), life: 80 });
      if (Math.random() < windStrength / 300) windParticles.push({ x: 0, y: terrain[0] - Math.random() * 60, vx: 3 + windStrength / 20, vy: (Math.random() - 0.5) * 2, life: 120 });

      for (let i = waterParticles.length - 1; i >= 0; i--) {
        const p = waterParticles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        const tx = Math.min(W - 1, Math.max(0, Math.floor(p.x)));
        if (p.y >= terrain[tx] || p.life <= 0 || p.x < 0 || p.x > W) { waterParticles.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.life / 80 * 0.7})`; ctx.fill();
      }

      for (let i = windParticles.length - 1; i >= 0; i--) {
        const p = windParticles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.x > W || p.life <= 0) { windParticles.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(202,138,4,${p.life / 120 * 0.6})`; ctx.fill();
      }

      ctx.fillStyle = '#94a3b8'; ctx.font = '12px Courier'; ctx.textAlign = 'left';
      ctx.fillText(`Вода: ${waterParticles.length} | Ветер: ${windParticles.length}`, 10, 20);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [waterFlow, windStrength, rockHardness]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={460} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Globe className="text-amber-600" /> Эрозия горных пород
          </h2>
          <p className="text-sm text-slate-400 mt-2">Вода и ветер постепенно разрушают породы. За миллионы лет образуются каньоны, долины и дюны.</p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
          Сила водного потока: {waterFlow}%
          <input type="range" min="0" max="100" step="5" value={waterFlow} onChange={e => setWaterFlow(Number(e.target.value))} className="accent-sky-500" />
        </label>
        <label className="flex flex-col gap-2 font-bold text-yellow-400 text-sm">
          Сила ветра: {windStrength}%
          <input type="range" min="0" max="100" step="5" value={windStrength} onChange={e => setWindStrength(Number(e.target.value))} className="accent-yellow-500" />
        </label>
        <label className="flex flex-col gap-2 font-bold text-stone-400 text-sm">
          Твёрдость породы: {rockHardness}
          <input type="range" min="10" max="100" step="5" value={rockHardness} onChange={e => setRockHardness(Number(e.target.value))} className="accent-stone-400" />
          <span className="text-xs text-slate-400">Гранит (100) почти нетронут. Известняк (20) быстро разрушается.</span>
        </label>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-amber-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <div><strong>Большой каньон:</strong> Река Колорадо за 5–6 млн лет прорезала слои известняка глубиной 1.6 км!</div>
        </div>
      </div>
    </div>
  );
}
