import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Info } from 'lucide-react';

export default function ChemistryReactionRate() {
  const canvasRef = useRef(null);
  const [temperature, setTemperature] = useState(25);
  const [catalyst, setCatalyst] = useState(false);
  const [concentration, setConcentration] = useState(50);
  const [stats, setStats] = useState({ reactants: 0, products: 0 });

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Reactants: Blue and Reactants: Pink. Products: Purple
    let particles = [];
    
    const initParticles = () => {
        particles = [];
        for (let i = 0; i < concentration; i++) {
            particles.push({
                x: width * 0.1 + Math.random() * (width * 0.8),
                y: height * 0.1 + Math.random() * (height * 0.8),
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                type: Math.random() > 0.5 ? 'A' : 'B', // A=Blue, B=Pink, C=Product
                radius: 10,
                reacted: false
            });
        }
        setStats({ reactants: particles.length, products: 0 });
    };

    initParticles();

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Температурный градиент фона
      const heatIntensity = Math.min(1, Math.max(0, (temperature - 20) / 80));
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, `rgba(${Math.floor(255 * heatIntensity)}, 20, 20, ${heatIntensity * 0.4})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      let productsCount = 0;
      let reactantsCount = 0;

      // Base speed multiplier driven by temperature
      const speedMultiplier = 0.5 + (temperature / 100) * 3;
      const activationEnergy = catalyst ? 30 : 60; // Шанс реакции при столкновении

      for (let i = 0; i < particles.length; i++) {
          let p = particles[i];
          
          // Движение
          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;

          // Отскок от стен
          if (p.x < p.radius) { p.x = p.radius; p.vx *= -1; }
          if (p.x > width - p.radius) { p.x = width - p.radius; p.vx *= -1; }
          if (p.y < p.radius) { p.y = p.radius; p.vy *= -1; }
          if (p.y > height - p.radius) { p.y = height - p.radius; p.vy *= -1; }

          // Столкновения
          for (let j = i + 1; j < particles.length; j++) {
              let p2 = particles[j];
              const dx = p2.x - p.x;
              const dy = p2.y - p.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              if (dist < p.radius + p2.radius) {
                  // Отскок
                  const nx = dx / dist; const ny = dy / dist;
                  const pvx = p.vx; const pvy = p.vy;
                  p.vx = p2.vx; p.vy = p2.vy;
                  p2.vx = pvx; p2.vy = pvy;
                  
                  p.x -= nx; p.y -= ny;
                  p2.x += nx; p2.y += ny;

                  // Химическая реакция (A + B -> C)
                  if (!p.reacted && !p2.reacted) {
                      if ((p.type === 'A' && p2.type === 'B') || (p.type === 'B' && p2.type === 'A')) {
                          const collisionEnergy = (Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p2.vx) + Math.abs(p2.vy)) * speedMultiplier * 10;
                          
                          if (collisionEnergy > activationEnergy || Math.random() < (catalyst ? 0.05 : 0.005)) {
                              p.type = 'C'; p.reacted = true;
                              p2.type = 'C'; p2.reacted = true;
                              
                              // Визуальный эффект реакции
                              ctx.beginPath();
                              ctx.arc((p.x+p2.x)/2, (p.y+p2.y)/2, 30, 0, Math.PI*2);
                              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                              ctx.fill();
                          }
                      }
                  }
              }
          }

          if (p.type === 'C') productsCount++; else reactantsCount++;

          // Отрисовка
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          if (p.type === 'A') {
              ctx.fillStyle = '#38bdf8'; // Реагент A
          } else if (p.type === 'B') {
              ctx.fillStyle = '#f472b6'; // Реагент B
          } else {
              ctx.fillStyle = '#a855f7'; // Продукт C
              ctx.shadowBlur = 10;
              ctx.shadowColor = '#a855f7';
          }
          ctx.fill();
          ctx.shadowBlur = 0;
      }

      // Не обновляем state каждый кадр для оптимизации
      if (Math.random() < 0.1) {
          setStats({ reactants: reactantsCount, products: productsCount });
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [temperature, catalyst, concentration]); // При смене концентрации эффект сбрасывается из-за re-mount

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={400} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 flex gap-4 text-sm bg-slate-900/80 p-3 rounded-lg border border-slate-700 backdrop-blur-sm">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-400"></div> Реагенты: <span className="font-bold">{stats.reactants}</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div> Продукты: <span className="font-bold">{stats.products}</span>
           </div>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Flame className="text-orange-500" /> Скорость реакции
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Управляй кинетикой химической реакции. Столкновения молекул приводят к образованию новых веществ, только если хватает энергии активации.
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-orange-400 text-sm">
           Температура системы: {temperature}°C
           <input type="range" min="0" max="100" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="accent-orange-500" />
           <span className="text-xs text-slate-400 font-normal">Увеличивает скорость движения частиц и шанс столкновения.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-rose-400 text-sm">
           Концентрация: {concentration}
           <input type="range" min="10" max="150" step="10" value={concentration} onChange={e => setConcentration(Number(e.target.value))} className="accent-rose-500" />
        </label>

        <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-600">
           <input type="checkbox" id="catalyst" checked={catalyst} onChange={e => setCatalyst(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
           <label htmlFor="catalyst" className="text-emerald-400 font-bold cursor-pointer">Добавить катализатор</label>
        </div>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs text-blue-300 border border-blue-900/40">
           <Info size={16} className="shrink-0 mt-0.5" />
           <div>
             <strong>Закон действующих масс:</strong> Скорость реакции зависит от концентрации реагентов, температуры и наличия катализатора (снижающего барьер энергии активации).
           </div>
        </div>
      </div>
    </div>
  );
}
