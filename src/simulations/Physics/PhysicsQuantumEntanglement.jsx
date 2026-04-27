import { useRef, useEffect, useState } from 'react';

export default function PhysicsQuantumEntanglement() {
  const canvasRef = useRef(null);
  
  const [distance, setDistance] = useState(100);
  const [particleAState, setParticleAState] = useState('superposition');
  const [particleBState, setParticleBState] = useState('superposition');

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    let time = 0;

    const render = () => {
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,width,height);
      time += 0.05;

      const offset = (distance / 400) * (width * 0.4);
      const posA = { x: cx - offset, y: cy };
      const posB = { x: cx + offset, y: cy };

      // Отрисовка связи (Entanglement web)
      if (particleAState === 'superposition') {
          ctx.beginPath();
          ctx.moveTo(posA.x, posA.y);
          // Волна вероятности
          for(let i = posA.x; i <= posB.x; i+=5) {
             const progress = (i - posA.x) / (posB.x - posA.x);
             const amplitude = Math.sin(progress * Math.PI) * 40;
             const waveY = cy + Math.sin(i * 0.05 + time * 2) * amplitude;
             ctx.lineTo(i, waveY);
          }
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.font = '12px Courier';
          ctx.fillStyle = '#8b5cf6';
          ctx.fillText('Состояние: Не определено', cx - 70, cy - 60);
      } else {
          // Мгновенная линия измерения
          ctx.beginPath();
          ctx.moveTo(posA.x, posA.y);
          ctx.lineTo(posB.x, posB.y);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          
          ctx.font = '12px Courier';
          ctx.fillStyle = '#ef4444';
          ctx.fillText('СВЯЗЬ РАЗОРВАНА', cx - 50, cy - 60);
      }

      // Функция отрисовки частицы
      const drawParticle = (pos, state, color) => {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          
          // Энергетическое поле
          ctx.beginPath();
          ctx.arc(0, 0, 30, 0, Math.PI*2);
          ctx.fillStyle = `${color}20`;
          ctx.fill();

          // Ядро частицы
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI*2);
          ctx.fillStyle = color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Спин вектор
          if (state === 'superposition') {
             // Крутится быстро, не определено
             ctx.rotate(time * 3);
             ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(0, -15);
             ctx.moveTo(-5, -5); ctx.lineTo(0, -15); ctx.lineTo(5, -5);
             ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.stroke();
          } else if (state === 'up') {
             ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(0, -15);
             ctx.moveTo(-5, -5); ctx.lineTo(0, -15); ctx.lineTo(5, -5);
             ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.stroke();
          } else if (state === 'down') {
             ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(0, 15);
             ctx.moveTo(-5, 5); ctx.lineTo(0, 15); ctx.lineTo(5, 5);
             ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.stroke();
          }

          ctx.restore();
          
          // Подписи
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#fff';
          ctx.fillText(`SPIN: ${state === 'superposition' ? '???' : state.toUpperCase()}`, pos.x - 30, pos.y + 50);
      };

      drawParticle(posA, particleAState, particleAState === 'superposition' ? '#8b5cf6' : '#22c55e');
      drawParticle(posB, particleBState, particleBState === 'superposition' ? '#8b5cf6' : '#f43f5e');

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [distance, particleAState, particleBState]);

  const measureA = () => {
      const result = Math.random() > 0.5 ? 'up' : 'down';
      setParticleAState(result);
      setParticleBState(result === 'up' ? 'down' : 'up'); // Запутанность: противоположное состояние
  };

  const measureB = () => {
      const result = Math.random() > 0.5 ? 'up' : 'down';
      setParticleBState(result);
      setParticleAState(result === 'up' ? 'down' : 'up');
  };

  const reset = () => {
      setParticleAState('superposition');
      setParticleBState('superposition');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-5">
        <h2 className="text-xl font-bold border-b border-slate-600 pb-2">Квантовая запутанность</h2>
        <p className="text-sm text-slate-400">
           Две частицы находятся в состоянии суперпозиции. Как только мы измеряем одну, вторая мгновенно коллапсирует в противоположное состояние, независимо от расстояния!
        </p>

        <label className="flex flex-col gap-1 font-bold text-sky-400 text-sm">
           Расстояние между частицами (тыс. св. лет): {distance}
           <input type="range" min="10" max="400" step="10" value={distance} onChange={e => setDistance(Number(e.target.value))} className="accent-sky-500" />
        </label>

        <div className="mt-4 flex flex-col gap-3">
           <button onClick={measureA} disabled={particleAState !== 'superposition'} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-2 rounded font-bold text-white transition-colors">
              👁️ Измерить Частицу A
           </button>
           <button onClick={measureB} disabled={particleBState !== 'superposition'} className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 py-2 rounded font-bold text-white transition-colors">
              👁️ Измерить Частицу B
           </button>
           <button onClick={reset} className="bg-slate-700 hover:bg-slate-600 py-2 rounded border border-slate-500 font-bold text-white mt-4">
              Сброс (Новая пара)
           </button>
        </div>

        <div className="mt-auto bg-slate-900 p-4 rounded text-xs text-purple-400 border border-purple-900/30">
           <strong>Парадокс ЭПР:</strong> Даже если разнести фотоны на разные концы Вселенной, информация о спине второй частицы определится мгновенно в момент измерения первой.
        </div>
      </div>
    </div>
  );
}
