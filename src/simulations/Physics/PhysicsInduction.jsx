import { useRef, useEffect, useState } from 'react';
import { Zap, Info } from 'lucide-react';

export default function PhysicsInduction() {
  const canvasRef = useRef(null);
  const [magnetSpeed, setMagnetSpeed] = useState(3);
  const [coilTurns, setCoilTurns] = useState(5);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    let magnetY = -60;
    let direction = 1;
    let time = 0;
    const voltageHistory = Array(W).fill(0);

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      time++;

      if (running) {
        magnetY += magnetSpeed * direction;
        if (magnetY > H * 0.7) direction = -1;
        if (magnetY < -60) direction = 1;
      }

      const coilCenterY = H * 0.45;
      const coilCenterX = W / 2;

      // Induced EMF = -N * dΦ/dt approx proportional to speed * N / distance²
      const distToCoil = Math.abs(magnetY - coilCenterY);
      const emf = direction * magnetSpeed * coilTurns * 500 / Math.max(10, distToCoil ** 1.5);

      // Shift voltage history
      voltageHistory.push(emf);
      if (voltageHistory.length > W) voltageHistory.shift();

      // Draw coil (rings)
      for (let n = 0; n < coilTurns; n++) {
        const xOff = (n - coilTurns / 2) * 12;
        ctx.beginPath();
        ctx.ellipse(coilCenterX + xOff, coilCenterY, 18, 35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = Math.abs(emf) > 5 ? `rgba(251,191,36,0.8)` : '#475569';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Wire connecting coil ends
      ctx.beginPath();
      ctx.moveTo(coilCenterX - coilTurns * 6 - 18, coilCenterY);
      ctx.lineTo(coilCenterX - coilTurns * 6 - 18, H * 0.75);
      ctx.lineTo(coilCenterX + coilTurns * 6 + 18, H * 0.75);
      ctx.lineTo(coilCenterX + coilTurns * 6 + 18, coilCenterY);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Galvanometer
      const galX = coilCenterX, galY = H * 0.75;
      ctx.beginPath();
      ctx.arc(galX, galY, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = emf > 0 ? '#22c55e' : emf < -2 ? '#ef4444' : '#475569';
      ctx.lineWidth = 3;
      ctx.fill(); ctx.stroke();
      // Needle
      const needleAngle = Math.atan2(emf / 60, 1);
      ctx.beginPath();
      ctx.moveTo(galX, galY);
      ctx.lineTo(galX + Math.sin(needleAngle) * 16, galY - Math.cos(needleAngle) * 16);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('G', galX, galY + 4);

      // Magnet
      const mW = 50, mH = 80;
      const mX = coilCenterX - mW / 2;
      const mY_top = magnetY - mH / 2;
      // N pole (red)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(mX, mY_top, mW, mH / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('N', coilCenterX, mY_top + mH / 4 + 6);
      // S pole (blue)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(mX, mY_top + mH / 2, mW, mH / 2);
      ctx.fillStyle = '#fff';
      ctx.fillText('S', coilCenterX, mY_top + mH * 0.75 + 6);

      // Field lines
      for (let i = -2; i <= 2; i++) {
        const fieldStrength = Math.max(0, 1 - distToCoil / 200);
        ctx.beginPath();
        ctx.setLineDash([3, 5]);
        ctx.moveTo(coilCenterX + i * 25, magnetY + mH / 2);
        ctx.lineTo(coilCenterX + i * 25, coilCenterY);
        ctx.strokeStyle = `rgba(251,191,36,${fieldStrength * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // EMF label
      ctx.fillStyle = Math.abs(emf) > 2 ? '#facc15' : '#64748b';
      ctx.font = 'bold 20px Courier';
      ctx.textAlign = 'right';
      ctx.fillText(`ε = ${emf.toFixed(0)} мВ`, W - 10, 30);
      ctx.font = '12px Courier';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`N = ${coilTurns} витков`, W - 10, 50);

      // Oscilloscope trace (bottom)
      ctx.fillStyle = '#0a0f1e';
      ctx.fillRect(0, H - 90, W, 90);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(0, H - 90, W, 90);
      ctx.fillStyle = '#1e3a1e';
      ctx.fillRect(0, H - 90, W, 90);

      ctx.beginPath();
      const midY = H - 45;
      voltageHistory.forEach((v, i) => {
        const y = midY - v * 0.3;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      });
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Zero line
      ctx.beginPath();
      ctx.moveTo(0, midY); ctx.lineTo(W, midY);
      ctx.strokeStyle = 'rgba(34,197,94,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.font = '10px Courier';
      ctx.textAlign = 'left';
      ctx.fillText('Осциллограф ЭДС', 4, H - 78);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [magnetSpeed, coilTurns, running]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={520} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Zap className="text-yellow-400" /> Электромагнитная Индукция
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Движущийся магнит меняет магнитный поток через катушку и индуцирует ЭДС. Закон Фарадея: ε = −N·dΦ/dt. Осциллограф показывает форму тока!
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-yellow-400 text-sm">
          Скорость магнита: {magnetSpeed} у.е.
          <input type="range" min="1" max="10" step="1" value={magnetSpeed} onChange={e => setMagnetSpeed(Number(e.target.value))} className="accent-yellow-500" />
          <span className="text-xs text-slate-400">dΦ/dt ∝ скорости → ЭДС растет со скоростью!</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
          Число витков катушки: {coilTurns}
          <input type="range" min="1" max="15" step="1" value={coilTurns} onChange={e => setCoilTurns(Number(e.target.value))} className="accent-sky-500" />
          <span className="text-xs text-slate-400">ЭДС = −N · dΦ/dt. Больше витков — сильнее ток!</span>
        </label>
        <button onClick={() => setRunning(!running)} className={`py-3 rounded-lg font-bold text-white transition-colors ${running ? 'bg-slate-600' : 'bg-yellow-600'}`}>
          {running ? 'Остановить магнит' : 'Двигать магнит'}
        </button>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-yellow-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-yellow-400" />
          <div><strong>Правило Ленца:</strong> Индуцированный ток всегда направлен так, чтобы противодействовать изменению потока! Именно так работает тормоз маглева.</div>
        </div>
      </div>
    </div>
  );
}
