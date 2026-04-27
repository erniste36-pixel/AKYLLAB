import { useRef, useEffect, useState } from 'react';
import { Globe, Info } from 'lucide-react';

export default function AstronomyLensing() {
  const canvasRef = useRef(null);
  
  // Custom Controls
  const [bhMass, setBhMass] = useState(20); // Радиус Шварцшильда (сила искажения)
  const [galDx, setGalDx] = useState(30); // Положение фоновой галактики по Х
  const [galDy, setGalDy] = useState(20); // Положение фоновой галактики по Y

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Create an offscreen canvas containing a perfect grid to represent space-time
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = width;
    gridCanvas.height = height;
    const gctx = gridCanvas.getContext('2d');

    const drawBackgroundGalaxy = (x, y) => {
        gctx.fillStyle = '#020617';
        gctx.fillRect(0, 0, width, height);

        // Grid (Метрика пространства-времени)
        gctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'; // Sky 400
        gctx.lineWidth = 1;
        for(let i=0; i<width; i+=40) {
            gctx.beginPath(); gctx.moveTo(i, 0); gctx.lineTo(i, height); gctx.stroke();
        }
        for(let i=0; i<height; i+=40) {
            gctx.beginPath(); gctx.moveTo(0, i); gctx.lineTo(width, i); gctx.stroke();
        }

        // Фоновая "Галактика" (Диск + Звезды)
        const galX = width/2 + x;
        const galY = height/2 + y;
        
        gctx.filter = 'blur(2px)';
        const grad = gctx.createRadialGradient(galX, galY, 5, galX, galY, 60);
        grad.addColorStop(0, '#ffffff'); // Center
        grad.addColorStop(0.3, '#3b82f6'); // Blue spiral arms
        grad.addColorStop(1, 'transparent');
        
        gctx.fillStyle = grad;
        gctx.beginPath();
        gctx.ellipse(galX, galY, 60, 20, Math.PI/6, 0, Math.PI*2);
        gctx.fill();
        gctx.filter = 'none';

        // Звездочки, чтобы искажение смотрелось круто
        for(let i=0; i<200; i++) {
           gctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
           gctx.fillRect(Math.random()*width, Math.random()*height, 1, 1);
        }
    };

    let time = 0;

    const render = () => {
      // Обновляем фон с Галактикой
      drawBackgroundGalaxy(galDx + Math.sin(time*0.02)*20, galDy + Math.cos(time*0.015)*10);
      time += 1;

      // Extract raw pixels to distort them
      const imgData = gctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      
      const newImgData = ctx.createImageData(width, height);
      const newData = newImgData.data;

      const cx = width / 2;
      const cy = height / 2;
      const rS = bhMass * 3; // Упрощенный Радиус Шварцшильда (для пикселей масштаба)
      const rS_sq = rS * rS;

      // Применение формулы линзирования Эйнштейна (Ray Tracing deflection) к каждому пикселю
      // Это тяжелая операция, мы делаем ее упрощенно! Мы искажаем координату выборки текстуры.
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const rSq = dx*dx + dy*dy;
          
          let srcX = x;
          let srcY = y;
          
          if (rSq > rS_sq) {
              // Искажение света: Угол отклонения ~ R_schwarzschild / r
              // Мы сдвигаем откуда этот пиксель берет свой свет.
              // Приближаясь к rS, свет делает оборот (расходимость), мы используем функцию 1/r
              const r = Math.sqrt(rSq);
              const deflectionAmount = rS_sq / r; // Упрощенно для визуала

              // Вектор от центра
              const nx = dx / r;
              const ny = dy / r;

              // Оригинальный луч света берется "выдавленным" наружу (линза собирает свет с краев)
              srcX = x + nx * deflectionAmount;
              srcY = y + ny * deflectionAmount;
          }

          // Bound checking and integer clamping
          let sx = Math.floor(srcX);
          let sy = Math.floor(srcY);
          
          // Черная Дыра (внутри горизонта событий свет не берем)
          let pixelPos = (y * width + x) * 4;
          
          if (rSq <= rS_sq) {
              newData[pixelPos] = 0;
              newData[pixelPos+1] = 0;
              newData[pixelPos+2] = 0;
              newData[pixelPos+3] = 255;
          } else if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
              let srcPos = (sy * width + sx) * 4;
              newData[pixelPos] = data[srcPos];
              newData[pixelPos+1] = data[srcPos+1];
              newData[pixelPos+2] = data[srcPos+2];
              newData[pixelPos+3] = 255;
          } else {
              // Если луч ушел за края галактики
              newData[pixelPos] = 2; newData[pixelPos+1] = 6; newData[pixelPos+2] = 23; newData[pixelPos+3] = 255; 
          }
        }
      }

      ctx.putImageData(newImgData, 0, 0);

      // Отрисовка фотонного кольца и Аккреционного диска (Поверх линзы, для эстетики!)
      // Аккреционный диск
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.05);
      const gradient = ctx.createRadialGradient(0, 0, rS, 0, 0, rS * 2.5);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.3, 'rgba(251, 146, 60, 0.5)'); // Orange
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, rS * 2.5, rS * 1.2, 0, 0, Math.PI * 2); // Сплющенный диск
      // Отрезаем черпную дыру (чтобы диск рисовал только "Кольцо" вокруг)
      ctx.globalCompositeOperation = 'lighten';
      ctx.fill();
      ctx.restore();
      
      // Фотонная сфера (очень яркая окружность вокруг горизонта)
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.5 + Math.sin(time*0.1)*0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, rS + 2, 0, Math.PI*2);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [bhMass, galDx, galDy]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
         {/* Canvas with Real-Time Raytracing effect (pixels are manipulated directly) */}
        <canvas ref={canvasRef} width={400} height={400} className="w-full h-full object-contain" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Globe className="text-orange-500" /> Гравитационная линза
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Лучи света от фоновой галактики искривляются колоссальной массой Чёрной Дыры. Это эффект из Общей Теории Относительности Эйнштейна!
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-red-400 text-sm">
           Масса Черной Дыры (Радиус Шварцшильда): {bhMass} у.е.
           <input type="range" min="5" max="40" step="1" value={bhMass} onChange={e => setBhMass(Number(e.target.value))} className="accent-red-500" />
           <span className="text-xs text-slate-400 font-normal">Чем тяжелее сингулярность, тем сильнее искажается ткань пространства-времени.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
           Дистанция фоновой галактики (Ось X): {galDx} px
           <input type="range" min="-150" max="150" step="5" value={galDx} onChange={e => setGalDx(Number(e.target.value))} className="accent-sky-500" />
        </label>

         <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
           Дистанция фоновой галактики (Ось Y): {galDy} px
           <input type="range" min="-150" max="150" step="5" value={galDy} onChange={e => setGalDy(Number(e.target.value))} className="accent-sky-500" />
           <span className="text-xs text-slate-400 font-normal mt-1">Помести галактику ТОЧНО за Черной дырой (Х=0, Y=0), чтобы увидеть идеальное <strong>Кольцо Эйнштейна</strong>.</span>
        </label>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-orange-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-orange-400" />
           <div>
             <strong>Кольцо Эйнштейна:</strong> Если источник света, тяжелая линза (дыра) и наблюдатель находятся на одной идеальной прямой, изображение размазывается в кольцо!
           </div>
        </div>
      </div>
    </div>
  );
}
