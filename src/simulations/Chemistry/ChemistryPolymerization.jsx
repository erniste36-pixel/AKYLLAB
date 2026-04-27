import { useRef, useEffect, useState } from 'react';
import { Link2, Info } from 'lucide-react';

export default function ChemistryPolymerization() {
  const canvasRef = useRef(null);
  const [initiator, setInitiator] = useState(10);
  const [temperature, setTemperature] = useState(60);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Monomers: ethylene CH2=CH2 molecules floating
    const monomers = [];
    const chains = []; // Growing polymer chains

    for (let i = 0; i < 80; i++) {
      monomers.push({
        x: 30 + Math.random() * (W - 60),
        y: 30 + Math.random() * (H - 60),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        active: false, // becomes active (radical) when hit by initiator
      });
    }

    // Initiator radicals
    for (let i = 0; i < initiator; i++) {
      monomers.push({
        x: 30 + Math.random() * (W - 60),
        y: 30 + Math.random() * (H - 60),
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        active: true, type: 'initiator',
        chainId: i,
      });
      chains.push({ nodes: [], color: `hsl(${i * 37}, 70%, 60%)` });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      time++;

      const sp = (1 + temperature / 80);

      // Draw chains (polymer backbone)
      chains.forEach((chain, ci) => {
        if (chain.nodes.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(chain.nodes[0].x, chain.nodes[0].y);
        for (let k = 1; k < chain.nodes.length; k++) {
          ctx.lineTo(chain.nodes[k].x, chain.nodes[k].y);
        }
        ctx.strokeStyle = chain.color;
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.stroke();
      });

      // Update monomers
      for (let i = monomers.length - 1; i >= 0; i--) {
        const m = monomers[i];
        m.x += m.vx * sp;
        m.y += m.vy * sp;
        if (m.x < 10 || m.x > W - 10) m.vx *= -1;
        if (m.y < 10 || m.y > H - 10) m.vy *= -1;

        // Collision: active radical hits monomer -> monomer joins chain
        if (m.active && running) {
          for (let j = 0; j < monomers.length; j++) {
            if (i === j || monomers[j].active) continue;
            const dx = monomers[j].x - m.x;
            const dy = monomers[j].y - m.y;
            if (dx * dx + dy * dy < 400) {
              // Monomer attaches to chain
              monomers[j].active = true;
              monomers[j].chainId = m.chainId;
              monomers[j].type = 'monomer-in-chain';
              if (chains[m.chainId]) {
                chains[m.chainId].nodes.push({ x: monomers[j].x, y: monomers[j].y });
              }
              break;
            }
          }
        }

        // Draw monomer dot
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.active ? 7 : 5, 0, Math.PI * 2);
        if (m.type === 'initiator') {
          ctx.fillStyle = '#f43f5e';
          ctx.shadowBlur = 10; ctx.shadowColor = '#f43f5e';
        } else if (m.active) {
          const c = chains[m.chainId];
          ctx.fillStyle = c ? c.color : '#fff';
        } else {
          ctx.fillStyle = 'rgba(148,163,184,0.6)';
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!m.active) {
          ctx.fillStyle = '#fff';
          ctx.font = '8px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('CH₂', m.x, m.y);
        }
      }

      // Metrics
      const totalInChain = monomers.filter(m => m.active && m.type !== 'initiator').length;
      const avgChainLen = chains.length > 0 ? (chains.reduce((s, c) => s + c.nodes.length, 0) / chains.length).toFixed(0) : 0;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Courier';
      ctx.textAlign = 'left';
      ctx.fillText(`Полимеризовано: ${totalInChain}/${monomers.length - initiator}`, 10, 20);
      ctx.fillText(`Средняя длина цепи: ${avgChainLen} звеньев`, 10, 38);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [initiator, temperature, running]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={460} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Link2 className="text-emerald-400" /> Полимеризация
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Цепная реакция роста полимера (полиэтилена). Инициаторы создают свободные радикалы, которые захватывают мономеры CH₂=CH₂ и наращивают длинные цепочки.
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-rose-400 text-sm">
          Количество инициаторов: {initiator}
          <input type="range" min="1" max="20" step="1" value={initiator} onChange={e => setInitiator(Number(e.target.value))} className="accent-rose-500" />
          <span className="text-xs text-slate-400">Больше инициаторов → больше коротких цепей. Меньше → мало, но длинных!</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-orange-400 text-sm">
          Температура реактора: {temperature}°C
          <input type="range" min="20" max="200" step="10" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="accent-orange-500" />
        </label>
        <button onClick={() => setRunning(!running)} className={`py-3 rounded-lg font-bold text-white transition-colors ${running ? 'bg-slate-600' : 'bg-emerald-600'}`}>
          {running ? 'Пауза реакции' : 'Запустить полимеризацию'}
        </button>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-emerald-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-emerald-400" />
          <div><strong>Из этой реакции:</strong> Полиэтилен, полипропилен, полистирол — почти весь современный пластик! Молекулярная масса полимеров: от тысяч до миллионов а.е.м.</div>
        </div>
      </div>
    </div>
  );
}
