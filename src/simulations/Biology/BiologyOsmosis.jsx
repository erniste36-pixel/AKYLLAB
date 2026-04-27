import { useRef, useEffect, useState } from 'react';
import { Droplets, Info } from 'lucide-react';

export default function BiologyOsmosis() {
  const canvasRef = useRef(null);
  const [saltConcentration, setSaltConcentration] = useState(50); // salt on right side
  const [membraneType, setMembraneType] = useState('semi'); // semi, full

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Water (small blue), Salt (large orange) molecules
    const left = [], right = [];
    let waterLevel = 0; // positive = right side higher

    for (let i = 0; i < 80; i++) {
      left.push({ x: 20 + Math.random() * (W / 2 - 40), y: 30 + Math.random() * (H - 100), vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, type: 'water' });
    }
    for (let i = 0; i < 80; i++) {
      right.push({ x: W / 2 + 20 + Math.random() * (W / 2 - 40), y: 30 + Math.random() * (H - 100), vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, type: 'water' });
    }
    // Salt on right
    for (let i = 0; i < saltConcentration / 5; i++) {
      right.push({ x: W / 2 + 20 + Math.random() * (W / 2 - 40), y: 30 + Math.random() * (H - 100), vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1, type: 'salt' });
    }

    let time = 0;
    const membraneX = W / 2;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      time++;

      // Osmotic pressure gradient → net water flow from left (pure) to right (salty)
      const osmoticRate = (saltConcentration / 100) * 0.015;
      if (membraneType === 'semi' && time % 3 === 0) {
        waterLevel += osmoticRate;
      }
      waterLevel = Math.min(H * 0.3, waterLevel);

      // Draw solution containers
      const leftWaterH = H * 0.6 - waterLevel * 0.5;
      const rightWaterH = H * 0.6 + waterLevel * 0.5;

      // Left side (pure water, slightly lower if osmosis active)
      ctx.fillStyle = `rgba(56,189,248,0.15)`;
      ctx.fillRect(0, H - leftWaterH, W / 2, leftWaterH);
      // Right side (saline, rises)
      ctx.fillStyle = `rgba(251,146,60,0.12)`;
      ctx.fillRect(W / 2, H - rightWaterH, W / 2, rightWaterH);

      // Water surface lines
      ctx.strokeStyle = 'rgba(56,189,248,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H - leftWaterH);
      ctx.lineTo(W / 2, H - leftWaterH);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(251,146,60,0.5)';
      ctx.beginPath();
      ctx.moveTo(W / 2, H - rightWaterH);
      ctx.lineTo(W, H - rightWaterH);
      ctx.stroke();

      // Water level difference label
      if (waterLevel > 5) {
        const diffPx = (rightWaterH - leftWaterH);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(W / 2 + 10, H - leftWaterH);
        ctx.lineTo(W / 2 + 10, H - rightWaterH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Δh = ${Math.round(diffPx)}px`, W / 2 + 14, H - (leftWaterH + rightWaterH) / 2);
        ctx.font = '10px Arial';
        ctx.fillText('(осмотическое', W / 2 + 14, H - (leftWaterH + rightWaterH) / 2 + 14);
        ctx.fillText('давление)', W / 2 + 14, H - (leftWaterH + rightWaterH) / 2 + 27);
      }

      // Draw membrane
      const poreSize = membraneType === 'semi' ? 6 : 14;
      ctx.fillStyle = '#334155';
      ctx.fillRect(membraneX - 4, 20, 8, H - 40);
      // Pores
      for (let y = 40; y < H - 40; y += 20) {
        ctx.clearRect(membraneX - 4, y, 8, poreSize);
        ctx.beginPath();
        ctx.rect(membraneX - 4, y, 8, poreSize);
        ctx.fillStyle = 'rgba(56,189,248,0.2)';
        ctx.fill();
      }
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(membraneType === 'semi' ? 'Полупрониц.' : 'Проницаемая', membraneX, 16);
      ctx.fillText('мембрана', membraneX, 28);

      // Move molecules
      const allMols = [...left, ...right];
      allMols.forEach(m => {
        m.x += m.vx; m.y += m.vy;

        // Bounce off walls
        if (m.x < 8) { m.x = 8; m.vx = Math.abs(m.vx); }
        if (m.x > W - 8) { m.x = W - 8; m.vx = -Math.abs(m.vx); }
        if (m.y < 8) { m.y = 8; m.vy = Math.abs(m.vy); }
        if (m.y > H - 8) { m.y = H - 8; m.vy = -Math.abs(m.vy); }

        // Membrane logic
        if (m.type === 'water') {
          // Water can pass through semi-permeable membrane
          if (Math.abs(m.x - membraneX) < 5) {
            if (membraneType === 'full') {
              m.vx *= -1;
            } else {
              // Net flow right (probabilistic)
              const isLeft = m.x < membraneX;
              const crossChance = isLeft ? osmoticRate * 0.8 : osmoticRate * 0.2;
              if (Math.random() < crossChance) {
                m.vx = isLeft ? Math.abs(m.vx) : -Math.abs(m.vx);
              } else {
                m.vx *= -1;
              }
            }
          }
        } else {
          // Salt cannot cross semi-permeable membrane
          if (Math.abs(m.x - membraneX) < 5) m.vx *= -1;
        }

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.type === 'salt' ? 7 : 4, 0, Math.PI * 2);
        ctx.fillStyle = m.type === 'water' ? 'rgba(56,189,248,0.7)' : 'rgba(251,146,60,0.8)';
        ctx.fill();
        if (m.type === 'salt') {
          ctx.fillStyle = '#fff';
          ctx.font = '7px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('NaCl', m.x, m.y);
        }
      });

      // Labels
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Чистая вода', W / 4, 45);
      ctx.fillStyle = '#fb923c';
      ctx.fillText(`Солевой раствор (${saltConcentration}%)`, 3 * W / 4, 45);

      // Arrows showing water flow direction
      if (waterLevel > 2 && membraneType === 'semi') {
        ctx.fillStyle = 'rgba(56,189,248,0.6)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('→', membraneX - 30, H / 2);
        ctx.fillText('→', membraneX + 10, H / 2 + 15);
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [saltConcentration, membraneType]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={460} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Droplets className="text-blue-400" /> Осмос
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Вода самопроизвольно перетекает через полупроницаемую мембрану из зоны низкой концентрации в зону высокой, пока давление не уравновесит поток.
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-orange-400 text-sm">
          Концентрация соли (правая сторона): {saltConcentration}%
          <input type="range" min="0" max="100" step="5" value={saltConcentration} onChange={e => setSaltConcentration(Number(e.target.value))} className="accent-orange-500" />
          <span className="text-xs text-slate-400">Чем выше концентрация, тем сильнее осмотическое давление и быстрее перетекает вода.</span>
        </label>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold text-slate-300">Тип мембраны:</div>
          <button onClick={() => setMembraneType('semi')} className={`p-3 rounded-lg border text-sm text-left ${membraneType === 'semi' ? 'border-blue-500 bg-blue-900/30' : 'border-slate-600'}`}>
            <div className="font-bold">Полупроницаемая</div>
            <div className="text-xs text-slate-400 mt-1">Пропускает воду, задерживает соль (как клеточная мембрана)</div>
          </button>
          <button onClick={() => setMembraneType('full')} className={`p-3 rounded-lg border text-sm text-left ${membraneType === 'full' ? 'border-slate-400 bg-slate-700/50' : 'border-slate-600'}`}>
            <div className="font-bold">Непроницаемая</div>
            <div className="text-xs text-slate-400 mt-1">Нет диффузии — осмос остановлен</div>
          </button>
        </div>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-blue-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-blue-400" />
          <div><strong>В биологии:</strong> Тургорное давление клеток, работа почек, засолка огурцов — всё это осмос. Клетка в гипертоническом растворе теряет воду и сморщивается (плазмолиз)!</div>
        </div>
      </div>
    </div>
  );
}
