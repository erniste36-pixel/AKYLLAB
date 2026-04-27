import { useRef, useEffect, useState } from 'react';
import { Fingerprint, Play, ChevronRight, Activity, Database, Info, Target, MousePointer2 } from 'lucide-react';

const phases = [
  { id: 0, name: 'ПРОФАЗА', info: 'Хромосомы конденсируются, ядерная оболочка растворяется.' },
  { id: 1, name: 'МЕТАФАЗА', info: 'Хромосомы выстраиваются по экватору клетки.' },
  { id: 2, name: 'АНАФАЗА', info: 'Хроматиды расходятся к полюсам клетки.' },
  { id: 3, name: 'ТЕЛОФАЗА', info: 'Формируются новые ядерные оболочки, клетка делится (цитокинез).' }
];

export default function BiologyMitosis() {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    let animationId;
    let time = 0;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const poleDist = 120;

    const drawChromosome = (x, y, angle) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
        ctx.fillStyle = '#a855f7'; 
        ctx.beginPath(); ctx.roundRect(-4, -18, 8, 36, 4); ctx.roundRect(-18, -4, 36, 8, 4); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
        ctx.restore();
    };

    const drawChromatid = (x, y, angle) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
        ctx.fillStyle = '#a855f7'; 
        ctx.beginPath(); ctx.roundRect(-4, -18, 8, 36, 4); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
        ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0,0,canvas.width, canvas.height);
      time += 0.025;

      // HUD Decor
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.beginPath(); ctx.arc(cx, cy, 250, 0, Math.PI*2); ctx.stroke();
      
      // Cell Membrane
      ctx.beginPath();
      if (phase === 3) {
         ctx.arc(cx - 80, cy, 100, 0, Math.PI*2);
         ctx.arc(cx + 80, cy, 100, 0, Math.PI*2);
      } else {
         const pinch = phase === 2 ? 30 : 0; 
         ctx.ellipse(cx, cy, 140 + Math.sin(time)*5, 140 - pinch, 0, 0, Math.PI*2);
      }
      ctx.strokeStyle = 'var(--neon-primary)'; 
      ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'rgba(var(--neon-primary-rgb, 0,255,179), 0.05)'; ctx.fill();

      // Centrosomes
      ctx.fillStyle = '#f59e0b'; 
      ctx.shadowBlur = 15; ctx.shadowColor = '#f59e0b';
      ctx.beginPath(); ctx.arc(cx, cy - poleDist, 10, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy + poleDist, 10, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      if (phase === 0) {
         ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI*2);
         ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.setLineDash([5, 10]); ctx.stroke(); ctx.setLineDash([]);
         drawChromosome(cx - 20, cy - 15, time);
         drawChromosome(cx + 25, cy + 25, -time);
         drawChromosome(cx + 15, cy - 35, Math.PI/4);
         drawChromosome(cx - 15, cy + 30, Math.PI/3);
      } else if (phase === 1) {
         ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
         [-40, -15, 15, 40].forEach(x => {
            ctx.beginPath(); ctx.moveTo(cx, cy - poleDist); ctx.lineTo(cx + x, cy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, cy + poleDist); ctx.lineTo(cx + x, cy); ctx.stroke();
         });
         drawChromosome(cx - 40, cy, 0); drawChromosome(cx - 15, cy, 0);
         drawChromosome(cx + 15, cy, 0); drawChromosome(cx + 40, cy, 0);
      } else if (phase === 2) {
         const move = Math.min((time % 6) * 12, 60); 
         ctx.setLineDash([2, 5]);
         ctx.strokeStyle = 'rgba(255,255,255,0.15)';
         [-40, -15, 15, 40].forEach(x => {
            ctx.beginPath(); ctx.moveTo(cx, cy - poleDist); ctx.lineTo(cx + x, cy - move); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, cy + poleDist); ctx.lineTo(cx + x, cy + move); ctx.stroke();
         });
         ctx.setLineDash([]);
         [-40, -15, 15, 40].forEach(x => {
              drawChromatid(cx + x, cy - move, Math.PI/2);
              drawChromatid(cx + x, cy + move, Math.PI/2);
         });
      } else if (phase === 3) {
         ctx.beginPath(); ctx.arc(cx - 80, cy, 45, 0, Math.PI*2); ctx.arc(cx + 80, cy, 45, 0, Math.PI*2);
         ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
         drawChromatid(cx - 95, cy - 10, 0); drawChromatid(cx - 70, cy + 15, Math.PI/4); drawChromatid(cx - 80, cy + 5, -Math.PI/2);
         drawChromatid(cx + 95, cy - 10, 0); drawChromatid(cx + 70, cy + 15, Math.PI/4); drawChromatid(cx + 80, cy + 5, -Math.PI/2);
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [phase]);

  const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if(!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const cx = canvas.width/2; const cy = canvas.height/2;

      if (Math.hypot(x - cx, y - (cy - 120)) < 25 || Math.hypot(x - cx, y - (cy + 120)) < 25) {
          setTooltip({ x: e.clientX, y: e.clientY, text: 'ЦЕНТРОСОМА: ИЗЛУЧАЕТ ВЕРЕТЕНО ДЕЛЕНИЯ' });
      } else if (Math.abs(x - cx) < 60 && Math.abs(y - cy) < 60) {
          setTooltip({ x: e.clientX, y: e.clientY, text: phase <= 1 ? 'ХРОМОСОМЫ_СДВОЕННЫЕ' : 'ХРОМАТИДЫ_СЕГРЕГИРОВАННЫЕ' });
      } else {
          setTooltip(null);
      }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: '100%', color: 'var(--text-bright)', fontFamily: 'var(--font-ui)' }}>
      
      <div className="forge-frame" style={{ 
        background: 'rgba(5,7,12,0.4)', 
        borderRadius: 24, 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--forge-border-lit)'
      }}>
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', display: 'flex', gap: '1rem', zIndex: 10 }}>
           <span>CELL_SCAN // GENETIC_SEQUENCER</span>
           <span style={{ color: 'var(--neon-primary)' }}>MODE: MITOSIS_ANALYSIS</span>
        </div>

        {tooltip && (
            <div className="forge-frame" style={{ 
              position: 'fixed', top: tooltip.y + 15, left: tooltip.x + 15, zIndex: 100,
              padding: '6px 12px', background: 'rgba(5,7,12,0.9)', borderRadius: 8,
              fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-primary)',
              pointerEvents: 'none', border: '1px solid var(--neon-primary)'
            }}>
               {tooltip.text}
            </div>
        )}

        <canvas 
           ref={canvasRef} 
           onMouseMove={handleMouseMove}
           onMouseLeave={() => setTooltip(null)}
           width={1000} height={700} 
           style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'crosshair' }}
        />
        
        <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--forge-border)', fontSize: '0.6rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <MousePointer2 size={12} /> HOVER_TO_ANALYZE
        </div>
      </div>

      <div className="forge-frame" style={{ width: 340, padding: '1.75rem', borderRadius: 28, display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10,12,18,0.7)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,255,179,0.1)', display: 'grid', placeItems: 'center', color: 'var(--neon-primary)' }}>
            <Fingerprint size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900 }}>GENETIC_CORE</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>PROCESS: MITOSIS_LOOP</div>
          </div>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           {phases.map((p, i) => (
             <button 
                key={p.id}
                onClick={() => setPhase(i)}
                style={{ 
                  padding: '1rem', borderRadius: 12, textAlign: 'left',
                  background: phase === i ? 'rgba(0,255,179,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${phase === i ? 'var(--neon-primary)' : 'var(--forge-border)'}`,
                  color: phase === i ? 'var(--text-bright)' : 'var(--text-dim)',
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
             >
                <div style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' }}>{p.name}</div>
                {phase === i && <ChevronRight size={16} color="var(--neon-primary)" />}
             </button>
           ))}
        </section>

        <div style={{ 
          marginTop: 'auto', padding: '1.25rem', borderRadius: 16, 
          background: 'rgba(0,0,0,0.3)', border: '1px solid var(--forge-border)',
          fontSize: '0.8rem', lineHeight: '1.6', position: 'relative'
        }}>
           <div style={{ position: 'absolute', top: -10, left: 15, background: 'var(--forge-bg)', padding: '2px 8px', borderRadius: 4, fontSize: '0.6rem', color: 'var(--neon-primary)', fontFamily: 'var(--font-mono)' }}>PHASE_DECODED</div>
           <p style={{ margin: 0, opacity: 0.9 }}>{phases[phase].info}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', opacity: 0.5 }}>
           <span>GEN_V4.2</span>
           <span>SYNC_STABLE</span>
        </div>
      </div>
    </div>
  );
}
