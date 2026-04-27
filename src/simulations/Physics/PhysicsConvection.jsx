import { useRef, useEffect, useState } from 'react';
import { Flame, Info } from 'lucide-react';

// Convection currents - heated fluid rising, cool sinking
export default function PhysicsConvection() {
  const canvasRef = useRef(null);
  const [heatPower, setHeatPower] = useState(50);
  const [viscosity, setViscosity] = useState(0.3);
  const [showVectors, setShowVectors] = useState(true);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const COLS = 20, ROWS = 15;
    const cW = W / COLS, cH = H / ROWS;

    // Temperature field
    const temp = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => 20 + Math.random() * 5)
    );
    // Velocity field
    const vx = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    const vy = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    // Tracer particles
    const tracers = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      age: Math.random() * 100,
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      time++;

      const hp = heatPower / 100;

      // Heat the bottom row, cool the top
      for (let c = 0; c < COLS; c++) {
        temp[ROWS - 1][c] += hp * 3;
        temp[ROWS - 1][c] = Math.min(temp[ROWS - 1][c], 20 + hp * 300);
        temp[0][c] -= 0.5;
        temp[0][c] = Math.max(temp[0][c], 20);
      }

      // Diffuse temperature + compute buoyancy velocity
      for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
          // Diffusion
          temp[r][c] += 0.1 * (
            temp[r - 1][c] + temp[r + 1][c] + temp[r][c - 1] + temp[r][c + 1] - 4 * temp[r][c]
          );

          // Buoyancy: hot rises (vy negative = up), cool sinks
          const tAmb = 20 + hp * 100;
          const buoy = (temp[r][c] - tAmb) * 0.005;
          vy[r][c] = vy[r][c] * (1 - viscosity) - buoy;
          vx[r][c] = vx[r][c] * (1 - viscosity);

          // Pressure-like equalization (very simplified)
          if (r > 1 && r < ROWS - 2) {
            vx[r][c] += (vy[r - 1][c] - vy[r + 1][c]) * 0.1;
          }
        }
      }

      // Draw temperature field
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const t = temp[r][c];
          const normalized = Math.min(1, Math.max(0, (t - 20) / (hp * 300 + 1)));
          // Blue (cold) to Red (hot)
          const red = Math.floor(normalized * 255);
          const blue = Math.floor((1 - normalized) * 200);
          ctx.fillStyle = `rgba(${red}, 30, ${blue}, 0.7)`;
          ctx.fillRect(c * cW, r * cH, cW, cH);
        }
      }

      // Draw velocity vectors
      if (showVectors) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        for (let r = 1; r < ROWS - 1; r += 2) {
          for (let c = 1; c < COLS - 1; c += 2) {
            const cx2 = c * cW + cW / 2, cy2 = r * cH + cH / 2;
            const scale = 40;
            const ex = cx2 + vx[r][c] * scale;
            const ey = cy2 + vy[r][c] * scale;
            ctx.beginPath();
            ctx.moveTo(cx2, cy2);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            // Arrow head
            const angle = Math.atan2(ey - cy2, ex - cx2);
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - 6 * Math.cos(angle - 0.4), ey - 6 * Math.sin(angle - 0.4));
            ctx.lineTo(ex - 6 * Math.cos(angle + 0.4), ey - 6 * Math.sin(angle + 0.4));
            ctx.closePath();
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();
          }
        }
      }

      // Update and draw tracers
      tracers.forEach(tr => {
        const col = Math.floor(tr.x / cW);
        const row = Math.floor(tr.y / cH);
        if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
          tr.x += vx[row][col] * 50;
          tr.y += vy[row][col] * 50;
        }
        tr.age++;
        if (tr.x < 0 || tr.x > W || tr.y < 0 || tr.y > H || tr.age > 200) {
          tr.x = Math.random() * W;
          tr.y = H * 0.4 + Math.random() * H * 0.4;
          tr.age = 0;
        }
        const alpha = Math.min(1, (200 - tr.age) / 200);
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
        ctx.fill();
      });

      // Heat source indicator at bottom
      ctx.fillStyle = `rgba(255, ${Math.floor(200 - hp * 200)}, 0, 0.8)`;
      ctx.fillRect(0, H - 8, W, 8);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔥 Источник тепла', W / 2, H - 12);
      ctx.fillText('❄️ Холодная поверхность', W / 2, 16);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [heatPower, viscosity, showVectors]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Flame className="text-orange-400" /> Конвекция
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Нагретая жидкость (красная) легче холодной — она всплывает. Холодная (синяя) тяжелее — опускается. Возникают конвективные ячейки Бенара!
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-orange-400 text-sm">
          Мощность нагрева: {heatPower}%
          <input type="range" min="10" max="100" step="5" value={heatPower} onChange={e => setHeatPower(Number(e.target.value))} className="accent-orange-500" />
          <span className="text-xs text-slate-400">Чем больше мощность, тем интенсивнее конвективные потоки.</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-blue-400 text-sm">
          Вязкость среды: {viscosity.toFixed(1)}
          <input type="range" min="0.05" max="0.9" step="0.05" value={viscosity} onChange={e => setViscosity(Number(e.target.value))} className="accent-blue-500" />
          <span className="text-xs text-slate-400">Высокая вязкость (мед, лава) замедляет конвекцию.</span>
        </label>
        <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-600">
          <input type="checkbox" id="vectors" checked={showVectors} onChange={e => setShowVectors(e.target.checked)} className="w-5 h-5 accent-white" />
          <label htmlFor="vectors" className="font-bold cursor-pointer text-sm">Показать векторы скорости</label>
        </div>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-orange-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-orange-400" />
          <div><strong>Применение:</strong> Конвекция — это ветер в атмосфере, течения в океане, перенос тепла в мантии Земли и работа радиатора отопления!</div>
        </div>
      </div>
    </div>
  );
}
