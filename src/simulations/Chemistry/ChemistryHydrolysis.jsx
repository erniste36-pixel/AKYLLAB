import { useRef, useEffect, useState } from 'react';
import { Droplets, Info } from 'lucide-react';

export default function ChemistryHydrolysis() {
  const canvasRef = useRef(null);
  const [saltType, setSaltType] = useState('weak-acid'); // weak-acid, weak-base, neutral
  const [concentration, setConcentration] = useState(50);
  const [stats, setStats] = useState({ pH: 7.0, hCount: 0, ohCount: 0 });

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // pH based on salt type
    const targetPH = saltType === 'weak-acid' ? 9.2 : saltType === 'weak-base' ? 4.8 : 7.0;

    // Particles: Na+, Cl-, H2O, H+, OH-, продукты гидролиза
    const molecules = [];
    for (let i = 0; i < concentration; i++) {
      molecules.push({
        x: 60 + Math.random() * (W - 120),
        y: 60 + Math.random() * (H - 120),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: i < concentration / 2 ? 'salt' : 'water',
        reacted: false,
        age: 0,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      time++;

      // Background gradient colored by pH
      const acidic = targetPH < 7;
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, acidic ? 'rgba(220,38,38,0.15)' : targetPH > 7 ? 'rgba(37,99,235,0.15)' : 'rgba(22,163,74,0.08)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      let hCount = 0, ohCount = 0;

      for (let i = 0; i < molecules.length; i++) {
        const p = molecules[i];
        p.x += p.vx; p.y += p.vy;
        p.age++;

        if (p.x < 20 || p.x > W - 20) p.vx *= -1;
        if (p.y < 20 || p.y > H - 20) p.vy *= -1;

        // Reaction: salt + water -> ions after collision
        if (!p.reacted && p.type === 'salt' && p.age > 60 && Math.random() < 0.002) {
          p.reacted = true;
          p.type = saltType === 'weak-acid' ? 'OH' : saltType === 'weak-base' ? 'H' : 'neutral-ion';
        }

        if (p.type === 'OH') ohCount++;
        if (p.type === 'H') hCount++;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.type === 'water' ? 4 : 7, 0, Math.PI * 2);
        const colors = {
          salt: '#f59e0b', water: 'rgba(56,189,248,0.5)',
          OH: '#3b82f6', H: '#ef4444', 'neutral-ion': '#10b981',
        };
        ctx.fillStyle = colors[p.type] || '#94a3b8';
        ctx.shadowBlur = p.reacted ? 8 : 0;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.type !== 'water') {
          ctx.fillStyle = '#fff';
          ctx.font = '9px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.type === 'salt' ? 'соль' : p.type === 'OH' ? 'OH⁻' : p.type === 'H' ? 'H⁺' : 'ion', p.x, p.y);
        }
      }

      if (time % 30 === 0) {
        setStats({ pH: targetPH.toFixed(1), hCount, ohCount });
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [saltType, concentration]);

  const phColor = stats.pH < 7 ? '#ef4444' : stats.pH > 7 ? '#3b82f6' : '#10b981';

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={480} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-700 p-3 rounded-lg backdrop-blur-sm">
          <div className="text-xs text-slate-400 mb-1">pH раствора</div>
          <div className="text-3xl font-mono font-bold" style={{ color: phColor }}>{stats.pH}</div>
          <div className="text-xs mt-1">OH⁻: {stats.ohCount} | H⁺: {stats.hCount}</div>
        </div>
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Droplets className="text-blue-400" /> Гидролиз солей
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Соль взаимодействует с водой, изменяя pH раствора. Соли сильных кислот/слабых оснований дают кислую среду и наоборот.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold text-amber-400">Тип соли:</div>
          {[
            { val: 'weak-acid', label: 'Соль слабой кислоты (Na₂CO₃)', sub: 'Щелочная среда, pH > 7' },
            { val: 'weak-base', label: 'Соль слабого основания (NH₄Cl)', sub: 'Кислая среда, pH < 7' },
            { val: 'neutral', label: 'Соль сильных (NaCl)', sub: 'Нейтральная, pH = 7' },
          ].map(opt => (
            <button key={opt.val} onClick={() => setSaltType(opt.val)}
              className={`text-left p-3 rounded-lg border text-sm transition-all ${saltType === opt.val ? 'border-amber-500 bg-amber-900/30' : 'border-slate-600 bg-slate-900/40 hover:border-slate-500'}`}>
              <div className="font-bold">{opt.label}</div>
              <div className="text-xs text-slate-400 mt-1">{opt.sub}</div>
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
          Концентрация соли: {concentration}
          <input type="range" min="20" max="120" step="10" value={concentration} onChange={e => setConcentration(Number(e.target.value))} className="accent-sky-500" />
        </label>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-blue-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-blue-400" />
          <div><strong>Ключевой момент:</strong> Полный гидролиз невозможен при нормальных условиях — молярная концентрация H₂O велика, равновесие смещено влево!</div>
        </div>
      </div>
    </div>
  );
}
