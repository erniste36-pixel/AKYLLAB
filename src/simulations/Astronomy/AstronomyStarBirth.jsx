import { useRef, useEffect, useState } from 'react';
import { Star, Info } from 'lucide-react';

export default function AstronomyStarBirth() {
  const canvasRef = useRef(null);
  
  // Custom Controls
  const [gravityStr, setGravityStr] = useState(10); // Условная гравитационная постоянная G
  const [gasDensity, setGasDensity] = useState(150); // Кол-во частиц пыли (Масса протозвезды)
  const [running, setRunning] = useState(true);
  
  const [temperature, setTemperature] = useState(10); // K

  // Оставляем частицы вне рендера, чтобы они не сбрасывались при изменении G
  const particlesRef = useRef([]);

  const restartCloud = () => {
      particlesRef.current = [];
      const width = canvasRef.current?.width || 600;
      const height = canvasRef.current?.height || 500;
      
      for(let i=0; i<gasDensity; i++) {
         const angle = Math.random() * Math.PI * 2;
         const dist = Math.random() * (width/2 - 50);
         // Начальное орбитальное вращение (момент импульса туманности)
         const speed = 1 + Math.random();
         particlesRef.current.push({
             x: width/2 + Math.cos(angle) * dist,
             y: height/2 + Math.sin(angle) * dist,
             vx: -Math.sin(angle) * speed,
             vy: Math.cos(angle) * speed,
             mass: Math.random() * 2 + 1
         });
      }
      setTemperature(10);
  };

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    if (particlesRef.current.length === 0) restartCloud();

    const render = () => {
      // Плавное затухание для эффекта свечения/следа
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);

      let pTemp = 10;
      const G = gravityStr * 0.005;

      const particles = particlesRef.current;

      if (running) {
          // Вычисление центра масс туманности (базовая аппроксимация для оптимизации, вместо N^2)
          let cmX = 0, cmY = 0, totalMass = 0;
          
          for(let i=0; i<particles.length; i++) {
              cmX += particles[i].x * particles[i].mass;
              cmY += particles[i].y * particles[i].mass;
              totalMass += particles[i].mass;
          }
          if (totalMass > 0) {
              cmX /= totalMass;
              cmY /= totalMass;
          } else {
              cmX = cx; cmY = cy;
          }

          let coreParticles = 0; // Считаем сколько частиц сбилось в ядро

          for(let i=0; i<particles.length; i++) {
              let p = particles[i];
              
              const dx = cmX - p.x;
              const dy = cmY - p.y;
              const distSq = dx*dx + dy*dy;
              const dist = Math.sqrt(distSq);

              // Гравитация тянет к центру масс
              if (dist > 5) {
                  const force = (G * totalMass * p.mass) / distSq;
                  const ax = (force * dx) / dist;
                  const ay = (force * dy) / dist;
                  
                  p.vx += ax;
                  p.vy += ay;
              } else {
                  coreParticles++;
              }

              // Сила трения о газ (рассеивание энергии)
              p.vx *= 0.99;
              p.vy *= 0.99;

              p.x += p.vx;
              p.y += p.vy;
          }

          // Термодинамика: чем плотнее сжатие (больше частиц в ядре), тем выше температура
          // Температура зажигания ядерного синтеза (условно) - 15 млн градусов
          pTemp = 10 + Math.pow(coreParticles, 2.5);
          if (pTemp > 15000000) pTemp = 15000000 + Math.random()*2000000;
          setTemperature(Math.min(15000000, pTemp)); // cap display smoothly

          // Отрисовка
          const isFusion = pTemp >= 15000000;

          // Свечение ядра
          if (coreParticles > 10) {
              const coreRadius = Math.min(40, coreParticles * 0.5);
              const gradient = ctx.createRadialGradient(cmX, cmY, 1, cmX, cmY, coreRadius * 3);
              if (isFusion) {
                  // Термоядерный синтез пошел!
                  gradient.addColorStop(0, '#ffffff');
                  gradient.addColorStop(0.2, '#fde047');
                  gradient.addColorStop(1, 'transparent');
              } else {
                  // Инфракрасное протозвездное свечение
                  gradient.addColorStop(0, '#ef4444');
                  gradient.addColorStop(1, 'transparent');
              }
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(cmX, cmY, coreRadius * 3, 0, Math.PI*2);
              ctx.fill();
          }

          // Частицы
          for(let i=0; i<particles.length; i++) {
              let p = particles[i];
              ctx.fillStyle = isFusion ? 'rgba(253, 224, 71, 0.6)' : 'rgba(148, 163, 184, 0.4)';
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.mass, 0, Math.PI*2);
              ctx.fill();
          }
      }

      // HUD температуры
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Courier';
      ctx.fillText(`${pTemp > 10000 ? (pTemp/1000000).toFixed(1) + ' млн' : Math.floor(pTemp)} K`, 20, 30);
      
      if (pTemp >= 15000000) {
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 16px Courier';
          ctx.fillText(`ТЕРМОЯДЕРНЫЙ СИНТЕЗ ЗАПУЩЕН!`, 20, 55);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [gravityStr, running]); // gasDensity only updates on restart

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Star className="text-yellow-400" /> Рождение Звезды
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Газопылевая туманность сжимается под собственной гравитацией (Джинсовская нестабильность). Запусти термоядерный синтез!
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-sky-300 text-sm">
           Гравитационная постоянная (G): {gravityStr} ед.
           <input type="range" min="1" max="30" step="1" value={gravityStr} onChange={e => setGravityStr(Number(e.target.value))} className="accent-sky-400" />
           <span className="text-xs text-slate-400 font-normal">Чем сильнее гравитация, тем быстрее газ коллапсирует в сверхплотное ядро протозвезды.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-slate-300 text-sm">
           Масса туманности (кол-во газа): {gasDensity} у.е.
           <input type="range" min="50" max="300" step="10" value={gasDensity} onChange={e => { setGasDensity(Number(e.target.value)); }} className="accent-slate-400" />
           <span className="text-xs text-rose-400 font-normal mt-1">Осторожно! Чтобы изменить плотность, нужно разбросать газ заново (кнопка ниже).</span>
        </label>

        <div className="flex gap-2">
            <button 
               onClick={restartCloud}
               className="flex-1 py-2 rounded-lg font-bold text-white bg-slate-700 hover:bg-slate-600 transition-colors text-sm"
            >
               Взрыв сверхновой (Рестарт)
            </button>
            <button 
               onClick={() => setRunning(!running)}
               className={`flex-1 py-2 rounded-lg font-bold text-white transition-colors text-sm ${running ? 'bg-slate-600' : 'bg-yellow-600'}`}
            >
               {running ? 'Пауза' : 'Сжимать'}
            </button>
        </div>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-yellow-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-yellow-400" />
           <div>
             <strong>15 000 000 Кельвинов:</strong> Минимальная температура в ядре звезды для начала горения водорода и превращения его в гелий!
           </div>
        </div>
      </div>
    </div>
  );
}
