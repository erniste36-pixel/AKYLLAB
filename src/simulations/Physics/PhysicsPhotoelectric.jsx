import { useRef, useEffect, useState } from 'react';
import { Sun, Info } from 'lucide-react';

export default function PhysicsPhotoelectric() {
  const canvasRef = useRef(null);
  const [frequency, setFrequency] = useState(700); // THz
  const [intensity, setIntensity] = useState(50);
  const [material, setMaterial] = useState('Na');

  const materials = {
    Na: { workFunc: 2.28, name: 'Натрий (Na)', color: '#f59e0b' },
    Al: { workFunc: 4.28, name: 'Алюминий (Al)', color: '#94a3b8' },
    Pt: { workFunc: 5.65, name: 'Платина (Pt)', color: '#e2e8f0' },
  };

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const mat = materials[material];
    const h = 4.136e-15; // Planck eV·s
    const E_photon = h * frequency * 1e12; // eV
    const KE = Math.max(0, E_photon - mat.workFunc); // Kinetic energy of electrons

    // Photons
    const photons = [];
    // Electrons ejected
    const electrons = [];
    // Voltmeter reading
    let voltage = KE > 0 ? KE.toFixed(2) : '0.00';

    // Wavelength from frequency (c = λν)
    const wavelengthNm = Math.round(3e8 / (frequency * 1e12) * 1e9);
    const wlToColor = (wl) => {
      if (wl < 380) return '#c084fc';
      if (wl < 450) return '#818cf8';
      if (wl < 490) return '#38bdf8';
      if (wl < 560) return '#4ade80';
      if (wl < 595) return '#facc15';
      if (wl < 625) return '#fb923c';
      return '#ef4444';
    };
    const photonColor = wlToColor(wavelengthNm);

    let time = 0;
    const plateY = H * 0.55;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);
      time++;

      // Spawn photons from top-left
      if (time % Math.max(1, Math.floor(10 - intensity / 15)) === 0) {
        photons.push({
          x: 20 + Math.random() * W * 0.5,
          y: 10,
          vx: (Math.random() - 0.5) * 1,
          vy: 4 + Math.random() * 2,
          color: photonColor,
        });
      }

      // Metal plate
      ctx.fillStyle = mat.color;
      ctx.fillRect(0, plateY, W, 30);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, plateY + 30, W, H - plateY - 30);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(mat.name, W / 2, plateY + 20);

      // Update photons
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        p.x += p.vx; p.y += p.vy;

        // Draw photon (wavy circle)
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12; ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('γ', p.x, p.y);

        // Hit plate
        if (p.y >= plateY) {
          photons.splice(i, 1);
          if (KE > 0) {
            // Eject electron!
            electrons.push({
              x: p.x, y: plateY,
              vx: (Math.random() - 0.5) * 3,
              vy: -(2 + KE * 3 + Math.random()),
              life: 80,
            });
          }
          // Flash on plate
          ctx.beginPath();
          ctx.arc(p.x, plateY, 10, 0, Math.PI * 2);
          ctx.fillStyle = KE > 0 ? 'rgba(250,204,21,0.6)' : 'rgba(100,116,139,0.4)';
          ctx.fill();
        }
        if (p.y > H) photons.splice(i, 1);
      }

      // Update electrons
      for (let i = electrons.length - 1; i >= 0; i--) {
        const e = electrons[i];
        e.x += e.vx; e.y += e.vy;
        e.vy += 0.05; // gravity
        e.life--;
        if (e.life <= 0 || e.y > H) { electrons.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250,204,21,${e.life / 80})`;
        ctx.shadowBlur = 8; ctx.shadowColor = '#facc15';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('e⁻', e.x, e.y);
      }

      // Info panel
      const canEject = KE > 0;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(W - 200, 10, 190, 120);
      ctx.strokeStyle = canEject ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(W - 200, 10, 190, 120);

      ctx.font = 'bold 12px Courier';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`λ = ${wavelengthNm} нм`, W - 195, 30);
      ctx.fillText(`ν = ${frequency} ТГц`, W - 195, 50);
      ctx.fillText(`E фотона = ${E_photon.toFixed(2)} эВ`, W - 195, 70);
      ctx.fillText(`А (работа выхода) = ${mat.workFunc} эВ`, W - 195, 90);
      ctx.fillStyle = canEject ? '#22c55e' : '#ef4444';
      ctx.fillText(canEject ? `Eк = ${KE.toFixed(2)} эВ ✓` : `Нет эмиссии (E < А) ✗`, W - 195, 115);

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [frequency, intensity, material]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={460} className="w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
            <Sun className="text-yellow-400" /> Фотоэффект
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Если частота фотона выше порогового значения, он выбивает электрон из металла. Это открытие принесло Эйнштейну Нобелевскую премию 1921 года!
          </p>
        </div>
        <label className="flex flex-col gap-2 font-bold text-yellow-400 text-sm">
          Частота света: {frequency} ТГц
          <input type="range" min="300" max="1500" step="25" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="accent-yellow-500" />
          <span className="text-xs text-slate-400">Увеличь частоту до порогового значения для данного металла!</span>
        </label>
        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
          Интенсивность: {intensity}%
          <input type="range" min="10" max="100" step="5" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="accent-sky-500" />
          <span className="text-xs text-slate-400">Больше фотонов, но НЕ влияет на энергию каждого!</span>
        </label>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold text-slate-300 mb-1">Материал пластины:</div>
          {Object.entries(materials).map(([key, val]) => (
            <button key={key} onClick={() => setMaterial(key)}
              className={`text-left p-2 rounded-lg border text-sm transition-all ${material === key ? 'border-yellow-500 bg-yellow-900/30' : 'border-slate-600 hover:border-slate-500'}`}>
              <span style={{ color: val.color }} className="font-bold">{val.name}</span>
              <span className="text-slate-400 ml-2">A = {val.workFunc} эВ</span>
            </button>
          ))}
        </div>
        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-yellow-900/40 text-slate-300">
          <Info size={16} className="shrink-0 mt-0.5 text-yellow-400" />
          <div><strong>Формула Эйнштейна:</strong> Ek = hν − A. Кинетическая энергия электрона = Энергия фотона − Работа выхода. Увеличить яркость = больше электронов, но не быстрее!</div>
        </div>
      </div>
    </div>
  );
}
