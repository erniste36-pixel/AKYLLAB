import { useRef, useEffect, useState } from 'react';
import { Zap, Info } from 'lucide-react';

export default function ChemistryRedox() {
  const canvasRef = useRef(null);
  const [externalVoltage, setExternalVoltage] = useState(0);
  const [cathodeActive, setCathodeActive]= useState(true);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Electrons flowing in circuit, ions in solution
    const electrons = [];
    const ions = [];

    for (let i = 0; i < 20; i++) {
      electrons.push({ x: W * 0.2, y: 30 + i * 5, progress: Math.random(), speed: 0.005 + Math.random() * 0.005 });
    }
    for (let i = 0; i < 30; i++) {
      ions.push({
        x: W * 0.2 + Math.random() * W * 0.6,
        y: H * 0.35 + Math.random() * H * 0.45,
        type: Math.random() > 0.5 ? 'Cu2+' : 'SO4',
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        age: 0,
      });
    }

    let time = 0;
    let deposited = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      time++;

      const totalV = 1.1 + externalVoltage;
      const flowSpeed = totalV * 0.003;

      // --- SOLUTION (CuSO4) ---
      const solGrad = ctx.createLinearGradient(0, H * 0.3, 0, H);
      solGrad.addColorStop(0, 'rgba(6,182,212,0.3)');
      solGrad.addColorStop(1, 'rgba(6,182,212,0.05)');
      ctx.fillStyle = solGrad;
      ctx.fillRect(W * 0.12, H * 0.3, W * 0.76, H * 0.6);
      ctx.strokeStyle = 'rgba(6,182,212,0.4)';
      ctx.strokeRect(W * 0.12, H * 0.3, W * 0.76, H * 0.6);

      // --- ELECTRODES ---
      // Anod (Zn, left) – ОКИСЛЕНИЕ: Zn -> Zn2+ + 2e-
      ctx.fillStyle = '#64748b';
      ctx.fillRect(W * 0.18, H * 0.3, 18, H * 0.55);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Zn', W * 0.18 + 9, H * 0.28);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px Arial';
      ctx.fillText('Анод (+)', W * 0.18 + 9, H * 0.25);
      ctx.fillText('Окисление', W * 0.22, H * 0.96);

      // Cathode (Cu, right) – ВОССТАНОВЛЕНИЕ: Cu2+ + 2e- -> Cu
      const cathodeWidth = 18 + deposited * 0.1;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(W * 0.82 - cathodeWidth / 2, H * 0.3, cathodeWidth, H * 0.55);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Cu', W * 0.82, H * 0.28);
      ctx.fillText('Катод (−)', W * 0.82, H * 0.25);
      ctx.fillText('Восстановление', W * 0.78, H * 0.96);

      // --- EXTERNAL CIRCUIT wire ---
      ctx.beginPath();
      ctx.moveTo(W * 0.18 + 9, H * 0.3);
      ctx.lineTo(W * 0.18 + 9, 40);
      ctx.lineTo(W * 0.82, 40);
      ctx.lineTo(W * 0.82, H * 0.3);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Voltmeter box
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(W / 2 - 35, 15, 70, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(W / 2 - 35, 15, 70, 30);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Courier';
      ctx.textAlign = 'center';
      ctx.fillText(`${totalV.toFixed(1)} V`, W / 2, 35);

      // --- ELECTRONS flowing in wire ---
      electrons.forEach(e => {
        e.progress += flowSpeed;
        if (e.progress > 1) { e.progress = 0; deposited = Math.min(50, deposited + 0.5); }

        // Path: anode top -> left -> right -> cathode top
        const t = e.progress;
        let px, py;
        if (t < 0.33) { px = W * 0.18 + 9; py = H * 0.3 - (H * 0.3 - 40) * (t / 0.33); }
        else if (t < 0.66) { px = W * 0.18 + 9 + (W * 0.82 - W * 0.18 - 9) * ((t - 0.33) / 0.33); py = 40; }
        else { px = W * 0.82; py = 40 + (H * 0.3 - 40) * ((t - 0.66) / 0.34); }

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fde047';
        ctx.shadowBlur = 8; ctx.shadowColor = '#fde047';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('e⁻', px, py);
      });

      // --- IONS in solution ---
      ions.forEach(ion => {
        ion.x += ion.vx + (ion.type === 'Cu2+' ? flowSpeed * 30 : -flowSpeed * 30);
        ion.y += ion.vy;
        ion.age++;
        if (ion.x < W * 0.14) { ion.x = W * 0.14; ion.vx *= -1; }
        if (ion.x > W * 0.88) { ion.x = W * 0.88; ion.vx *= -1; }
        if (ion.y < H * 0.32) { ion.y = H * 0.32; ion.vy *= -1; }
        if (ion.y > H * 0.88) { ion.y = H * 0.88; ion.vy *= -1; }

        ctx.beginPath();
        ctx.arc(ion.x, ion.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = ion.type === 'Cu2+' ? 'rgba(217,119,6,0.8)' : 'rgba(99,102,241,0.6)';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ion.type, ion.x, ion.y);
      });

      // Label deposit
      if (deposited > 5) {
        ctx.fillStyle = '#fcd34d';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Осаждено Cu: ${deposited.toFixed(0)} у.е.`, W * 0.82, H * 0.28 + 15);
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [externalVoltage, cathodeActive]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={480} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Zap className="text-yellow-400" /> ОВР — Гальванический элемент
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Цинковый анод окисляется (теряет электроны), медный катод восстанавливается (принимает Cu²⁺ из раствора). Электроны текут по внешней цепи — это и есть электрический ток!
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-yellow-400 text-sm">
          Внешнее напряжение: +{externalVoltage.toFixed(1)} В
          <input type="range" min="0" max="3" step="0.1" value={externalVoltage} onChange={e => setExternalVoltage(Number(e.target.value))} className="accent-yellow-500" />
          <span className="text-xs text-slate-400 font-normal">Увеличение напряжения ускоряет осаждение меди на катоде (закон Фарадея для электролиза).</span>
        </label>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-sm space-y-1">
          <div className="text-amber-400 font-bold">Полуреакции:</div>
          <div>Анод: Zn → Zn²⁺ + <span className="text-yellow-300">2e⁻</span></div>
          <div>Катод: Cu²⁺ + <span className="text-yellow-300">2e⁻</span> → Cu</div>
        </div>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-yellow-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-yellow-400" />
          <div><strong>ЭДС гальванического элемента Zn/Cu</strong> в стандарте = 1.10 В. Это разница потенциалов двух электродов!</div>
        </div>
      </div>
    </div>
  );
}
