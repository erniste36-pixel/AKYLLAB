import { useRef, useEffect, useState } from 'react';
import { Box, Info } from 'lucide-react';

export default function ChemistryCrystallization() {
  const canvasRef = useRef(null);
  const [supersaturation, setSupersaturation] = useState(50);
  const [temperature, setTemperature] = useState(60); // Lower = faster crystallization
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const cx = width / 2;
    const cy = height / 2;

    let particles = [];
    let crystal = []; // Points of the growing crystal
    
    // Seed in the middle
    crystal.push({ x: cx, y: cy });

    const initParticles = () => {
        particles = [];
        for(let i = 0; i < supersaturation * 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 50 + Math.random() * 300;
            particles.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r
            });
        }
    };

    initParticles();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Фон
      const tempInt = temperature / 100;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, width/2);
      gradient.addColorStop(0, `rgba(15, 23, 42, 1)`);
      gradient.addColorStop(1, `rgba(${Math.floor(tempInt*50)}, ${Math.floor(tempInt*100)}, ${150 + Math.floor(tempInt*100)}, 1)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (running) {
          const moveSpeed = (100 - temperature) / 20 + 1; // Холоднее -> быстрее прилипают / движутся к центру
          const attachDistSq = 25; // 5^2

          for(let i = particles.length - 1; i >= 0; i--) {
              let p = particles[i];
              
              // Random walk + slight pull to center
              p.x += (Math.random() - 0.5) * 8 + (cx - p.x) * 0.005 * moveSpeed;
              p.y += (Math.random() - 0.5) * 8 + (cy - p.y) * 0.005 * moveSpeed;

              // Collision check with crystal
              let attached = false;
              for(let j = 0; j < crystal.length; j++) {
                  const c = crystal[j];
                  const dx = c.x - p.x;
                  const dy = c.y - p.y;
                  if (dx*dx + dy*dy < attachDistSq) {
                      attached = true;
                      break;
                  }
              }

              if (attached) {
                  crystal.push({ x: p.x, y: p.y });
                  particles.splice(i, 1);
              }
          }
      }

      // Отрисовка Кристалла (DLA Fractal)
      ctx.fillStyle = '#fce7f3'; // Pinkish white
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1;
      
      crystal.forEach((c) => {
          ctx.beginPath();
          ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // ctx.stroke();
      });

      // Свечение кристалла
      if (crystal.length > 1) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#f472b6';
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI*2);
          ctx.fill();
          ctx.shadowBlur = 0;
      }

      // Отрисовка свободных ионов
      ctx.fillStyle = 'rgba(236, 72, 153, 0.5)';
      particles.forEach((p) => {
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      });

      // Отрисовка метрик на канвасе
      ctx.font = '14px Courier';
      ctx.fillStyle = '#f472b6';
      ctx.fillText(`Масса кристалла: ${crystal.length} ед.`, 20, 30);
      ctx.fillText(`Свободных ионов: ${particles.length}`, 20, 50);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [supersaturation, temperature, running]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Box className="text-pink-400" /> Кристаллизация
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Симуляция агрегации, ограниченной диффузией (DLA). Ионы из перенасыщенного раствора прикрепляются к ядру, формируя фрактальный кристалл.
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-pink-400 text-sm">
           Температура раствора: {temperature}°C
           <input type="range" min="10" max="90" step="5" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="accent-pink-500" />
           <span className="text-xs text-slate-400 font-normal">Охлаждение раствора ускоряет выпадение осадка и рост кристалла.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-rose-400 text-sm mt-2">
           Перенасыщенность: {supersaturation}x
           <input type="range" min="10" max="100" step="10" value={supersaturation} onChange={e => setSupersaturation(Number(e.target.value))} className="accent-rose-500" />
        </label>

        <button 
           onClick={() => setRunning(!running)}
           className={`mt-2 py-3 rounded-lg font-bold text-white transition-colors ${running ? 'bg-slate-600 hover:bg-slate-500' : 'bg-pink-600 hover:bg-pink-500'}`}
        >
           {running ? 'Пауза роста' : 'Возобновить'}
        </button>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs text-blue-300 border border-blue-900/40">
           <Info size={16} className="shrink-0 mt-0.5" />
           <div>
             <strong>Фрактальная размерность:</strong> Форма растущего кристалла никогда не повторяется. В природе так растут снежинки, минералы и даже колонии бактерий.
           </div>
        </div>
      </div>
    </div>
  );
}
