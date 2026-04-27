import { useRef, useEffect, useState } from 'react';
import { Activity, Info } from 'lucide-react';

export default function PhysicsRadioactiveDecay() {
  const canvasRef = useRef(null);
  const [isotope, setIsotope] = useState('C14'); // C14, U235, Ra226
  const [running, setRunning] = useState(true);

  const isotopes = {
    C14: { halfLife: 300, color: '#10b981', decayType: 'β', name: 'Углерод-14', particles: 120 },
    Ra226: { halfLife: 150, color: '#f59e0b', decayType: 'α', name: 'Радий-226', particles: 80 },
    U235: { halfLife: 600, color: '#6366f1', decayType: 'α+β', name: 'Уран-235', particles: 60 },
  };

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const iso = isotopes[isotope];

    // Nuclei
    const nuclei = Array.from({ length: iso.particles }, (_, i) => ({
      x: 80 + Math.random() * (W - 160),
      y: 80 + Math.random() * (H - 220),
      decayed: false,
      decayTime: -1,
      particles: [],
    }));

    let time = 0;
    const geiger = []; // sound tick visual markers

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0f1e';
      ctx.fillRect(0, 0, W, H);
      time++;

      const decayChancePerFrame = Math.log(2) / iso.halfLife;
      let undecayed = 0;

      nuclei.forEach(n => {
        if (!n.decayed) {
          undecayed++;
          if (running && Math.random() < decayChancePerFrame) {
            n.decayed = true;
            n.decayTime = time;
            // Emit radiation particle
            const numPart = iso.decayType === 'α+β' ? 3 : 1;
            for (let p = 0; p < numPart; p++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 2 + Math.random() * 4;
              n.particles.push({
                x: n.x, y: n.y,
                vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                type: p === 0 && iso.decayType.includes('α') ? 'α' : 'β',
                life: 60,
              });
            }
            // Geiger counter pulse
            geiger.push({ x: 10 + Math.random() * (W - 20), time, life: 30 });
          }
        }

        // Draw nucleus
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.decayed ? 4 : 8, 0, Math.PI * 2);
        ctx.fillStyle = n.decayed ? '#334155' : iso.color;
        if (!n.decayed) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = iso.color;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw emitted particles
        for (let i = n.particles.length - 1; i >= 0; i--) {
          const p = n.particles[i];
          p.x += p.vx; p.y += p.vy;
          p.life--;
          if (p.life <= 0) { n.particles.splice(i, 1); continue; }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.type === 'α' ? 4 : 2, 0, Math.PI * 2);
          ctx.fillStyle = p.type === 'α' ? `rgba(239,68,68,${p.life / 60})` : `rgba(56,189,248,${p.life / 60})`;
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '7px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.type, p.x, p.y);
        }
      });

      // Geiger counter ticks
      for (let i = geiger.length - 1; i >= 0; i--) {
        const g = geiger[i];
        g.life--;
        if (g.life <= 0) { geiger.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(52,211,153,${g.life / 30})`;
        ctx.fillRect(g.x, H - 80, 2, -(g.life * 2));
      }

      // Bottom panel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, H - 110, W, 110);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, H - 110, W, 110);

      const pct = (undecayed / iso.particles) * 100;
      const elapsed = time / iso.halfLife;

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px Courier';
      ctx.textAlign = 'left';
      ctx.fillText(`☢ Счётчик Гейгера — ${iso.name} (${iso.decayType}-распад)`, 10, H - 90);
      ctx.fillStyle = iso.color;
      ctx.font = 'bold 22px Courier';
      ctx.fillText(`Осталось: ${undecayed} / ${iso.particles} ядер (${pct.toFixed(0)}%)`, 10, H - 65);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Courier';
      ctx.fillText(`Прошло периодов полураспада: ${elapsed.toFixed(1)} T½`, 10, H - 44);

      // Progress bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, H - 30, W - 20, 15);
      ctx.fillStyle = iso.color;
      ctx.fillRect(10, H - 30, (W - 20) * (pct / 100), 15);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [isotope, running]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={480} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Activity className="text-green-400" /> Радиоактивный распад
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Ядра нестабильных изотопов самопроизвольно распадаются, выбрасывая α- или β-частицы. Каждое ядро распадается случайно, но закон больших чисел дает точное время полураспада.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold text-emerald-400 mb-1">Выбор изотопа:</div>
          {Object.entries(isotopes).map(([key, val]) => (
            <button key={key} onClick={() => setIsotope(key)}
              className={`text-left p-3 rounded-lg border text-sm transition-all ${isotope === key ? 'border-emerald-500 bg-emerald-900/30' : 'border-slate-600 bg-slate-900/40 hover:border-slate-500'}`}>
              <div className="font-bold" style={{ color: val.color }}>{val.name}</div>
              <div className="text-xs text-slate-400 mt-1">T½ = {key === 'C14' ? '5730 лет' : key === 'Ra226' ? '1600 лет' : '703 млн лет'} · {val.decayType}-распад</div>
            </button>
          ))}
        </div>
        <button onClick={() => setRunning(!running)} className={`py-3 rounded-lg font-bold text-white transition-colors ${running ? 'bg-slate-600' : 'bg-green-600'}`}>
          {running ? 'Пауза' : 'Возобновить'}
        </button>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-green-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-green-400" />
          <div><strong>Радиоуглеродный анализ:</strong> Соотношение ¹⁴C/¹²C позволяет определить возраст органических образцов с точностью до 50 000 лет!</div>
        </div>
      </div>
    </div>
  );
}
