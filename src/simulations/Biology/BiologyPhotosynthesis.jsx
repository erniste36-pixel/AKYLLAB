import { useRef, useEffect, useState } from 'react';
import { Leaf, Info } from 'lucide-react';

export default function BiologyPhotosynthesis() {
  const canvasRef = useRef(null);
  const [lightIntensity, setLightIntensity] = useState(60);
  const [co2Level, setCo2Level] = useState(400);
  const [temperature, setTemperature] = useState(25);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Photons coming from top, CO2 from sides, O2 leaving up, glucose stored
    const photons = [];
    const co2Molecules = [];
    const o2Molecules = [];
    let glucoseStored = 0;
    let time = 0;

    // Rate of photosynthesis depends on all 3 limiting factors
    const getRate = () => {
      const li = lightIntensity / 100;
      const co2 = co2Level / 400;
      const temp = temperature < 10 ? 0.2 : temperature > 40 ? 0.3 : 1 - Math.abs(25 - temperature) / 30;
      return li * Math.min(1, co2) * Math.max(0, temp);
    };

    const leafTop = H * 0.35;
    const leafBottom = H * 0.72;
    const leafCX = W / 2;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      time++;

      const rate = getRate();

      // Sky gradient based on light intensity
      const skyGrad = ctx.createLinearGradient(0, 0, 0, leafTop);
      skyGrad.addColorStop(0, `rgba(251,191,36,${lightIntensity / 200})`);
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, leafTop);

      // Spawn photons
      if (time % Math.max(1, Math.floor(8 - rate * 6)) === 0) {
        photons.push({ x: 30 + Math.random() * (W - 60), y: 10, vy: 3 + Math.random() * 2, absorbed: false });
      }

      // Spawn CO2
      if (time % Math.max(2, Math.floor(15 - rate * 10)) === 0) {
        co2Molecules.push({
          x: Math.random() > 0.5 ? 10 : W - 10,
          y: leafTop + Math.random() * (leafBottom - leafTop),
          vx: Math.random() > 0.5 ? 2 : -2,
          vy: (Math.random() - 0.5) * 1,
          absorbed: false,
        });
      }

      // Draw leaf (ellipse + veins)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(leafCX, (leafTop + leafBottom) / 2, W * 0.38, (leafBottom - leafTop) / 2, 0, 0, Math.PI * 2);
      const leafGrad = ctx.createRadialGradient(leafCX, (leafTop + leafBottom) / 2, 20, leafCX, (leafTop + leafBottom) / 2, W * 0.38);
      const greenShade = Math.floor(100 + rate * 100);
      leafGrad.addColorStop(0, `rgb(0, ${greenShade + 50}, 40)`);
      leafGrad.addColorStop(1, `rgb(0, ${greenShade}, 20)`);
      ctx.fillStyle = leafGrad;
      ctx.fill();
      ctx.restore();

      // Leaf veins
      ctx.strokeStyle = `rgba(0, ${Math.floor(180 + rate * 50)}, 60, 0.4)`;
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(leafCX, (leafTop + leafBottom) / 2);
        ctx.lineTo(leafCX + i * 50, leafTop + 10);
        ctx.moveTo(leafCX, (leafTop + leafBottom) / 2);
        ctx.lineTo(leafCX + i * 50, leafBottom - 10);
        ctx.stroke();
      }

      // Chloroplasts (small green dots inside leaf)
      const numChloroplasts = Math.floor(rate * 30);
      ctx.fillStyle = 'rgba(0, 200, 80, 0.3)';
      for (let i = 0; i < numChloroplasts; i++) {
        const angle = (i / numChloroplasts) * Math.PI * 2 + time * 0.01;
        const r = 30 + i % 4 * 25;
        const cx2 = leafCX + Math.cos(angle) * r;
        const cy2 = (leafTop + leafBottom) / 2 + Math.sin(angle) * r * 0.5;
        ctx.beginPath();
        ctx.ellipse(cx2, cy2, 8, 5, angle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update photons
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        p.y += p.vy;
        const inLeaf = p.y > leafTop && p.y < leafBottom && Math.abs(p.x - leafCX) < W * 0.35;
        if (inLeaf && !p.absorbed && Math.random() < 0.1) {
          p.absorbed = true;
          glucoseStored += rate * 0.5;
        }
        if (p.y > H || (p.absorbed && time % 2 === 0)) { photons.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.absorbed ? 'rgba(0,255,100,0.6)' : 'rgba(251,191,36,0.8)';
        ctx.shadowBlur = 6; ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = '7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.absorbed ? '⚡' : 'γ', p.x, p.y);
      }

      // Update CO2
      for (let i = co2Molecules.length - 1; i >= 0; i--) {
        const m = co2Molecules[i];
        m.x += m.vx; m.y += m.vy;
        const inLeaf = m.y > leafTop && m.y < leafBottom && Math.abs(m.x - leafCX) < W * 0.35;
        if (inLeaf && !m.absorbed && Math.random() < rate * 0.05) {
          m.absorbed = true;
          // Emit O2
          o2Molecules.push({ x: m.x, y: m.y, vy: -(2 + Math.random() * 2), vx: (Math.random() - 0.5) * 2, life: 80 });
        }
        if (m.x < 0 || m.x > W || m.absorbed) { co2Molecules.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100,116,139,0.7)';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CO₂', m.x, m.y);
      }

      // Update O2
      for (let i = o2Molecules.length - 1; i >= 0; i--) {
        const m = o2Molecules[i];
        m.x += m.vx; m.y += m.vy;
        m.life--;
        if (m.life <= 0 || m.y < 0) { o2Molecules.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${m.life / 80})`;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('O₂', m.x, m.y);
      }

      // Glucose level bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(10, leafBottom + 15, W - 20, 20);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(10, leafBottom + 15, Math.min(W - 20, glucoseStored * 0.5), 20);
      ctx.fillStyle = '#fff';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Глюкоза (C₆H₁₂O₆): ${glucoseStored.toFixed(0)} у.е.`, W / 2, leafBottom + 29);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [lightIntensity, co2Level, temperature]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={480} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Leaf className="text-green-400" /> Фотосинтез
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Хлоропласты листа поглощают фотоны и CO₂, производя глюкозу и кислород: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Три лимитирующих фактора!
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-yellow-400 text-sm">
          Интенсивность света: {lightIntensity}%
          <input type="range" min="0" max="100" step="5" value={lightIntensity} onChange={e => setLightIntensity(Number(e.target.value))} className="accent-yellow-500" />
        </label>
        <label className="flex flex-col gap-2 font-bold text-slate-300 text-sm">
          Концентрация CO₂: {co2Level} ppm
          <input type="range" min="100" max="1000" step="50" value={co2Level} onChange={e => setCo2Level(Number(e.target.value))} className="accent-slate-400" />
          <span className="text-xs text-slate-400">Атмосферная норма ~400 ppm. Теплицы: 800–1000 ppm для роста.</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-orange-400 text-sm">
          Температура листа: {temperature}°C
          <input type="range" min="0" max="50" step="1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="accent-orange-500" />
          <span className="text-xs text-slate-400">Оптимум ~25°C. Выше 40° или ниже 10° — ферменты не работают!</span>
        </label>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-green-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-green-400" />
          <div><strong>Закон минимума Либиха:</strong> Скорость фотосинтеза ограничена самым слабым фактором. Добавь свет, если не хватает CO₂ — ничего не изменится!</div>
        </div>
      </div>
    </div>
  );
}
