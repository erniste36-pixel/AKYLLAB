import { useRef, useEffect, useState } from 'react';

export default function PhysicsFusionTokamak() {
  const canvasRef = useRef(null);
  
  const [bField, setBField] = useState(5.0); // В теслах (T)
  const [density, setDensity] = useState(1.0); // 10^20 m^-3
  const [heating, setHeating] = useState(10); // MW

  const [fusionPower, setFusionPower] = useState(0);
  const [status, setStatus] = useState('Ожидание');

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const torusRadius = Math.min(width, height) * 0.35;
    const plasmaRadiusMax = torusRadius * 0.35;

    // Симуляция частиц плазмы
    const numParticles = 150 + Math.floor(density * 100);
    const particles = Array.from({length: numParticles}, () => ({
       angle: Math.random() * Math.PI * 2,
       dist: Math.random() * plasmaRadiusMax * 0.5,
       speed: Math.random() * 0.05 + 0.01,
       phase: Math.random() * Math.PI * 2
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0,0,width,height);
      time += 0.05;

      // Физика (Лоусоновский критерий и удержание)
      const temperature = heating * 1.5; // Условная температура в кэВ
      const confinementTime = Math.pow(bField, 1.5) / (temperature + 0.1); 
      // Критерий Лоусона: n * T * tau > 3 (условно)
      const lawson = (density * temperature * confinementTime) / 10;
      
      let pRadius = plasmaRadiusMax * (20 / (bField * bField + 1)); // Чем слабее поле, тем шире плазма
      if (pRadius > plasmaRadiusMax * 1.2) pRadius = plasmaRadiusMax * 1.2;

      let currentStatus = 'Нагрев плазмы...';
      let fusionPwr = 0;
      
      if (pRadius >= plasmaRadiusMax) {
          currentStatus = 'Срыв плазмы! Слишком слабое магнитное поле.';
      } else if (lawson > 5) {
          currentStatus = 'ТЕРМОЯДЕРНЫЙ СИНТЕЗ (Зажигание)!';
          fusionPwr = Math.pow(lawson, 2) * 10;
      } else {
          currentStatus = 'Стабильное удержание, недостаточная температура/плотность.';
      }

      setFusionPower(fusionPwr);
      setStatus(currentStatus);

      // Отрисовка Токамака (Камеры)
      ctx.beginPath();
      ctx.arc(cx, cy, torusRadius + plasmaRadiusMax, 0, Math.PI*2);
      ctx.arc(cx, cy, torusRadius - plasmaRadiusMax, 0, Math.PI*2, true);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Магнитные катушки
      for(let i=0; i<16; i++) {
         const a = (Math.PI*2/16)*i;
         const x1 = cx + Math.cos(a)*(torusRadius - plasmaRadiusMax - 10);
         const y1 = cy + Math.sin(a)*(torusRadius - plasmaRadiusMax - 10);
         const x2 = cx + Math.cos(a)*(torusRadius + plasmaRadiusMax + 10);
         const y2 = cy + Math.sin(a)*(torusRadius + plasmaRadiusMax + 10);
         
         ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
         ctx.strokeStyle = '#3b82f6';
         ctx.lineWidth = 10;
         ctx.globalAlpha = bField / 10 + 0.2; // Яркость катушек зависит от поля
         ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Отрисовка плазмы
      const temperatureColor = lawson > 5 ? '#f43f5e' : (temperature > 10 ? '#8b5cf6' : '#0ea5e9');
      
      particles.forEach((p, idx) => {
          // Если срыв плазмы - частицы разлетаются
          if (currentStatus.includes('Срыв')) {
             p.dist += (Math.random() * 2);
             if (p.dist > plasmaRadiusMax * 1.5) p.dist = 0;
          } else {
             // Возвращаем в русло
             if (p.dist > pRadius) p.dist *= 0.95;
             p.dist += Math.sin(time + p.phase) * (temperature/20);
          }
          
          p.angle += p.speed * (temperature/10 + 0.1);
          
          const px = cx + Math.cos(p.angle) * (torusRadius + p.dist * Math.cos(p.angle * 10));
          const py = cy + Math.sin(p.angle) * (torusRadius + p.dist * Math.cos(p.angle * 10));

          ctx.beginPath();
          ctx.arc(px, py, lawson > 5 ? 3 : 2, 0, Math.PI*2);
          ctx.fillStyle = temperatureColor;
          ctx.fill();
          
          if(lawson > 5 && idx % 3 === 0) {
             ctx.shadowBlur = 15;
             ctx.shadowColor = '#fbbf24';
             ctx.fill();
             ctx.shadowBlur = 0;
          }
      });

      // Свечение термояда
      if (lawson > 5) {
         ctx.beginPath();
         ctx.arc(cx, cy, torusRadius, 0, Math.PI*2);
         ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
         ctx.lineWidth = pRadius * 1.5;
         ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [bField, density, heating]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={800} height={600} className="w-full h-full object-contain" />
        
        <div className="absolute top-4 left-4 bg-slate-900/80 p-4 rounded-lg border border-slate-700 max-w-sm">
           <h3 className="font-bold text-sky-400 mb-2">Статус Реактора:</h3>
           <p className={`font-bold ${status.includes('Срыв') ? 'text-red-500' : (status.includes('ТЕРМОЯДЕРНЫЙ') ? 'text-amber-400 animate-pulse' : 'text-emerald-400')}`}>
              {status}
           </p>
           {fusionPower > 0 && (
             <p className="font-mono text-2xl text-amber-300 mt-2">
                Выход: {Math.round(fusionPower)} MW
             </p>
           )}
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b border-slate-600 pb-2">Токамак (Термоядерный Синтез)</h2>
        
        <p className="text-sm text-slate-400">
           Удерживайте сверхгорячую плазму магнитным полем. Чтобы зажечь синтез, увеличьте нагрев и плотность, но не забудьте усилить магнитное поле для удержания!
        </p>

        <label className="flex flex-col gap-2 font-bold text-blue-400">
           🧲 Магнитное поле (B): {bField.toFixed(1)} Тл
           <input type="range" min="1.0" max="15.0" step="0.5" value={bField} onChange={e => setBField(Number(e.target.value))} className="accent-blue-500" />
        </label>

        <label className="flex flex-col gap-2 font-bold text-emerald-400">
           ⚛️ Плотность плазмы: {density.toFixed(1)} ×10²⁰
           <input type="range" min="0.1" max="5.0" step="0.1" value={density} onChange={e => setDensity(Number(e.target.value))} className="accent-emerald-500" />
        </label>

        <label className="flex flex-col gap-2 font-bold text-red-400">
           🔥 Мощность нагрева: {heating} МВт
           <input type="range" min="1" max="50" step="1" value={heating} onChange={e => setHeating(Number(e.target.value))} className="accent-red-500" />
        </label>

        <div className="mt-auto bg-slate-900 p-4 rounded text-xs text-slate-300 border border-amber-900/30">
           <strong className="text-amber-500">Критерий Лоусона:</strong> Для самоподдерживающейся реакции (Зажигания) произведение плотности, температуры и времени удержания должно превысить критическое значение.
        </div>
      </div>
    </div>
  );
}
