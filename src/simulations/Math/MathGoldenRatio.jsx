import { useRef, useEffect, useState } from 'react';
import { Calculator, Info } from 'lucide-react';

export default function MathGoldenRatio() {
  const canvasRef = useRef(null);
  
  const [scale, setScale] = useState(20);
  const [iterations, setIterations] = useState(6);
  
  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.02;

      // Center the drawing
      let cx = width / 2;
      let cy = height / 2;
      
      // Dynamic zoom effect
      const currentScale = scale * (1 + Math.sin(time*0.5)*0.1); // slight breathing

      // Fibonacci sequence calculation
      const fib = [1, 1];
      for(let i = 2; i <= iterations; i++) {
          fib.push(fib[i-1] + fib[i-2]);
      }

      ctx.save();
      ctx.translate(cx, cy);
      // Опционально: медленно вращаем
      // ctx.rotate(time * 0.1); 

      let x = 0, y = 0;
      let dir = 0; // 0: Right, 1: Up, 2: Left, 3: Down
      
      const colors = ['#f472b6', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'];

      ctx.lineWidth = 1;
      
      // Рисуем квадраты и спираль
      for(let i = 0; i < iterations; i++) {
          const side = fib[i] * currentScale;
          
          let sqX = x, sqY = y;
          let arcStartX, arcStartY, startAngle, endAngle;

          switch(dir) {
              case 0:
                  sqY -= side; // Draws up
                  arcStartX = x; arcStartY = y;
                  startAngle = Math.PI/2; endAngle = Math.PI;
                  x += side; // Move cursor right
                  break;
              case 1:
                  sqX -= side; // Draws left
                  sqY -= side;
                  arcStartX = x; arcStartY = y - side;
                  startAngle = 0; endAngle = Math.PI/2;
                  y -= side; // Move cursor up
                  break;
              case 2:
                  sqX -= side; // Draws down
                  arcStartX = x - side; arcStartY = y;
                  startAngle = -Math.PI/2; endAngle = 0;
                  x -= side; // Move cursor left
                  break;
              case 3:
                  arcStartX = x; arcStartY = y + side;
                  startAngle = Math.PI; endAngle = Math.PI * 1.5;
                  y += side; // Move cursor down
                  break;
          }

          // Квадрат
          ctx.beginPath();
          ctx.rect(sqX, sqY, side, side);
          ctx.fillStyle = colors[i % colors.length] + '40'; // 25% opacity
          ctx.fill();
          ctx.strokeStyle = colors[i % colors.length];
          ctx.stroke();

          // Дуга
          ctx.beginPath();
          ctx.arc(arcStartX, arcStartY, side, startAngle, endAngle, true);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.lineWidth = 1;

          // Рисуем число
          if (side > 15) {
              ctx.fillStyle = '#fff';
              ctx.font = `${Math.min(20, side/2)}px Courier`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(fib[i], sqX + side/2, sqY + side/2);
          }

          dir = (dir + 1) % 4;
      }
      
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [scale, iterations]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-contain" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Calculator className="text-pink-400" /> Золотое сечение
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Визуализация Фибоначчи и соотношения пропорций "Φ" (1.618), пронизывающих природу — от ракушек до галактик.
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-pink-400 text-sm">
           Масштаб (Дистанция): {scale}x
           <input type="range" min="2" max="60" step="1" value={scale} onChange={e => setScale(Number(e.target.value))} className="accent-pink-500" />
           <span className="text-xs text-slate-400 font-normal">Увеличивает базовый размер квадрата 1х1.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-amber-300 text-sm">
           Кол-во итераций: {iterations}
           <input type="range" min="3" max="12" step="1" value={iterations} onChange={e => setIterations(Number(e.target.value))} className="accent-amber-400" />
           <span className="text-xs text-slate-400 font-normal">Каждая ступень - это сумма двух предыдущих (1, 1, 2, 3, 5, 8, 13...). Осторожно, растет экспоненциально!</span>
        </label>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-pink-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-pink-400" />
           <div>
             <strong>Геометрия Хаоса:</strong> Отношение любой пары соседних чисел стремится к ~1.61803398. Самые эстетичные формы в архитектуре подчиняются этому правилу!
           </div>
        </div>
      </div>
    </div>
  );
}
