import { useRef, useEffect, useState } from 'react';

export default function PhysicsAcousticLevitation() {
  const canvasRef = useRef(null);
  
  const [frequency, setFrequency] = useState(40); // kHz
  const [amplitude, setAmplitude] = useState(1.0); // 0 to 1
  
  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Частицы
    const particles = Array.from({length: 12}, (_, i) => ({
       x: width/2 + (Math.random() - 0.5) * 50,
       y: height/2 + (Math.random() - 0.5) * 200,
       vy: 0,
       vx: (Math.random() - 0.5) * 1,
       mass: 0.5 + Math.random() * 0.5
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0,0,width,height);
      
      time += 0.05;

      // Параметры стоячей волны
      // Частота определяет количество узлов
      const waveLength = (150 - frequency); // Пикселей (упрощение)
      const maxWaveAmplitude = 70 * amplitude;
      
      const topTransducerY = 50;
      const botTransducerY = height - 50;

      // Отрисовка звуковых волн
      ctx.beginPath();
      for(let y = topTransducerY; y <= botTransducerY; y += 2) {
         // Формула стоячей волны (очень упрощенно): A * sin(kx) * cos(wt)
         const k = (Math.PI * 2) / waveLength;
         const standWave = Math.sin((y - topTransducerY) * k) * maxWaveAmplitude * Math.cos(time * 3);
         
         const x = width / 2 + standWave;
         if (y === topTransducerY) ctx.moveTo(x, y);
         else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 + amplitude * 0.4})`;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Физика левитации (узлы пучности)
      const k = (Math.PI * 2) / waveLength;
      
      particles.forEach(p => {
         // Сила акустического давления толкает частицы в узлы P=0
         // Производная от sin(k*y) -> cos(k*y). Сила пропорциональна синусу двойного угла.
         const acousticForceY = maxWaveAmplitude * 0.05 * Math.sin(2 * (p.y - topTransducerY) * k);
         const acousticForceX = (width/2 - p.x) * 0.05 * amplitude; // Удержание в центре
         
         // Гравитация тянет вниз
         let gy = 0.5;

         p.vy += (acousticForceY * amplitude) / p.mass;
         p.vy += gy; // гравитация
         p.vx += acousticForceX;

         // Сопротивление воздуха
         p.vy *= 0.92;
         p.vx *= 0.92;

         p.y += p.vy;
         p.x += p.vx;

         // Сталкивание с излучателями / падение
         if (p.y > botTransducerY - 10) { p.y = botTransducerY - 10; p.vy *= -0.5; }
         if (p.y < topTransducerY + 10) { p.y = topTransducerY + 10; p.vy *= -0.5; }

         // Отрисовка частицы (Стирофом)
         ctx.beginPath();
         ctx.arc(p.x, p.y, p.mass * 12, 0, Math.PI*2);
         ctx.fillStyle = '#f8fafc';
         ctx.shadowBlur = 10;
         ctx.shadowColor = '#38bdf8';
         ctx.fill();
         ctx.shadowBlur = 0;
         ctx.strokeStyle = '#94a3b8';
         ctx.lineWidth = 2;
         ctx.stroke();
      });

      // Отрисовка Излучателей (Transducers)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(width/2 - 80, topTransducerY - 40, 160, 40);
      ctx.fillRect(width/2 - 80, botTransducerY, 160, 40);

      // Вибрация излучателей
      const vibro = Math.sin(time * 10) * (3 * amplitude);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(width/2 - 60, topTransducerY - 10 + vibro, 120, 10);
      ctx.fillRect(width/2 - 60, botTransducerY - vibro, 120, 10);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [frequency, amplitude]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={400} height={600} className="w-full h-full object-contain" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-5">
        <h2 className="text-xl font-bold border-b border-slate-600 pb-2">Акустическая левитация</h2>
        <p className="text-sm text-slate-400">
           Ультразвуковые излучатели создают стоячую волну. Когда гравитация уравновешивается акустическим давлением в узлах волны, объекты зависают в воздухе.
        </p>

        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm mt-4">
           Мощность (Амплитуда): {Math.round(amplitude * 100)}%
           <input type="range" min="0" max="1" step="0.05" value={amplitude} onChange={e => setAmplitude(Number(e.target.value))} className="accent-sky-500" />
        </label>

        <label className="flex flex-col gap-2 font-bold text-fuchsia-400 text-sm mt-4">
           Частота ультразвука: {frequency} kHz
           <input type="range" min="20" max="100" step="5" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="accent-fuchsia-500" />
        </label>

        <div className="mt-auto bg-slate-900 p-4 rounded text-xs text-blue-300 border border-blue-900/40">
           <strong>Узлы стоячей волны:</strong> Меняя частоту, вы меняете расстояние между "карманами" левитации. Если выключить мощность, шарики просто упадут.
        </div>
      </div>
    </div>
  );
}
