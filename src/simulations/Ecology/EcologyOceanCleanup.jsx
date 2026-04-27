import { useRef, useEffect, useState } from 'react';
import { Droplets, Info } from 'lucide-react';

export default function EcologyOceanCleanup() {
  const canvasRef = useRef(null);
  
  // Custom functions: Angles/Degrees/Distances matching user's prompt
  const [netAngle, setNetAngle] = useState(45); // Угол раскрытия сети в градусах (0 - 90)
  const [netWidth, setNetWidth] = useState(150); // Ширина сети (Distance)
  const [shipSpeed, setShipSpeed] = useState(2.0); // Скорость судна
  
  const [stats, setStats] = useState({ collected: 0, escaped: 0 });

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Пластик: {x, y, speedY, caught}
    const plastics = [];
    let collectedCount = 0;
    let escapedCount = 0;

    const shipY = 100;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.05;

      // 1. Океан с волнами (движение навстречу судну из-за его скорости)
      const waterGrad = ctx.createLinearGradient(0, 0, 0, height);
      waterGrad.addColorStop(0, '#0284c7');
      waterGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, width, height);

      // Генерация пластика (течение навстречу)
      if (Math.random() < shipSpeed * 0.1 + 0.05) {
          plastics.push({
              x: Math.random() * width,
              y: height + 20, // Появляются внизу
              radius: Math.random() * 3 + 2,
              caught: false,
              escaped: false
          });
      }

      const shipX = width / 2 + Math.sin(time * 0.5) * 50;

      // Расчет геометрии сети по заданным пользователем углам и дистанциям
      // Net Width (дистанция между краями)
      // Net Angle (угол раскрытия от центральной оси судна)
      const radians = (netAngle * Math.PI) / 180;
      // Длина 'рук' сети вычисляется из ширины и угла: L * sin(angle) = width/2
      const netLength = Math.max(20, (netWidth / 2) / Math.max(0.1, Math.sin(radians)));
      
      const leftArmX = shipX - Math.sin(radians) * netLength;
      const leftArmY = shipY + Math.cos(radians) * netLength;
      
      const rightArmX = shipX + Math.sin(radians) * netLength;
      const rightArmY = shipY + Math.cos(radians) * netLength;

      // 2. Обновление пластика
      const effectiveShipSpeed = shipSpeed * 2 + 1; // Базовое течение
      
      for (let i = plastics.length - 1; i >= 0; i--) {
          let p = plastics[i];
          
          if (!p.caught && !p.escaped) {
              p.y -= effectiveShipSpeed;
              p.x += Math.sin(time + p.y*0.01) * 0.5; // Покачивание на волнах

              // Проверка попадания в створ сети
              if (p.y < leftArmY && p.y > shipY - 10) {
                  // Примитивная проверка по ширине (упрощенная математика ловушки)
                  const trapWidthAtY = (netWidth / 2) * ((p.y - shipY) / (leftArmY - shipY));
                  
                  if (p.x > shipX - trapWidthAtY - 10 && p.x < shipX + trapWidthAtY + 10) {
                      // Процент удержания зависит от угла! Слишком тупой угол (близко к 90) - мусор вываливается обратно при быстрой скорости
                      const escapeChance = (netAngle > 70 && shipSpeed > 3) ? 0.3 : 0;
                      if (Math.random() > escapeChance) {
                          p.caught = true;
                          collectedCount++;
                      }
                  }
              }

              // Прошел мимо (escaped)
              if (p.y < 0) {
                  p.escaped = true;
                  escapedCount++;
                  plastics.splice(i, 1);
              }
          }

          if (p.caught) {
              // Мусор ползет в центр сборника (к кораблю)
              p.y += (shipY - p.y) * 0.1;
              p.x += (shipX - p.x) * 0.1;
              
              if (Math.abs(p.y - shipY) < 5) {
                  plastics.splice(i, 1);
              }
          }

          // Отрисовка
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          // Цвета: белый, красный кап, синяя крышка
          ctx.fillStyle = i%3 === 0 ? '#ef4444' : i%2===0 ? '#38bdf8' : '#e2e8f0';
          ctx.fill();
      }

      if (time % 10 < 0.1) setStats({ collected: collectedCount, escaped: escapedCount });

      // 3. Отрисовка Корабля и Сети
      // Сеть (линии)
      ctx.strokeStyle = `rgba(255, 255, 255, ${netAngle > 80 ? '0.2' : '0.6'})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Левая рука
      ctx.moveTo(shipX, shipY); ctx.lineTo(leftArmX, leftArmY);
      // Правая рука
      ctx.moveTo(shipX, shipY); ctx.lineTo(rightArmX, rightArmY);
      // Перемычки (сетка)
      for(let step = 0.2; step <= 1; step += 0.2) {
          const lx = shipX + (leftArmX - shipX)*step;
          const ly = shipY + (leftArmY - shipY)*step;
          const rx = shipX + (rightArmX - shipX)*step;
          const ry = shipY + (rightArmY - shipY)*step;
          ctx.moveTo(lx, ly); ctx.lineTo(rx, ry);
      }
      ctx.stroke();

      // Само судно
      ctx.fillStyle = '#64748b'; // серый металл
      ctx.beginPath();
      ctx.ellipse(shipX, shipY - 20, 20, 40, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1'; // кабина
      ctx.fillRect(shipX - 10, shipY - 30, 20, 15);

      // Буруны от судна
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(shipX - 15, shipY - 50, 5 + Math.random()*5, 0, Math.PI*2);
      ctx.arc(shipX + 15, shipY - 50, 5 + Math.random()*5, 0, Math.PI*2);
      ctx.fill();

      // Отрисовка метрик на холсте
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Courier';
      ctx.fillText(`Собрано: ${stats.collected}`, 20, 30);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`Упущено: ${stats.escaped}`, 20, 55);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [netAngle, netWidth, shipSpeed, stats.collected, stats.escaped]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Droplets className="text-sky-400" /> Очистка Океана (Динамика)
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Проектирование систем по сбору тихоокеанского мусорного пятна. Изменяйте углы раскрытия и геометрию!
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
           Угол раскрытия сети: {netAngle}° (Градусы)
           <input type="range" min="10" max="85" step="1" value={netAngle} onChange={e => setNetAngle(Number(e.target.value))} className="accent-sky-500" />
           <span className="text-xs text-slate-400 font-normal">При углах &gt; 70° сеть становится слишком тупой, гидродинамическое давление ВЫТАЛКИВАЕТ мусор обратно.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-indigo-300 text-sm">
           Пролет (Width distance): {netWidth} м
           <input type="range" min="50" max="300" step="10" value={netWidth} onChange={e => setNetWidth(Number(e.target.value))} className="accent-indigo-400" />
           <span className="text-xs text-slate-400 font-normal">Дистанция захвата. Чем шире, тем больше пластика попадает в створ.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-rose-400 text-sm">
           Скорость буксира: {shipSpeed.toFixed(1)} узлов
           <input type="range" min="0" max="10" step="0.5" value={shipSpeed} onChange={e => setShipSpeed(Number(e.target.value))} className="accent-rose-500" />
           <span className="text-xs text-slate-400 font-normal">На высокой скорости (при тупых углах) пластик "отскакивает" из-за турбулентности воды в центре сети.</span>
        </label>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-sky-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-sky-400" />
           <div>
             <strong>Инженерный парадокс:</strong> U-образные сети The Ocean Cleanup используют физику потоков. Угол должен быть острым, иначе вода и мусор уходят под сеть!
           </div>
        </div>
      </div>
    </div>
  );
}
