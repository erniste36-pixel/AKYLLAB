import { useRef, useEffect, useState } from 'react';
import { Wind, Info } from 'lucide-react';

export default function MathChaos() {
  const canvasRef = useRef(null);
  
  // Custom Controls
  const [angle1, setAngle1] = useState(90); // Degrees
  const [angle2, setAngle2] = useState(90); // Degrees
  const [len1, setLen1] = useState(100); // Length
  const [len2, setLen2] = useState(100); // Length
  
  const [mass1, setMass1] = useState(20);
  const [mass2, setMass2] = useState(20);
  
  const [resetKey, setResetKey] = useState(0); // For forcing reset to initial angles

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Physics constants
    const g = 1; // Gravity
    
    // State
    let a1 = (angle1 * Math.PI) / 180;
    let a2 = (angle2 * Math.PI) / 180;
    let a1_v = 0;
    let a2_v = 0;
    let a1_a = 0;
    let a2_a = 0;
    
    // Trace array
    const trace = [];

    const cx = width / 2;
    const cy = height / 3;

    ctx.clearRect(0, 0, width, height); // Clear once on reset

    const render = () => {
      // Fade out effect to keep trails but let them disappear
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // --- Math for Double Pendulum (Equations of Motion) ---
      let num1 = -g * (2 * mass1 + mass2) * Math.sin(a1);
      let num2 = -mass2 * g * Math.sin(a1 - 2 * a2);
      let num3 = -2 * Math.sin(a1 - a2) * mass2;
      let num4 = a2_v * a2_v * len2 + a1_v * a1_v * len1 * Math.cos(a1 - a2);
      let den = len1 * (2 * mass1 + mass2 - mass2 * Math.cos(2 * a1 - 2 * a2));
      a1_a = (num1 + num2 + num3 * num4) / den;

      num1 = 2 * Math.sin(a1 - a2);
      num2 = (a1_v * a1_v * len1 * (mass1 + mass2));
      num3 = g * (mass1 + mass2) * Math.cos(a1);
      num4 = a2_v * a2_v * len2 * mass2 * Math.cos(a1 - a2);
      den = len2 * (2 * mass1 + mass2 - mass2 * Math.cos(2 * a1 - 2 * a2));
      a2_a = (num1 * (num2 + num3 + num4)) / den;

      // Integration
      a1_v += a1_a;
      a2_v += a2_a;
      a1 += a1_v;
      a2 += a2_v;

      // Friction
      a1_v *= 0.999;
      a2_v *= 0.999;

      // Positions
      let x1 = cx + len1 * Math.sin(a1);
      let y1 = cy + len1 * Math.cos(a1);
      let x2 = x1 + len2 * Math.sin(a2);
      let y2 = y1 + len2 * Math.cos(a2);

      // Trajectory storing
      trace.push({ x: x2, y: y2 });
      if (trace.length > 300) trace.shift();

      // Rendering logic
      
      // 1. Draw Trace
      if (trace.length > 2) {
          ctx.beginPath();
          ctx.moveTo(trace[0].x, trace[0].y);
          for (let i = 1; i < trace.length; i++) {
              ctx.lineTo(trace[i].x, trace[i].y);
          }
          ctx.strokeStyle = '#eab308'; // Chaos Yellow
          ctx.lineWidth = 1.5;
          ctx.stroke();
      }

      // 2. Erase area around rods to avoid smearing
      // Actually because we use 'fade' we just draw on top
      
      // Draw Rod 1
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw Rod 2
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw Masses
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x1, y1, mass1 * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x2, y2, mass2 * 0.5, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [len1, len2, mass1, mass2, resetKey]); // Using resetKey to re-run effect with new initial angles

  // Функция для сброса и запуска заново
  const triggerReset = () => {
     setResetKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-4 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Wind className="text-yellow-400" /> Теория Хаоса 
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Двойной маятник. Динамическая система, чувствительная к начальным условиям: изменение сотой доли градуса ломает всю траекторию.
          </p>
        </div>

        {/* УГЛЫ */}
        <div className="grid grid-cols-2 gap-4">
           <label className="flex flex-col gap-2 font-bold text-slate-300 text-xs">
              Угол 1: {angle1}°
              <input type="range" min="0" max="360" value={angle1} onChange={e => setAngle1(Number(e.target.value))} className="accent-slate-400" />
           </label>
           <label className="flex flex-col gap-2 font-bold text-slate-300 text-xs">
              Угол 2: {angle2}°
              <input type="range" min="0" max="360" value={angle2} onChange={e => setAngle2(Number(e.target.value))} className="accent-slate-400" />
           </label>
        </div>

        {/* ДЛИНА (Distance) */}
        <div className="grid grid-cols-2 gap-4">
           <label className="flex flex-col gap-2 font-bold text-sky-400 text-xs">
              Длина (L1): {len1} px
              <input type="range" min="50" max="200" step="5" value={len1} onChange={e => setLen1(Number(e.target.value))} className="accent-sky-500" />
           </label>
           <label className="flex flex-col gap-2 font-bold text-sky-400 text-xs">
              Длина (L2): {len2} px
              <input type="range" min="50" max="200" step="5" value={len2} onChange={e => setLen2(Number(e.target.value))} className="accent-sky-500" />
           </label>
        </div>

        {/* МАССА */}
        <div className="grid grid-cols-2 gap-4">
           <label className="flex flex-col gap-2 font-bold text-rose-400 text-xs">
              Масса (m1): {mass1} кг
              <input type="range" min="5" max="50" step="1" value={mass1} onChange={e => setMass1(Number(e.target.value))} className="accent-rose-500" />
           </label>
           <label className="flex flex-col gap-2 font-bold text-emerald-400 text-xs">
              Масса (m2): {mass2} кг
              <input type="range" min="5" max="50" step="1" value={mass2} onChange={e => setMass2(Number(e.target.value))} className="accent-emerald-500" />
           </label>
        </div>

        <button 
           onClick={triggerReset}
           className="bg-yellow-600 hover:bg-yellow-500 py-3 rounded-lg font-bold text-white transition-colors mt-2"
        >
           Запустить маятник ↓
        </button>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-yellow-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-yellow-400" />
           <div>
             <strong>Эффект бабочки:</strong> Выставьте углы на 90 и 90. Затем запустите. Сделайте рестарт на (90 и 91) — траектория разойдется кардинально!
           </div>
        </div>
      </div>
    </div>
  );
}
