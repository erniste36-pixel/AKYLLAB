import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Info } from 'lucide-react';

export default function ChemistryOrganics() {
  const canvasRef = useRef(null);
  const [assemblyProgress, setAssemblyProgress] = useState(0); // 0 to 100
  const [resonance, setResonance] = useState(true);

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      time += 0.05;

      const progress = assemblyProgress / 100; // 0 to 1
      const R = 80; // Final radius of hexagon

      // 6 Carbon Atoms
      const carbons = [];
      for (let i = 0; i < 6; i++) {
          const targetAngle = (i * Math.PI) / 3 - Math.PI/2;
          const targetX = cx + Math.cos(targetAngle) * R;
          const targetY = cy + Math.sin(targetAngle) * R;
          
          // Start positions (scattered)
          const startAngle = targetAngle + (i%2 === 0 ? 1 : -1) * 2;
          const startR = R + 200;
          const startX = cx + Math.cos(startAngle) * startR;
          const startY = cy + Math.sin(startAngle) * startR;

          carbons.push({
              x: startX + (targetX - startX) * Math.pow(progress, 0.5),
              y: startY + (targetY - startY) * Math.pow(progress, 0.5),
              angle: targetAngle
          });
      }

      // Draw Bonds (Sigma Bonds)
      ctx.lineWidth = 4;
      ctx.strokeStyle = `rgba(148, 163, 184, ${progress})`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
          const c1 = carbons[i];
          const c2 = carbons[(i+1)%6];
          ctx.moveTo(c1.x, c1.y);
          ctx.lineTo(c2.x, c2.y);
      }
      ctx.stroke();

      // Draw Pi Bonds (Double bonds) - only if almost assembled
      if (progress > 0.9) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = `rgba(236, 72, 153, ${progress})`; // Pink

          if (resonance) {
              // Draw resonance circle
              ctx.setLineDash([5, 5]);
              ctx.beginPath();
              ctx.arc(cx, cy, R - 20, 0, Math.PI*2);
              ctx.stroke();
              ctx.setLineDash([]);
              
              // Glowing effect for pi cloud
              ctx.beginPath();
              ctx.arc(cx, cy, R - 15 + Math.sin(time*2)*5, 0, Math.PI*2);
              ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
              ctx.fill();
          } else {
              // Draw alternating double bonds
              ctx.beginPath();
              for (let i = 0; i < 6; i+=2) {
                  const c1 = carbons[i];
                  const c2 = carbons[(i+1)%6];
                  // Offset line inward
                  const angle = (carbons[i].angle + carbons[(i+1)%6].angle) / 2;
                  const offX = Math.cos(angle - Math.PI/2) * 10;
                  const offY = Math.sin(angle - Math.PI/2) * 10;
                  
                  ctx.moveTo(c1.x + offX, c1.y + offY);
                  ctx.lineTo(c2.x + offX, c2.y + offY);
              }
              ctx.stroke();
          }
      }

      // Draw Carbon Atoms & Hydrogens
      carbons.forEach((c) => {
          // Carbon
          ctx.beginPath();
          ctx.arc(c.x, c.y, 14, 0, Math.PI*2);
          ctx.fillStyle = '#334155';
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.fillStyle = '#fff';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('C', c.x, c.y + 1);

          // Hydrogen (appearing based on progress)
          if (progress > 0.5) {
              const hProb = (progress - 0.5) * 2; // 0 to 1
              const hX = c.x + Math.cos(c.angle) * 40;
              const hY = c.y + Math.sin(c.angle) * 40;
              
              ctx.beginPath();
              ctx.moveTo(c.x, c.y);
              ctx.lineTo(hX, hY);
              ctx.strokeStyle = `rgba(148, 163, 184, ${hProb})`;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(hX, hY, 8, 0, Math.PI*2);
              ctx.fillStyle = `rgba(241, 245, 249, ${hProb})`;
              ctx.fill();
              
              ctx.fillStyle = `rgba(15, 23, 42, ${hProb})`;
              ctx.font = '10px Arial';
              ctx.fillText('H', hX, hY + 1);
          }
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [assemblyProgress, resonance]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={400} className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Link2 className="text-pink-500" /> Бензольное кольцо
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Органическая молекула C₆H₆. Собери атомы углерода в гексагон, чтобы увидеть образование ароматического кольца.
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-sky-400 text-sm">
           Сборка молекулы: {Math.round(assemblyProgress)}%
           <input type="range" min="0" max="100" value={assemblyProgress} onChange={e => setAssemblyProgress(Number(e.target.value))} className="accent-sky-500" />
        </label>

        <div className={`transition-opacity duration-500 ${assemblyProgress > 90 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-600">
               <input type="checkbox" id="resonance" checked={resonance} onChange={e => setResonance(e.target.checked)} className="w-5 h-5 accent-pink-500" />
               <label htmlFor="resonance" className="text-pink-400 font-bold cursor-pointer">Резонансное кольцо (π-облако)</label>
            </div>
            <p className="text-xs text-slate-400 mt-2">
               Переключение между структурой Кекуле (чередующиеся связи) и реальным делокализованным электронным облаком.
            </p>
        </div>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs text-blue-300 border border-blue-900/40">
           <Info size={16} className="shrink-0 mt-0.5" />
           <div>
             <strong>Ароматичность:</strong> Электроны двойных связей равномерно "размазаны" по всему кольцу, что делает бензол невероятно стабильным соединением!
           </div>
        </div>
      </div>
    </div>
  );
}
