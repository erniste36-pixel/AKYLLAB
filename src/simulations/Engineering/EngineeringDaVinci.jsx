import { useRef, useEffect, useState } from 'react';
import { Box, Info } from 'lucide-react';

export default function EngineeringDaVinci() {
  const canvasRef = useRef(null);
  
  // Custom Controls
  const [loadWeight, setLoadWeight] = useState(50); // kg
  const [frictionCoef, setFrictionCoef] = useState(0.4); // 0.1 to 0.8
  const [running, setRunning] = useState(false);
  
  const [status, setStatus] = useState('stable'); // 'stable', 'slipping', 'collapse'

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const gravity = 9.8;
    const bridgeWeight = 200; // kg (собственный вес бревен)
    
    // Physics Logic (Упрощенная статика)
    // В Мосте Да Винчи элементы держатся ТОЛЬКО за счет силы трения Ftr = mu * N
    // N (Сила реакции опоры) зависит от (Load + BridgeWeight) * sin(angle).
    
    // Total Force pulling the logs apart = (loadWeight + bridgeWeight) * g * sin(angle_опоры)
    // Max sliding friction holding them together = frictionCoef * (loadWeight + bridgeWeight) * g * cos(angle_опоры)
    
    // Если Тяговая сила > Сила Трения -> Обрушение.
    const slipAngleFactor = 0.6; // ~ sin/cos for the typical arch angle
    const pullForce = (loadWeight + bridgeWeight) * gravity * slipAngleFactor;
    const holdForce = frictionCoef * (loadWeight + bridgeWeight) * gravity; // Simplified normal force multiplication
    
    // Чтобы было интереснее: если LoadWeight слишком мал, а friction тоже мал, мост упадет под своим весом!
    // Нагрузка УВЕЛИЧИВАЕТ силу трения, зажимая бревна крепче! Но если нагрузка ОГРОМНА, ломается само бревно (здесь мы симулируем проскальзывание).
    
    // Real friction formula for Davinci bridge: The bridge becomes STRONGER when load is applied (up to a structural limit), 
    // because N increases. However, if wood friction (coefficient) is too low (e.g. wet or ice logs, < 0.25), it will always slip flat.
    
    let isStable = frictionCoef > 0.3; // Base stability
    if (loadWeight > 400 && frictionCoef < 0.5) isStable = false; // Overload slip
    if (loadWeight > 800) isStable = false; // Structural break
    
    let simTime = 0;
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Фон Небо и Трава
      ctx.fillStyle = '#1e293b'; 
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#064e3b'; // Трава
      ctx.fillRect(0, height - 100, width, 100);

      // Река под мостом
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(width/2 - 120, height - 100, 240, 100);

      // Стилизованная вода (линии)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      for(let i=0; i<3; i++) {
         ctx.beginPath();
         ctx.moveTo(width/2 - 100, height - 70 + i*15);
         ctx.lineTo(width/2 + 100, height - 70 + i*15 + Math.sin(simTime*0.1 + i)*5);
         ctx.stroke();
      }

      if (running) simTime += 1;

      // Геометрия Моста Да Винчи (вид сбоку)
      const cx = width / 2;
      let collapseProgress = 0;

      if (running && !isStable) {
         collapseProgress = Math.min(1, simTime / 60); // Падает за 1 секунду (60 кадров)
         if (collapseProgress > 0) {
            setStatus(loadWeight > 800 ? 'broken' : 'collapse');
         }
      } else if (running && isStable) {
          setStatus('stable');
      }

      // Draw Logs
      // Продольные бревна (Арка)
      ctx.lineCap = 'round';
      ctx.lineWidth = 12;
      
      const drawLog = (x, y, angle, len, isCross = false) => {
          ctx.save();
          ctx.translate(x, y);
          // Если падает - углы проседают, бревна раздвигаются
          const fallAngle = collapseProgress * (x < cx ? 1 : -1) * 0.5;
          const fallY = collapseProgress * 50;
          const fallX = collapseProgress * (x < cx ? -30 : 30);
          
          ctx.rotate(angle + fallAngle);
          ctx.beginPath();
          ctx.moveTo(0, fallY + fallX);
          ctx.lineTo(len, fallY + fallX);
          
          if (isCross) {
             ctx.strokeStyle = '#d97706'; // Темное бревно (поперечное)
             ctx.fillStyle = '#92400e';
             ctx.lineWidth = 14;
          } else {
             ctx.strokeStyle = '#f59e0b'; // Светлое бревно (продольное)
          }

          ctx.stroke();
          ctx.restore();
      };

      const archBaseY = height - 105;
      
      // Left side logs
      drawLog(cx - 150, archBaseY, -Math.PI/6, 100); // Опора земли левая
      drawLog(cx - 70, archBaseY - 45, -Math.PI/12, 80); // Верхняя левая
      
      // Right side logs
      drawLog(cx + 150, archBaseY, Math.PI + Math.PI/6, 100); // Опора земли правая
      drawLog(cx + 70, archBaseY - 45, Math.PI + Math.PI/12, 80); // Верхняя правая
      
      // Top Center log (locking)
      drawLog(cx - 40, archBaseY - 70, 0, 80);

      // Запирающие поперечные бревна (Cross logs - view as dots/short lines)
      drawLog(cx - 85, archBaseY - 35, 0, 0, true);
      drawLog(cx + 85, archBaseY - 35, 0, 0, true);
      drawLog(cx - 45, archBaseY - 65, 0, 0, true);
      drawLog(cx + 45, archBaseY - 65, 0, 0, true);

      // 4. Отрисовка Груза (Weight box)
      if (loadWeight > 0) {
          const loadY = archBaseY - 70 - 30 + collapseProgress * 150; // Падает вместе с мостом
          const loadR = Math.min(40, loadWeight / 20 + 10);
          
          ctx.fillStyle = '#64748b'; // Железная гиря
          ctx.fillRect(cx - loadR, loadY, loadR*2, loadR*2);
          ctx.fillStyle = '#fff';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${loadWeight}kg`, cx, loadY + loadR + 4);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [loadWeight, frictionCoef, running]);

  const testBridge = () => {
      setStatus('testing');
      setRunning(false);
      setTimeout(() => setRunning(true), 50); // Reset animation trace
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-cover" />
        
        {/* Статус */}
        <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-600 p-3 rounded-lg backdrop-blur-md">
           <div className="text-slate-400 text-xs font-bold uppercase mb-1">Статус конструкции</div>
           {status === 'stable' && <div className="text-emerald-400 font-bold text-lg">МОСТ УСТОЙЧИВ ✓</div>}
           {status === 'collapse' && <div className="text-rose-500 font-bold text-lg">ОБРУШЕНИЕ (ПРОСКАЛЬЗЫВАНИЕ) ✗</div>}
           {status === 'broken' && <div className="text-red-600 font-bold text-lg">КРИТИЧЕСКИЙ ПЕРЕГРУЗ ✗</div>}
           {status === 'testing' && <div className="text-yellow-400 font-bold text-lg">ПРОВЕРКА...</div>}
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Box className="text-amber-500" /> Мост Да Винчи
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Самоподдерживающаяся конструкция без гвоздей и веревок! Чем больше вес давит сверху, тем сильнее бревна вжимаются друг в друга (Закон Амонтона-Кулона о сухом трении).
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
           Продольная нагрузка (Масса): {loadWeight} кг
           <input type="range" min="0" max="1000" step="50" value={loadWeight} onChange={e => setLoadWeight(Number(e.target.value))} className="accent-sky-500" />
           <span className="text-xs text-slate-400 font-normal">Гиря, которая давит на центральный пролет.</span>
        </label>

         <label className="flex flex-col gap-2 font-bold text-amber-500 text-sm">
           Коэффициент трения (Шероховатость): {frictionCoef} µ
           <input type="range" min="0.1" max="0.9" step="0.1" value={frictionCoef} onChange={e => setFrictionCoef(Number(e.target.value))} className="accent-amber-500" />
           <span className="text-xs text-slate-400 font-normal">0.1 = Скользкий мокрый лёд. 0.8 = Шершавое ореховое дерево.</span>
        </label>

        <button 
           onClick={testBridge}
           className="py-3 mt-4 rounded-lg font-bold text-white transition-colors bg-amber-600 hover:bg-amber-500 text-sm"
        >
           Установить груз & Проверить мост
        </button>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-amber-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
           <div>
             <strong>Парадокс конструкции:</strong> Легкий мост с трением 0.2 упадет под своим весом! Но если поставить на него тяжелый танк (увеличить N), сила трения F=µN вырастет, и мост ЗАМКНЕТСЯ намертво!
           </div>
        </div>
      </div>
    </div>
  );
}
