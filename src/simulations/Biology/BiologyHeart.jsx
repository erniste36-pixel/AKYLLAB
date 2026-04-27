import { useRef, useEffect, useState } from 'react';
import { Activity, Info } from 'lucide-react';

export default function BiologyHeart() {
  const canvasRef = useRef(null);
  
  // Функции контроллеры: ЧСС, Сила сокращений, Сосудистое сопротивление
  const [bpm, setBpm] = useState(70);
  const [contractility, setContractility] = useState(1.0); // 0.5 to 1.5
  const [resistance, setResistance] = useState(120); // systolyc pressure sim
  
  const [stats, setStats] = useState({ output: 0.0, stroke: 0.0 });

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    let time = 0;
    
    // Кровь (частицы)
    const bloodParticles = Array.from({length: 120}, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 60,
        chamber: Math.floor(Math.random() * 4), // 0: RA, 1: RV, 2: LA, 3: LV
        speed: 1 + Math.random()
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Фон с мягким пульсирующим градиентом
      const beatFreq = (bpm / 60) * Math.PI * 2;
      const beatPhase = Math.sin(time * beatFreq);
      // Острая пульсация а-ля ЭКГ (систола)
      const systole = Math.pow(Math.max(0, Math.sin(time * beatFreq - 0.5)), 4);
      const diastole = Math.pow(Math.max(0, -Math.sin(time * beatFreq)), 2);

      const bgGradient = ctx.createRadialGradient(cx, cy, 50, cx, cy, width/2);
      bgGradient.addColorStop(0, `rgba(225, 29, 72, ${0.1 + systole * 0.1})`);
      bgGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      time += 1 / 60;

      // Математика сердца
      // Ход сокращения (Stroke Volume) зависит от Contractility и Resistance
      const strokeVolume = 70 * contractility * (120 / resistance);
      const cardiacOutput = (strokeVolume * bpm) / 1000; // Литров в минуту
      
      // Обновляем статистику 2 раза в секунду
      if (Math.floor(time * 60) % 30 === 0) {
          setStats({ output: cardiacOutput.toFixed(1), stroke: strokeVolume.toFixed(0) });
      }

      // АНИМАЦИЯ: 4 камеры сердца
      // Правое предсердие (RA - синий), Правый желудочек (RV - синий)
      // Левое предсердие (LA - красный), Левый желудочек (LV - красный)
      
      // Размер камер
      const baseR = 50;
      const atriumCompress = diastole * baseR * 0.2; 
      const ventCompress = systole * baseR * 0.3 * contractility;

      const drawChamber = (x, y, r, compression, color, label) => {
          ctx.beginPath();
          // При сжатии объем уменьшается
          ctx.ellipse(x, y, r - compression, r + compression/2, 0, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.lineWidth = 4 + compression/5;
          ctx.strokeStyle = `rgba(255,255,255,0.4)`;
          ctx.stroke();

          ctx.fillStyle = '#fff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(label, x, y + 5);
      };

      const RA_pos = { x: cx - 60, y: cy - 50 };
      const RV_pos = { x: cx - 50, y: cy + 60 };
      const LA_pos = { x: cx + 60, y: cy - 50 };
      const LV_pos = { x: cx + 50, y: cy + 60 };
      
      // Кровь - отрисуем линии потока (аорта / артерии)
      ctx.lineWidth = 20;
      // Легочная артерия (из RV)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath(); ctx.moveTo(RV_pos.x, RV_pos.y); ctx.quadraticCurveTo(cx, cy - 100, cx - 120, cy - 120); ctx.stroke();
      // Аорта (из LV)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath(); ctx.moveTo(LV_pos.x, LV_pos.y); ctx.quadraticCurveTo(cx, cy - 150, cx + 120, cy - 100); ctx.stroke();

      // Сами камеры
      drawChamber(RA_pos.x, RA_pos.y, 40, atriumCompress, 'rgba(14, 165, 233, 0.6)', 'RA');
      drawChamber(LA_pos.x, LA_pos.y, 40, atriumCompress, 'rgba(225, 29, 72, 0.6)', 'LA');
      
      drawChamber(RV_pos.x, RV_pos.y, 55, ventCompress, 'rgba(2, 132, 199, 0.8)', 'RV');
      drawChamber(LV_pos.x, LV_pos.y, 65, ventCompress, 'rgba(190, 18, 60, 0.8)', 'LV');

      // Анимация ЭКГ на заднем плане
      ctx.beginPath();
      for(let i=0; i<300; i++) {
         const t = time - (300-i)*0.01;
         const phase = (t * beatFreq) % (Math.PI*2);
         let y = height - 50;
         
         // Упрощенный P-QRS-T комплекс
         if(phase > 0 && phase < 0.5) y -= Math.sin(phase * Math.PI*2) * 10; // P wave
         else if(phase > 0.8 && phase < 1.0) y += 10; // Q wave
         else if(phase >= 1.0 && phase < 1.2) y -= 60; // R wave
         else if(phase >= 1.2 && phase < 1.4) y += 20; // S wave
         else if(phase > 2.0 && phase < 2.8) y -= Math.sin((phase-2.0)*Math.PI*1.25) * 15; // T wave
         
         if(i===0) ctx.moveTo(20 + i, y);
         else ctx.lineTo(20 + i, y);
      }
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [bpm, contractility, resistance]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-600 p-3 rounded-lg backdrop-blur-md">
           <div className="text-emerald-400 font-bold mb-1 border-b border-slate-700 pb-1">Показатели гемодинамики</div>
           <div className="text-sm">ОЦК: <span className="font-mono text-white">{stats.output} л/мин</span></div>
           <div className="text-sm">Ударный объём: <span className="font-mono text-white">{stats.stroke} мл</span></div>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Activity className="text-rose-500" /> Физиология Сердца
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Управляй параметрами сердечно-сосудистой системы. Наблюдай, как ЧСС и сила сокращений (сократимость) влияют на объем крови, перекачиваемый за минуту.
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-rose-400 text-sm">
           Частота сокращений (BPM): {bpm}
           <input type="range" min="40" max="180" step="1" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="accent-rose-500" />
           <span className="text-xs text-slate-400 font-normal">Тахикардия (выше 100) снижает время наполнения желудочков (диастолу).</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-fuchsia-400 text-sm">
           Сократимость миокарда: {(contractility * 100).toFixed(0)}%
           <input type="range" min="0.5" max="2.0" step="0.1" value={contractility} onChange={e => setContractility(Number(e.target.value))} className="accent-fuchsia-500" />
           <span className="text-xs text-slate-400 font-normal">Эффект адреналина. Увеличивает силу выброса крови в аорту.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-blue-400 text-sm">
           Периферическое сопротивление: {resistance} mmHg
           <input type="range" min="60" max="200" step="5" value={resistance} onChange={e => setResistance(Number(e.target.value))} className="accent-blue-500" />
           <span className="text-xs text-slate-400 font-normal">Симуляция артериального давления. Высокое сопротивление мешает сердцу протолкнуть кровь (снижает ударный объём).</span>
        </label>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-rose-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-rose-400" />
           <div>
             <strong>Формула Франка-Старлинга:</strong> Сила сокращения сердца пропорциональна степени растяжения мышечных волокон во время диастолы.
           </div>
        </div>
      </div>
    </div>
  );
}
