import { useRef, useEffect, useState } from 'react';

export default function LensesRefraction() {
  const canvasRef = useRef(null);
  const [focalLength, setFocalLength] = useState(100);
  const [objectX, setObjectX] = useState(-200);
  const [objectH, setObjectH] = useState(60);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2; // Оптический центр линзы
    const cy = height / 2;

    const render = () => {
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,width,height);

      // Главная оптическая ось
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Линза
      ctx.beginPath();
      ctx.moveTo(cx, cy - 150);
      ctx.lineTo(cx, cy + 150);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Стрелки линзы (выпуклая >0 или вогнутая <0)
      ctx.beginPath();
      if (focalLength > 0) {
        // Выпуклая (собирающая)
        ctx.moveTo(cx - 10, cy - 140); ctx.lineTo(cx, cy - 150); ctx.lineTo(cx + 10, cy - 140);
        ctx.moveTo(cx - 10, cy + 140); ctx.lineTo(cx, cy + 150); ctx.lineTo(cx + 10, cy + 140);
      } else {
        // Вогнутая (рассеивающая)
        ctx.moveTo(cx - 10, cy - 150); ctx.lineTo(cx, cy - 140); ctx.lineTo(cx + 10, cy - 150);
        ctx.moveTo(cx - 10, cy + 150); ctx.lineTo(cx, cy + 140); ctx.lineTo(cx + 10, cy + 150);
      }
      ctx.stroke();

      // Фокусы
      const drawPoint = (x, color, label) => {
         ctx.beginPath();
         ctx.arc(cx + x, cy, 4, 0, Math.PI*2);
         ctx.fillStyle = color;
         ctx.fill();
         ctx.fillText(label, cx + x - 5, cy + 15);
      };
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px monospace';
      drawPoint(focalLength, '#22c55e', 'F');
      drawPoint(-focalLength, '#22c55e', 'F');
      drawPoint(focalLength*2, '#10b981', '2F');
      drawPoint(-focalLength*2, '#10b981', '2F');

      // Предмет
      const realObjX = cx + objectX;
      const realObjY = cy - objectH;
      ctx.beginPath();
      ctx.moveTo(realObjX, cy);
      ctx.lineTo(realObjX, realObjY);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Наконечник предмета
      ctx.beginPath();
      ctx.moveTo(realObjX - 5, realObjY + 5 * Math.sign(objectH));
      ctx.lineTo(realObjX, realObjY);
      ctx.lineTo(realObjX + 5, realObjY + 5 * Math.sign(objectH));
      ctx.stroke();

      // ---------------------------------
      // Формула: 1/F = 1/d0 + 1/di -> di = (F*d0)/(d0 - F)
      // Внимание: мы используем соглашение о знаках. 
      // objectX у нас отрицательный (слева). d0 = -objectX.
      // ---------------------------------
      const d0 = -objectX; 
      let di;
      
      // Обработка сингулярности (предмет в фокусе)
      if (Math.abs(d0 - focalLength) < 0.1) {
         di = 999999;
      } else {
         di = (focalLength * d0) / (d0 - focalLength);
      }

      // Увеличение Г = hi / ho = di / do -> hi = ho * (di/do)
      // В классической оптике y_img / y_obj = di / -do
      const m = -di / (-objectX); // -di/d0
      const imgH = objectH * m;
      const realImgX = cx + di;
      const realImgY = cy - imgH;

      // Луч 1: Параллельно, потом через фокус
      ctx.beginPath();
      ctx.moveTo(realObjX, realObjY);
      ctx.lineTo(cx, realObjY); // до линзы
      // преломление через F (focalLength)
      // уравнение: проходит через (cx, realObjY) и (cx + focalLength, cy)
      const ray1_y = cy + (cy - realObjY)/focalLength * (width - cx);
      if (focalLength > 0) {
        ctx.lineTo(width, ray1_y);
      } else {
        // для рассеивающей линзы луч идет так, будто вышел из мнимого фокуса
        const slope = (realObjY - cy) / (-focalLength);
        ctx.lineTo(width, realObjY + slope * (width - cx));
        // пунктир до фокуса
        ctx.lineTo(cx - focalLength, cy);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.stroke();
      }
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Луч 2: Через оптический центр
      ctx.beginPath();
      ctx.moveTo(realObjX, realObjY);
      const slope2 = (realObjY - cy) / (realObjX - cx);
      ctx.lineTo(width, cy + slope2 * (width - cx));
      ctx.strokeStyle = '#eab308';
      ctx.stroke();

      // Отрисовка Изображения
      if (Math.abs(di) < 10000) {
        ctx.beginPath();
        ctx.moveTo(realImgX, cy);
        ctx.lineTo(realImgX, realImgY);
        ctx.strokeStyle = di > 0 ? '#a855f7' : 'rgba(168, 85, 247, 0.5)'; // мнимое полупрозрачное
        if (di < 0) ctx.setLineDash([5,5]);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#a855f7';
        ctx.fillText(di > 0 ? 'Действ.' : 'Мнимое', realImgX - 25, realImgY - 10 * Math.sign(imgH));
      } else {
         ctx.fillStyle = '#ef4444';
         ctx.fillText('Изображение в бесконечности', cx + 20, 30);
      }
    };
    render();
  }, [focalLength, objectX, objectH]);

  return (
    <div className="flex flex-wrap gap-6 h-full text-slate-100">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={900} height={400} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b border-slate-600 pb-2">Линзы</h2>
        <label className="flex flex-col gap-2">
          Фокус линзы: {focalLength}
          <input 
             type="range" min="-200" max="200" step="10"
             value={focalLength} onChange={e => {
                if (parseInt(e.target.value) !== 0) setFocalLength(parseInt(e.target.value))
             }} 
             className="accent-emerald-500"
          />
        </label>
        <label className="flex flex-col gap-2">
          Позиция предмета: {objectX}
          <input 
             type="range" min="-400" max="-10" step="5"
             value={objectX} onChange={e => setTimeout(()=>setObjectX(parseInt(e.target.value)),0)} 
             className="accent-white"
          />
        </label>
        <label className="flex flex-col gap-2">
          Высота предмета: {objectH}
          <input 
             type="range" min="-150" max="150" step="5"
             value={objectH} onChange={e => setTimeout(()=>setObjectH(parseInt(e.target.value)),0)} 
             className="accent-white"
          />
        </label>
        <div className="mt-4 text-sm text-slate-400 bg-slate-900 p-4 rounded-lg">
          {focalLength > 0 ? "Выпуклая (собирающая) линза." : "Вогнутая (рассеивающая) линза."}
          <br/><br/>Формула тонкой линзы:<br/>1/F = 1/d + 1/f
        </div>
      </div>
    </div>
  );
}
