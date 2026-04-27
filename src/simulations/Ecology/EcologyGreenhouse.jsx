import { useRef, useEffect, useState } from 'react';
import { Globe, Info, Cloud } from 'lucide-react';

export default function EcologyGreenhouse() {
  const canvasRef = useRef(null);
  
  // Custom functions: Angles/Degrees/Distances matching user's prompt
  const [co2, setCo2] = useState(400); // ppm
  const [albedo, setAlbedo] = useState(0.3); // Reflectance 0 to 1
  const [solarAngle, setSolarAngle] = useState(90); // Angle of incident light (degrees)
  
  const [globalTemp, setGlobalTemp] = useState(15.0); // °C

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Photons array
    const photons = [];
    // Cloud/Gas particles based on CO2
    const gases = Array.from({length: Math.min(200, co2 / 5)}, () => ({
        x: Math.random() * width,
        y: 100 + Math.random() * 150, // Atmosphere layer
        speed: Math.random() * 0.5 + 0.1
    }));

    let heatAccumulated = 15.0;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.05;

      // 1. Отрисовка Земли и Космоса
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#020617'); // Space
      skyGrad.addColorStop(0.5, '#0ea5e9'); // Sky
      skyGrad.addColorStop(1, '#e0f2fe'); // Horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Земля (Альбедо определяет цвет поверхности - лед или земля)
      ctx.fillStyle = albedo > 0.5 ? '#f8fafc' : '#4ade80'; // White ice or green earth
      ctx.beginPath();
      ctx.ellipse(width/2, height + 100, width, 180, 0, 0, Math.PI * 2);
      ctx.fill();

      // Моделирование нагрева
      // Входящая энергия зависит от угла солнца (cos(angle))
      const radians = (solarAngle - 90) * (Math.PI / 180);
      const incomingEnergy = Math.cos(radians) * 0.5;

      // Удержание тепла зависит от CO2 (насколько сильно блокируется обратное инфракрасное излучение)
      const greenhouseEffect = co2 / 1000; 

      heatAccumulated += incomingEnergy * (1 - albedo) * 0.1; // Земля поглощает
      heatAccumulated -= (0.05 - greenhouseEffect * 0.02); // Земля остывает (CO2 мешает остыть)
      
      // Стабилизация температур
      if (heatAccumulated > 45) heatAccumulated += (45 - heatAccumulated) * 0.1;
      if (heatAccumulated < -50) heatAccumulated += (-50 - heatAccumulated) * 0.1;

      if (time % 10 < 0.1) setGlobalTemp(heatAccumulated);

      // 2. Частицы CO2 в атмосфере
      ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
      gases.forEach((g) => {
         g.x += g.speed;
         if (g.x > width + 10) g.x = -10;
         ctx.beginPath();
         ctx.arc(g.x, g.y + Math.sin(time + g.x)*10, 4, 0, Math.PI*2);
         ctx.fill();
      });

      // 3. Солнечные фотоны (Желтые - Высокая энергия, коротковолновые. Проходят сквозь CO2)
      if (Math.random() < 0.3) {
          const startX = width/2 - Math.tan(radians) * height; // Расчет старта по углу
          photons.push({
              x: startX + (Math.random() - 0.5) * 400,
              y: 0,
              type: 'UV', // Ультрафиолет/Видимый свет
              vx: Math.sin(radians) * 5,
              vy: Math.cos(radians) * 5
          });
      }

      for (let i = photons.length - 1; i >= 0; i--) {
          let p = photons[i];
          p.x += p.vx; p.y += p.vy;

          if (p.type === 'UV') {
             // Падает на Землю
             ctx.fillStyle = '#fde047'; // Желтый
             
             // Достиг поверхности
             if (p.y >= height - 80) {
                 if (Math.random() < albedo) {
                     // Отражение обратно в космос без потери энергии (в виде UV)
                     p.vy *= -1;
                 } else {
                     // Поглощение Землей и излучение Инфракрасного фотона
                     p.type = 'IR';
                     p.vy = -2 - Math.random();
                     p.vx = (Math.random() - 0.5) * 2;
                 }
             }
          } else if (p.type === 'IR') {
             // Инфракрасный идет вверх
             ctx.fillStyle = '#ef4444'; // Красный (тепло)
             
             // Пересечение атмосферы (y = 100 to 250)
             if (p.y > 100 && p.y < 250) {
                 // Шанс поглотиться и полететь обратно вниз пропорционален CO2!
                 if (Math.random() < (co2 / 1200)) {
                     p.vy *= -1; // Возвращается на землю!
                     ctx.shadowBlur = 10;
                     ctx.shadowColor = '#ef4444';
                 }
             }

             // Если ИК фотон ударяется об землю снова
             if (p.vy > 0 && p.y >= height - 80) {
                 p.vy *= -1; // Снова отскакивает
             }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.type === 'IR' ? 3 : 2, 0, Math.PI*2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Удаление улетевших
          if (p.y < -10 || p.x < -100 || p.x > width + 100) {
              photons.splice(i, 1);
          }
      }

      // Текст температуры
      ctx.fillStyle = heatAccumulated > 30 ? '#ef4444' : heatAccumulated > 10 ? '#fde047' : '#38bdf8';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${heatAccumulated.toFixed(1)}°C`, width - 20, 50);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [co2, albedo, solarAngle]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Cloud className="text-emerald-400" /> Парниковый эффект
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Изучи, как изменение углов падения лучей, альбедо (отражательная способность) и CO2 влияют на тепловой баланс планеты.
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-amber-400 text-sm">
           Угол падения лучей: {solarAngle}°
           <input type="range" min="0" max="180" step="1" value={solarAngle} onChange={e => setSolarAngle(Number(e.target.value))} className="accent-amber-500" />
           <span className="text-xs text-slate-400 font-normal">90° - зенит (экватор), 10° - скользящие лучи (полюса).</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-slate-300 text-sm">
           Поверхностное альбедо: {(albedo * 100).toFixed(0)}%
           <input type="range" min="0" max="0.9" step="0.05" value={albedo} onChange={e => setAlbedo(Number(e.target.value))} className="accent-slate-400" />
           <span className="text-xs text-slate-400 font-normal">0% - тёмный океан (поглощает свет). 90% - чистый лёд (отражает обратно в виде УФ).</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-rose-400 text-sm">
           Концентрация CO₂ (Парниковый газ): {co2} ppm
           <input type="range" min="100" max="1000" step="10" value={co2} onChange={e => setCo2(Number(e.target.value))} className="accent-rose-500" />
           <span className="text-xs text-slate-400 font-normal">Коротковолновой УФ свет проходит сквозь CO₂, но длинноволновое ИК-тепло отскакивает обратно на Землю!</span>
        </label>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-emerald-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-emerald-400" />
           <div>
             <strong>Обратная связь льда:</strong> Если повысить CO2, планета нагреется и лёд растает (снижение альбедо). Океан будет поглощать еще больше тепла!
           </div>
        </div>
      </div>
    </div>
  );
}
