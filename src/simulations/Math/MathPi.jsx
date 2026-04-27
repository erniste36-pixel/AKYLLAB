import { useRef, useEffect, useState } from 'react';
import { Calculator, Info } from 'lucide-react';

export default function MathPi() {
  const canvasRef = useRef(null);
  
  // Custom Controls: Дистанция диаметра, Скорость проката
  const [diameter, setDiameter] = useState(80); //px
  const [speed, setSpeed] = useState(2); // px per frame
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const circumference = Math.PI * diameter;
    
    // Position of the wheel
    let currentX = 50;
    const groundY = height - 100;
    const endX = currentX + circumference; // Точно Пи * D

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Рисуем землю (ось X)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Рисуем отметки начала и конца развертки (π*D)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      // Линейка для визуального определения длины
      ctx.moveTo(50, groundY + 20); ctx.lineTo(endX, groundY + 20);
      ctx.moveTo(50, groundY + 10); ctx.lineTo(50, groundY + 30);
      ctx.moveTo(endX, groundY + 10); ctx.lineTo(endX, groundY + 30);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Текст Pi * D
      ctx.fillStyle = '#ef4444';
      ctx.font = '16px Courier bold';
      ctx.textAlign = 'center';
      ctx.fillText(`L = π × ${diameter} ≈ ${Math.round(circumference)} px`, 50 + circumference/2, groundY + 40);

      // Движение колеса
      if (running) {
          currentX += speed;
          if (currentX > endX + 100) currentX = 50; // Reset
      }

      // Вычисление угла поворота: Расстояние = Угол * Радиус => Угол = Расстояние / Радиус
      const distanceTraveled = currentX - 50;
      const angle = distanceTraveled / (diameter / 2);

      // Отрисовка траектории (Циклоида) - шлейф от красной точки
      ctx.beginPath();
      for(let x = 50; x <= Math.min(currentX, endX + 100); x += 2) {
          const traveled = x - 50;
          const a = traveled / (diameter / 2);
          const px = x + Math.sin(a) * (diameter/2);
          const py = groundY - (diameter/2) + Math.cos(a) * (diameter/2);
          if (x===50) ctx.moveTo(px,py);
          else ctx.lineTo(px,py);
      }
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)'; // amber
      ctx.lineWidth = 3;
      ctx.stroke();

      // Центр колеса
      const cx = currentX;
      const cy = groundY - diameter / 2;

      // Отрисовка размотанной нити (если мы между 0 и PI*D)
      if (distanceTraveled > 0 && distanceTraveled <= circumference) {
          ctx.beginPath();
          ctx.moveTo(50, groundY);
          ctx.lineTo(currentX, groundY);
          ctx.strokeStyle = '#38bdf8'; // Нить
          ctx.lineWidth = 4;
          ctx.stroke();
      } else if (distanceTraveled > circumference) {
          // Нить полностью лежит на земле
          ctx.beginPath();
          ctx.moveTo(50, groundY);
          ctx.lineTo(endX, groundY);
          ctx.strokeStyle = '#38bdf8'; 
          ctx.lineWidth = 4;
          ctx.stroke();
      }

      // Отрисовка Колеса
      ctx.beginPath();
      ctx.arc(cx, cy, diameter / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Красная точка (обод колеса, которая и рисует циклоиду)
      const dotX = cx + Math.sin(angle) * (diameter / 2);
      const dotY = cy + Math.cos(angle) * (diameter / 2);
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Линия от центра к точке (показывает вращение)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(dotX, dotY);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ось
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI*2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [diameter, speed, running]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={400} className="w-full h-full object-contain" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Calculator className="text-orange-400" /> Развертка числа Пи
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             π (Пи) — это отношение длины любой окружности к её диаметру. Прокатите колесо на полный оборот, чтобы увидеть развернутую длину.
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
           Диаметр окружности (Дистанция): {diameter} px
           <input type="range" min="40" max="150" step="10" value={diameter} onChange={e => setDiameter(Number(e.target.value))} className="accent-sky-500" />
           <span className="text-xs text-slate-400 font-normal">Увеличь диаметр, и длина красного отрезка на земле вырастет ровно в 3.14159... раз.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-amber-300 text-sm">
           Скорость проката: {speed}
           <input type="range" min="1" max="10" step="1" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="accent-amber-400" />
        </label>

        <button 
           onClick={() => setRunning(!running)}
           className={`py-3 rounded-lg font-bold text-white transition-colors mt-2 ${running ? 'bg-slate-600' : 'bg-orange-600'}`}
        >
           {running ? 'Пауза симуляции' : 'Вращать колесо'}
        </button>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-orange-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-orange-400" />
           <div>
             <strong>Траектория:</strong> Красная точка на ободе рисует линию, которая называется <em>Циклоида</em>. Её свойства активно используются в инженерии и архитектуре мостов.
           </div>
        </div>
      </div>
    </div>
  );
}
