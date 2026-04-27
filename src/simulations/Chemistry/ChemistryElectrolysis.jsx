import { useRef, useEffect, useState } from 'react';
import { Zap, Info } from 'lucide-react';

export default function ChemistryElectrolysis() {
  const canvasRef = useRef(null);
  const [voltage, setVoltage] = useState(5); // Volts
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const bubbles = [];

    const createBubble = (x, type) => {
        // type: H2 (Hydrogen - Cathode) or O2 (Oxygen - Anode)
        bubbles.push({
            x: x + (Math.random() - 0.5) * 40, // Разброс вокруг электрода
            y: height - 120 + Math.random() * 20,
            vy: -1 - Math.random() * (voltage * 0.2), // Скорость всплытия зависит от напряжения
            radius: type === 'H2' ? 3 + Math.random() * 2 : 5 + Math.random() * 4,
            type: type,
            wobbleSpeed: 0.05 + Math.random() * 0.1,
            wobbleOffset: Math.random() * Math.PI * 2
        });
    };

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.05;

      // 1. Отрисовка емкости (Beaker)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Вода (Электролит)
      const waterLevel = 100;
      ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.fillRect(50, waterLevel, width - 100, height - waterLevel - 20);
      
      // Блик на воде
      ctx.beginPath();
      for(let i=50; i<=width-50; i+=10) {
          ctx.lineTo(i, waterLevel + Math.sin(time*2 + i*0.05)*3);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Стенки стакана
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(50, 40);
      ctx.lineTo(50, height - 20);
      ctx.lineTo(width - 50, height - 20);
      ctx.lineTo(width - 50, 40);
      ctx.stroke();

      const cathodeX = width / 3;
      const anodeX = width * 2 / 3;

      // 2. Генерация пузырьков (Закон Фарадея: масса/газ пропорциональны заряду)
      if (running && voltage > 1.23) { // 1.23V is min theoretical voltage for water electrolysis
          // H2 выделяется в 2 раза больше чем O2
          if (Math.random() < voltage * 0.05) {
              createBubble(cathodeX, 'H2');
          }
          if (Math.random() < voltage * 0.025) {
              createBubble(anodeX, 'O2');
          }
      }

      // 3. Обновление и отрисовка пузырьков
      for (let i = bubbles.length - 1; i >= 0; i--) {
          let b = bubbles[i];
          b.y += b.vy;
          b.x += Math.sin(time * b.wobbleSpeed + b.wobbleOffset) * 1.5;

          if (b.y < waterLevel - 10) {
              bubbles.splice(i, 1);
              continue;
          }

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.strokeStyle = b.type === 'H2' ? 'rgba(203, 213, 225, 0.6)' : 'rgba(125, 211, 252, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Блик внутри пузырька
          ctx.beginPath();
          ctx.arc(b.x - b.radius*0.3, b.y - b.radius*0.3, b.radius*0.2, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fill();
      }

      // 4. Отрисовка Электродов
      // Cathode (-) (Притягивает H+)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cathodeX - 20, waterLevel - 20, 40, height - waterLevel - 40);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cathodeX - 10, waterLevel - 20, 20, height - waterLevel - 40);

      // Anode (+) (Притягивает OH-)
      ctx.fillStyle = '#b45309'; // Медный анод
      ctx.fillRect(anodeX - 20, waterLevel - 20, 40, height - waterLevel - 40);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(anodeX - 10, waterLevel - 20, 20, height - waterLevel - 40);

      // Подписи на электродах
      ctx.font = '24px Arial';
      ctx.fillStyle = '#fff';
      
      // Катод мигает
      if(running && voltage > 0) ctx.shadowColor = '#cbd5e1'; ctx.shadowBlur = Math.random()*10;
      ctx.fillText('-', cathodeX - 7, height - 50);
      ctx.shadowBlur = 0;

      // Анод мигает
      if(running && voltage > 0) ctx.shadowColor = '#fcd34d'; ctx.shadowBlur = Math.random()*10;
      ctx.fillText('+', anodeX - 8, height - 50);
      ctx.shadowBlur = 0;

      // Провода
      ctx.beginPath();
      ctx.moveTo(cathodeX, waterLevel - 20); ctx.lineTo(cathodeX, 10); ctx.lineTo(width/2 - 40, 10);
      ctx.moveTo(anodeX, waterLevel - 20); ctx.lineTo(anodeX, 10); ctx.lineTo(width/2 + 40, 10);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Источник питания коробка
      ctx.fillStyle = '#334155';
      ctx.fillRect(width/2 - 50, 0, 100, 30);
      ctx.font = '12px Courier';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`${voltage.toFixed(1)}V`, width/2 - 15, 20);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [voltage, running]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-contain" />
        
        {/* Информационные плашки */}
        <div className="absolute top-[40%] left-[8%] bg-slate-900/80 border border-slate-600 px-3 py-1 rounded text-xs backdrop-blur-md text-slate-300">
           Катод (-)<br/><span className="text-white font-bold">2H⁺ + 2e⁻ → H₂↑</span>
        </div>
        <div className="absolute top-[40%] right-[8%] bg-slate-900/80 border border-amber-900/50 px-3 py-1 rounded text-xs backdrop-blur-md text-amber-200">
           Анод (+)<br/><span className="text-white font-bold">4OH⁻ - 4e⁻ → 2H₂O + O₂↑</span>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Zap className="text-yellow-400" /> Электролиз воды
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             При пропускании постоянного электрического тока через подкисленную воду молекулы H₂O распадаются на водород и кислород.
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
           Напряжение на электродах: {voltage.toFixed(1)} В
           <input type="range" min="0" max="24" step="0.5" value={voltage} onChange={e => setVoltage(Number(e.target.value))} className="accent-sky-500" />
           <span className="text-xs text-slate-400 font-normal">При U &lt; 1.23 В реакция почти не протекает (теоретический минимум разложения).</span>
        </label>

        <button 
           onClick={() => setRunning(!running)}
           className={`mt-4 py-3 rounded-lg font-bold text-white transition-colors ${running ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
        >
           {running ? 'Отключить цепь' : 'Замкнуть цепь'}
        </button>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs text-blue-300 border border-blue-900/40">
           <Info size={16} className="shrink-0 mt-0.5" />
           <div>
             <strong>Соотношение газов:</strong> Обрати внимание, что на катоде выделяется ровно в 2 раза больше пузырьков (водород), чем на аноде (кислород). Формула H₂O в действии!
           </div>
        </div>
      </div>
    </div>
  );
}
