import { useRef, useEffect, useState } from 'react';
import { Cpu, Info } from 'lucide-react';

export default function BiologyTranscription() {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(2);
  const [phase, setPhase] = useState('transcription'); // transcription or translation

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const codons = ['AUG', 'GCU', 'CGG', 'UAC', 'GAA', 'UGG', 'AAA', 'CCC', 'UAA'];
    const aminoAcids = ['Мет', 'Ала', 'Арг', 'Тир', 'Глу', 'Трп', 'Лиз', 'Про', 'STOP'];
    const codonColors = ['#f43f5e','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16','#ef4444'];

    let polymeraseX = -60;
    let ribosomeX = -80;
    let mrnaProgress = 0;
    let peptideChain = [];
    let time = 0;

    const dnaY = H * 0.3;
    const mrnaY = H * 0.5;
    const ribosomeY = H * 0.68;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);
      time++;

      if (phase === 'transcription') {
        polymeraseX += speed * 0.5;
        if (polymeraseX > W + 60) polymeraseX = -60;
        mrnaProgress = Math.min(1, polymeraseX / W);
      } else {
        ribosomeX += speed * 0.4;
        if (ribosomeX > W + 80) { ribosomeX = -80; peptideChain = []; }
      }

      // DNA double helix (simplified)
      ctx.font = '11px Courier';
      ctx.textAlign = 'center';
      for (let x = 0; x < W; x += 30) {
        const angle = (x / W) * Math.PI * 6;
        const y1 = dnaY + Math.sin(angle) * 15;
        const y2 = dnaY - Math.sin(angle) * 15;
        const base1 = ['A','T','G','C'][Math.floor(x/30) % 4];
        const base2 = { A:'T', T:'A', G:'C', C:'G' }[base1];
        ctx.fillStyle = '#334155';
        ctx.fillText(base1, x + 15, y1);
        ctx.fillStyle = '#1e3a5f';
        ctx.fillText(base2, x + 15, y2);
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(x + 15, y1); ctx.lineTo(x + 15, y2); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = '#3b82f6'; ctx.font = '12px Arial'; ctx.textAlign = 'left';
      ctx.fillText('ДНК', 4, dnaY - 4);

      // RNA Polymerase
      if (phase === 'transcription') {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(polymeraseX, dnaY, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000'; ctx.font = '9px Arial'; ctx.textAlign = 'center';
        ctx.fillText('РНК-пол.', polymeraseX, dnaY + 4);

        // mRNA being synthesized
        if (mrnaProgress > 0) {
          ctx.beginPath();
          for (let x = 0; x < polymeraseX; x += 2) {
            const y = mrnaY + Math.sin(x / 15) * 6;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3; ctx.stroke();

          // Render codons on mRNA
          for (let i = 0; i < codons.length; i++) {
            const cx2 = (i / codons.length) * polymeraseX;
            if (cx2 < polymeraseX - 10) {
              ctx.fillStyle = codonColors[i]; ctx.font = '10px Courier'; ctx.textAlign = 'center';
              ctx.fillText(codons[i], cx2 + 30, mrnaY - 12);
            }
          }
        }
        ctx.fillStyle = '#22c55e'; ctx.font = '12px Arial'; ctx.textAlign = 'left';
        ctx.fillText('мРНК', 4, mrnaY - 4);
      }

      // Translation phase
      if (phase === 'translation') {
        // Full mRNA
        ctx.beginPath();
        for (let x = 0; x < W; x += 2) {
          const y = mrnaY + Math.sin(x / 15) * 6;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#22c55e'; ctx.font = '12px Arial'; ctx.textAlign = 'left';
        ctx.fillText('мРНК', 4, mrnaY - 4);

        // Codons
        for (let i = 0; i < codons.length; i++) {
          ctx.fillStyle = codonColors[i]; ctx.font = '10px Courier'; ctx.textAlign = 'center';
          ctx.fillText(codons[i], i * 60 + 50, mrnaY - 10);
        }

        // Ribosome
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(ribosomeX, ribosomeY, 44, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fcd34d'; ctx.font = '9px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Рибосома', ribosomeX, ribosomeY + 3);

        // Decode codon under ribosome
        const codonIdx = Math.floor((ribosomeX - 30) / 60);
        if (codonIdx >= 0 && codonIdx < codons.length - 1) {
          // Add to peptide if new
          if (peptideChain.length <= codonIdx) {
            peptideChain.push({ aa: aminoAcids[codonIdx], color: codonColors[codonIdx] });
          }
        }

        // Draw growing peptide chain
        peptideChain.forEach((aa, idx) => {
          const px = 40 + idx * 55;
          const py = ribosomeY + 45;
          ctx.beginPath();
          ctx.roundRect(px - 18, py - 12, 36, 24, 4);
          ctx.fillStyle = aa.color; ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '9px Arial'; ctx.textAlign = 'center';
          ctx.fillText(aa.aa, px, py + 4);
          if (idx > 0) {
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(px - 18, py); ctx.lineTo(px - 37, py); ctx.stroke();
          }
        });

        if (peptideChain.length > 0) {
          ctx.fillStyle = '#94a3b8'; ctx.font = '11px Arial'; ctx.textAlign = 'left';
          ctx.fillText('Полипептидная цепь:', 4, ribosomeY + 35);
        }
      }

      // Labels
      ctx.fillStyle = '#475569'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
      ctx.fillText(phase === 'transcription' ? 'Транскрипция: ДНК → мРНК' : 'Трансляция: мРНК → Белок', W - 10, 20);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [speed, phase]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={460} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Cpu className="text-emerald-400" /> Синтез Белка
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Транскрипция: РНК-полимераза считывает ДНК и создаёт мРНК. Трансляция: рибосома считывает кодоны мРНК и собирает аминокислоты в белок.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold text-slate-300 mb-1">Фаза процесса:</div>
          {[['transcription','Транскрипция (ДНК → мРНК)'],['translation','Трансляция (мРНК → Белок)']].map(([val, label]) => (
            <button key={val} onClick={() => setPhase(val)}
              className={`p-3 rounded-lg border text-sm text-left transition-all ${phase===val ? 'border-emerald-500 bg-emerald-900/30' : 'border-slate-600 hover:border-slate-500'}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
          Скорость: {speed}x
          <input type="range" min="1" max="6" step="1" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="accent-sky-500" />
        </label>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-emerald-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-emerald-400" />
          <div><strong>Центральная Догма:</strong> ДНК → РНК → Белок. Каждые 3 нуклеотида (кодон) кодируют одну аминокислоту. UAA — стоп-кодон.</div>
        </div>
      </div>
    </div>
  );
}
