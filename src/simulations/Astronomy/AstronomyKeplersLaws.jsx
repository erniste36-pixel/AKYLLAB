import { useRef, useEffect, useState } from 'react';

export default function AstronomyKeplersLaws() {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(1.0);
  const [showAxes, setShowAxes] = useState(true);
  const [showFoci, setShowFoci] = useState(true);

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Планеты (орбитальные параметры)
    // a - большая полуось, e - эксцентриситет (0 до 1), color
    const planets = [
       { name: 'Mercury', a: 60, e: 0.205, color: '#94a3b8', angle: 0, speedMult: 4.1 },
       { name: 'Venus', a: 110, e: 0.007, color: '#f59e0b', angle: 2, speedMult: 1.6 },
       { name: 'Earth', a: 160, e: 0.016, color: '#3b82f6', angle: 4, speedMult: 1.0 },
       { name: 'Mars', a: 220, e: 0.093, color: '#ef4444', angle: 1, speedMult: 0.53 }
    ];

    let time = 0;

    const render = () => {
      ctx.clearRect(0,0,canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a'; // Млечный путь
      ctx.fillRect(0,0,canvas.width, canvas.height);
      
      // Звезды
      ctx.fillStyle = '#fff';
      for(let i=0; i<30; i++) {
          ctx.beginPath();
          ctx.arc((i*137)%canvas.width, (i*251)%canvas.height, 1, 0, Math.PI*2);
          ctx.globalAlpha = Math.sin(time*0.05 + i) * 0.5 + 0.5;
          ctx.fill();
      }
      ctx.globalAlpha = 1;

      time += 0.02 * speed;

      // Солнце в фокусе F1
      // В эллипсе фокус смещен от центра (cx, cy) на величину c = a * e
      // Орбиты будут отцентрованы так, чтобы Солнце(F1) было в (cx, cy) всегда.
      // Значит геометрический центр эллипса должен быть сдвинут на -c.
      
      planets.forEach(p => {
          const c = p.a * p.e; // Фокусное расстояние
          const b = p.a * Math.sqrt(1 - p.e * p.e); // Малая полуось
          const center_x = cx - c; // Сдвигаем центр эллипса, чтобы Солнце оказалось точно в cx

          // Траектория орбиты
          ctx.beginPath();
          ctx.ellipse(center_x, cy, p.a, b, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,0.1)`;
          ctx.lineWidth = 1;
          ctx.stroke();

          if (showAxes) {
             ctx.beginPath();
             ctx.moveTo(center_x - p.a, cy); ctx.lineTo(center_x + p.a, cy);
             ctx.moveTo(center_x, cy - b); ctx.lineTo(center_x, cy + b);
             ctx.strokeStyle = `${p.color}30`;
             ctx.stroke();
          }

          if (showFoci) {
             // F1 Это Солнце(cx). F2 это center_x - c
             ctx.fillStyle = p.color;
             ctx.beginPath(); ctx.arc(center_x - c, cy, 3, 0, Math.PI*2); ctx.fill();
             ctx.font = '10px sans-serif'; ctx.fillText('F2', center_x - c - 5, cy + 15);
          }

          // Движение по Кеплеру
          // Истинная аномалия вычисляется сложно, упростим для Canvas через эксцентрическую аномалию
          p.angle += 0.02 * speed * p.speedMult; 
          
          // Параметрическое уравнение эллипса от его центра
          const x = center_x + p.a * Math.cos(p.angle);
          const y = cy + b * Math.sin(p.angle);

          // Планета
          ctx.shadowBlur = 10; ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2); ctx.fill();
          ctx.shadowBlur = 0;
          
          ctx.fillStyle = '#fff';
          ctx.font = '12px bold sans-serif';
          ctx.fillText(p.name, x+10, y+4);
      });

      // Солнце F1 (Точно по центру экрана)
      ctx.shadowBlur = 30; ctx.shadowColor = '#f59e0b';
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '12px sans-serif'; ctx.fillText('Sun (F1)', cx - 20, cy + 30);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [speed, showAxes, showFoci]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b border-slate-600 pb-2">Kepler's Laws</h2>
        
        <p className="text-sm text-slate-400">
           1-й закон: Планеты движутся по эллипсам, в одном из фокусов которых находится Солнце.
        </p>

        <label className="flex flex-col gap-2 font-bold text-indigo-400">
           Simulation Speed: x{speed.toFixed(1)}
           <input type="range" min="0" max="5" step="0.5" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="accent-indigo-500" />
        </label>

        <div className="flex flex-col gap-3 mt-4">
           <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-700/50 rounded-lg">
              <input type="checkbox" checked={showFoci} onChange={e=>setShowFoci(e.target.checked)} className="accent-sky-500 w-5 h-5"/>
              <span className="font-bold text-sky-200">Show Ellipse Foci (F1, F2)</span>
           </label>
           
           <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-700/50 rounded-lg">
              <input type="checkbox" checked={showAxes} onChange={e=>setShowAxes(e.target.checked)} className="accent-purple-500 w-5 h-5"/>
              <span className="font-bold text-purple-200">Show Ellipse Axes</span>
           </label>
        </div>

        <div className="mt-auto bg-slate-900 p-4 rounded text-xs text-amber-500 border border-amber-900/30">
           Чем выше эксцентриситет орбиты, тем сильнее эллипс сплюснут (у Марса и Меркурия вытянутые орбиты, у Венеры - почти идеальный круг).
        </div>
      </div>
    </div>
  );
}
