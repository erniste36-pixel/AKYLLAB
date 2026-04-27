import { useRef, useEffect, useState } from 'react';

export default function MathUnitCircle() {
  const canvasRef = useRef(null);
  const [angleDeg, setAngleDeg] = useState(45); // градусы
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let animationId;
    if (isPlaying) {
      const animate = () => {
        setAngleDeg(prev => (prev + 1) % 360);
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const cx = 200; // Центр круга
    const cy = height / 2;
    const radius = 120;
    
    // Очистка
    ctx.clearRect(0,0,width,height);
    
    // Рисуем оси для круга
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy); ctx.lineTo(cx + 150, cy); // X ось
    ctx.moveTo(cx, cy - 150); ctx.lineTo(cx, cy + 150); // Y ось
    ctx.stroke();

    // Единичный круг
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    const rad = (angleDeg * Math.PI) / 180;
    const px = cx + Math.cos(rad) * radius;
    const py = cy - Math.sin(rad) * radius; // Y инвертирован в canvas

    // Вектор радиуса
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Проекция Sin (красная)
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Проекция Cos (синяя)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Точка
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // ============================================
    // ГРАФИК
    // ============================================
    const startGraphX = 400;
    const graphWidth = width - startGraphX - 20;
    
    // Оси графика
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startGraphX, cy); ctx.lineTo(width, cy); // X 
    ctx.moveTo(startGraphX, cy - 150); ctx.lineTo(startGraphX, cy + 150); // Y
    ctx.stroke();

    // Отрисовка синуса
    ctx.beginPath();
    for(let a=0; a<=360; a++) {
      const gRad = (a * Math.PI) / 180;
      const x = startGraphX + (a / 360) * graphWidth;
      const y = cy - Math.sin(gRad) * radius;
      if (a===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Отрисовка косинуса
    ctx.beginPath();
    for(let a=0; a<=360; a++) {
      const gRad = (a * Math.PI) / 180;
      const x = startGraphX + (a / 360) * graphWidth;
      const y = cy - Math.cos(gRad) * radius;
      if (a===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.stroke();

    // Текущая точка на графиках
    const cxGraph = startGraphX + (angleDeg / 360) * graphWidth;
    
    // Точка синуса
    ctx.beginPath();
    ctx.arc(cxGraph, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // Линия пунктиром от круга до графика (для синуса)
    ctx.beginPath();
    ctx.setLineDash([5,5]);
    ctx.moveTo(px, py);
    ctx.lineTo(cxGraph, py);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Точка косинуса
    ctx.beginPath();
    ctx.arc(cxGraph, cy - Math.cos(rad) * radius, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();

    // Текстовая информация
    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText(`Угол: ${Math.round(angleDeg)}°`, 20, 30);
    ctx.fillText(`Sin: ${Math.sin(rad).toFixed(2)}`, 20, 60);
    ctx.fillText(`Cos: ${Math.cos(rad).toFixed(2)}`, 20, 90);

  }, [angleDeg]);

  return (
    <div className="flex flex-wrap gap-6 h-full text-slate-100">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={900} height={400} className="w-full h-full object-contain" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b border-slate-600 pb-2">Тригонометрия</h2>
        <label className="flex flex-col gap-2">
          Угол накрутки: {angleDeg}°
          <input 
             type="range" min="0" max="360" 
             value={angleDeg} onChange={e => setAngleDeg(parseInt(e.target.value))} 
             className="accent-amber-500"
          />
        </label>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`py-2 px-4 rounded-lg font-bold transition-colors ${isPlaying ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'}`}
        >
          {isPlaying ? 'Остановить анимацию' : 'Запустить прокрутку'}
        </button>
        <div className="mt-4 text-sm text-slate-400">
          <p className="mb-2"><span className="text-red-500 font-bold">Красный</span> вектор (Y) представляет Синус.</p>
          <p><span className="text-blue-500 font-bold">Синий</span> вектор (X) представляет Косинус.</p>
        </div>
      </div>
    </div>
  );
}
