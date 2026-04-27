import { useRef, useEffect, useState } from 'react';

export default function ChemistryTitrationCanvas() {
  const canvasRef = useRef(null);
  const graphRef = useRef(null);
  
  const [drops, setDrops] = useState(0);
  const [indicator, setIndicator] = useState('none'); // none, pheno, methyl
  const [isFalling, setIsFalling] = useState(false);
  const dropY = useRef(150);

  // Каждая капля сильно меняет pH около точки эквивалентности (S-образная кривая)
  // Это эмуляция Сильная кислота + Сильное основание
  const getPH = (d) => {
     if (d < 5) return 2 + d * 0.2;
     if (d < 10) return 3 + (d - 5) * 0.4;
     if (d === 10) return 7; // Точка эквивалентности
     if (d < 15) return 11 + (d - 11) * 0.4;
     return 12 + (d - 15) * 0.2;
  };
  
  const phLevel = getPH(drops);

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const height = canvas.height;

    const render = () => {
      ctx.clearRect(0,0,canvas.width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,canvas.width, height);

      // Бюретка 
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(cx - 15, 0, 30, 150);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx-15, 0); ctx.lineTo(cx-15, 150); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+15, 0); ctx.lineTo(cx+15, 150); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - 25, 120, 50, 10);

      // Колба 
      const fBaseY = height - 50;
      ctx.beginPath();
      ctx.moveTo(cx - 20, 250);
      ctx.lineTo(cx + 20, 250);
      ctx.lineTo(cx + 80, fBaseY);
      ctx.lineTo(cx - 80, fBaseY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.stroke();

      const liquidH = 60 + drops * 3;
      const lBaseY = fBaseY - liquidH;
      const ratio = liquidH / (fBaseY - 250);
      const lWidth = 80 - (80 - 20) * (1 - ratio);

      ctx.beginPath();
      ctx.moveTo(cx - lWidth, lBaseY);
      ctx.lineTo(cx + lWidth, lBaseY);
      ctx.lineTo(cx + 70, fBaseY - 5);
      ctx.lineTo(cx - 70, fBaseY - 5);
      ctx.closePath();
      
      let liquidColor = 'rgba(255,255,255,0.2)'; 
      
      if (indicator === 'pheno') {
         if (phLevel >= 8.2) liquidColor = 'rgba(236, 72, 153, 0.8)'; // Малиновый
         else if (phLevel >= 7.5) liquidColor = 'rgba(244, 114, 182, 0.4)'; 
      } else if (indicator === 'methyl') {
         if (phLevel <= 3.1) liquidColor = 'rgba(239, 68, 68, 0.8)'; // Красный
         else if (phLevel >= 4.4) liquidColor = 'rgba(234, 179, 8, 0.8)'; // Желтый
         else liquidColor = 'rgba(249, 115, 22, 0.8)'; // Оранжевый переход
      }

      ctx.fillStyle = liquidColor;
      ctx.fill();

      if (isFalling) {
         ctx.beginPath();
         ctx.arc(cx, dropY.current, 6, 0, Math.PI*2);
         ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
         ctx.fill();
         dropY.current += 15; 
         
         if (dropY.current >= lBaseY) {
            setIsFalling(false);
            dropY.current = 150;
            setDrops(prev => Math.min(prev + 1, 20)); 
         }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isFalling, drops, indicator, phLevel]);

  // Отрисовка Графика pH
  useEffect(() => {
    const graphC = graphRef.current;
    if(!graphC) return;
    const ctx = graphC.getContext('2d');
    const w = graphC.width;
    const h = graphC.height;
    
    ctx.clearRect(0,0,w,h);
    
    // Сетка
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for(let i=0; i<=14; i+=2) {
       const y = h - (i/14)*h;
       ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
       ctx.fillStyle = '#64748b';
       ctx.font = '10px monospace';
       ctx.fillText(i, 5, y - 2);
    }

    // Кривая титрования
    ctx.beginPath();
    for (let d = 0; d <= 20; d++) {
        const x = (d / 20) * (w - 20) + 10;
        const y = h - (getPH(d) / 14) * h;
        if (d === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Текущая точка
    const cx = (drops / 20) * (w - 20) + 10;
    const cy = h - (phLevel / 14) * h;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI*2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();

  }, [drops, phLevel]);

  const addDrop = () => {
     if(!isFalling && drops < 20) {
        dropY.current = 150;
        setIsFalling(true);
     }
  };

  return (
    <div className="flex flex-wrap gap-6 h-full text-slate-100">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full object-contain" />
        
        <div className="absolute top-4 left-4 bg-slate-900/80 p-4 rounded-lg border border-slate-700">
           <h3 className="font-bold text-sky-400">Свойства</h3>
           <p>В колбе: Сильная кислота</p>
           <p>В бюретке: Сильное основание</p>
           <p className="mt-2 font-mono text-xl text-emerald-400">pH = {phLevel.toFixed(1)}</p>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-4">
        <h2 className="text-xl font-bold border-b border-slate-600 pb-2">Титрование & pH</h2>

        <p className="text-sm text-slate-400 mb-2">
           Как только база нейтрализует кислоту, происходит резкий скачок pH (S-кривая). Выберите индикатор для реакции на этот скачок.
        </p>

        <div className="flex flex-col gap-2">
           <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-700/50 rounded-lg">
              <input type="radio" checked={indicator === 'none'} onChange={() => setIndicator('none')} className="accent-slate-400 w-4 h-4"/>
              <span className="font-bold text-slate-300">Без индикатора</span>
           </label>
           <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-700/50 rounded-lg">
              <input type="radio" checked={indicator === 'pheno'} onChange={() => setIndicator('pheno')} className="accent-pink-500 w-4 h-4"/>
              <span className="font-bold text-pink-300">Фенолфталеин (pH {'>'} 8.2)</span>
           </label>
           <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-700/50 rounded-lg">
              <input type="radio" checked={indicator === 'methyl'} onChange={() => setIndicator('methyl')} className="accent-amber-500 w-4 h-4"/>
              <span className="font-bold text-amber-300">Метилоранж (pH 3.1 - 4.4)</span>
           </label>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col gap-2 relative mt-2">
            <span className="absolute top-2 right-2 text-xs text-slate-500">S-Кривая Титрования</span>
            <canvas ref={graphRef} width={280} height={110} className="w-full mt-4" />
        </div>

        <div className="bg-slate-900/50 p-3 rounded-lg text-xs font-mono text-emerald-400">
           <b>Химическая Реакция (Нейтрализация):</b><br/>
           HCl + NaOH → NaCl + H₂O<br/>
           H⁺ + OH⁻ → H₂O (упрощенно)
        </div>

        <button 
           onClick={addDrop} 
           disabled={drops >= 20 || isFalling}
           className="mt-auto bg-sky-500 hover:bg-sky-600 disabled:opacity-50 font-bold py-3 rounded-lg text-white"
        >
           {drops >= 20 ? 'Точка пройдена' : '+1 Капля NaOH'}
        </button>

        <button 
           onClick={() => { setDrops(0); setIsFalling(false); setIndicator('none'); }} 
           className="btn btn-outline border-slate-500 hover:bg-slate-700 text-slate-300 py-2 rounded-lg"
        >
           Сменить пробирку
        </button>
      </div>
    </div>
  );
}
