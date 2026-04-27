import { useRef, useEffect, useState } from 'react';
import { Beaker, Database, Zap, Info, RefreshCcw, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';

const elements = [
  { p: 1, name: 'Водород (H)', stableN: [0, 1] }, { p: 2, name: 'Гелий (He)', stableN: [1, 2] },
  { p: 3, name: 'Литий (Li)', stableN: [3, 4] }, { p: 4, name: 'Бериллий (Be)', stableN: [5] },
  { p: 5, name: 'Бор (B)', stableN: [5, 6] }, { p: 6, name: 'Углерод (C)', stableN: [6, 7] },
  { p: 7, name: 'Азот (N)', stableN: [7, 8] }, { p: 8, name: 'Кислород (O)', stableN: [8, 9, 10] },
  { p: 9, name: 'Фтор (F)', stableN: [10] }, { p: 10, name: 'Неон (Ne)', stableN: [10, 11, 12] }
];

export default function AtomConstructor() {
  const canvasRef = useRef(null);
  const [protons, setProtons] = useState(6);
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let animationId;
    let time = 0;

    const render = () => {
      ctx.clearRect(0,0,canvas.width, canvas.height);
      ctx.fillStyle = 'transparent'; 
      ctx.fillRect(0,0,canvas.width, canvas.height);
      time += 0.02;

      // Draw Grid / HUD Lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for(let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for(let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw Nucleus
      const drawNucleon = (n, total, isProton) => {
        const offsetR = Math.sqrt(n) * 7;
        const angle = n * 2.39996; 
        const x = cx + Math.cos(angle) * offsetR;
        const y = cy + Math.sin(angle) * offsetR;
        
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = isProton ? '#ef4444' : '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.stroke();
        
        if (isProton) {
           ctx.shadowBlur = 10;
           ctx.shadowColor = '#ef4444';
           ctx.stroke();
           ctx.shadowBlur = 0;
        }
      };

      for(let i=0; i<protons; i++) drawNucleon(i, protons + neutrons, true);
      for(let i=0; i<neutrons; i++) drawNucleon(protons + i, protons + neutrons, false);

      // Orbitals
      const orbitals = [2, 8, 18, 32];
      let eCount = electrons;
      let shellIndex = 0;
      let baseRadius = 60;
      
      while(eCount > 0) {
         const shellMax = orbitals[shellIndex];
         const inThisShell = Math.min(eCount, shellMax);
         const shellRadius = baseRadius + shellIndex * 40;
         
         ctx.beginPath();
         ctx.arc(cx, cy, shellRadius, 0, Math.PI * 2);
         ctx.strokeStyle = 'rgba(0,255,179,0.1)';
         ctx.setLineDash([5, 10]);
         ctx.stroke();
         ctx.setLineDash([]);
         
         for(let i=0; i<inThisShell; i++) {
            const angleOffset = (Math.PI * 2 / inThisShell) * i;
            const speed = 1 / Math.sqrt(shellIndex + 1);
            const orbitAngle = angleOffset + time * speed * 0.8;
            const ex = cx + Math.cos(orbitAngle) * shellRadius;
            const ey = cy + Math.sin(orbitAngle) * shellRadius;
            
            ctx.beginPath();
            ctx.arc(ex, ey, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'var(--neon-primary)';
            ctx.fill();
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'var(--neon-primary)';
            ctx.fill();
            ctx.shadowBlur = 0;
         }
         
         eCount -= inThisShell;
         shellIndex++;
      }

      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [protons, neutrons, electrons]);

  const charge = protons - electrons;
  const massIndex = protons + neutrons;
  const element = elements.find(e => e.p === protons) || {name: 'HEAVY_ELEMENT', stableN: []};
  const isStable = element.stableN.includes(neutrons);
  const ionType = charge === 0 ? 'NEUTRAL' : charge > 0 ? 'CATION' : 'ANION';

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
           <span>NUCLEUS_SCAN_V2</span>
           <span style={{ color: 'var(--neon-primary)' }}>VALENCE_LEVELS: {Math.ceil(electrons/2)}</span>
        </div>

        <canvas ref={canvasRef} width={800} height={600} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        
        <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(5,7,12,0.8)', border: '1px solid var(--forge-border)', padding: '0.75rem 1rem', borderRadius: 12, fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
           <div style={{ color: 'var(--neon-primary)', marginBottom: 4 }}>SHELL_CONFIG:</div>
           <div>{electrons > 0 ? `K: ${Math.min(electrons, 2)} | L: ${Math.max(0, Math.min(electrons-2, 8))} | M: ${Math.max(0, electrons-10)}` : 'EMPTY'}</div>
        </div>
      </div>

      <div className="forge-frame" style={{ width: 340, padding: '1.75rem', borderRadius: 28, display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10,12,18,0.7)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,255,179,0.1)', display: 'grid', placeItems: 'center', color: 'var(--neon-primary)' }}>
            <Beaker size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{element.name.toUpperCase()}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>STABILITY_ID: {isStable ? 'STABLE' : 'UNSTABLE'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
           <div className="forge-frame" style={{ padding: '0.75rem', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginBottom: 4 }}>NET_CHARGE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: charge === 0 ? 'var(--text-bright)' : charge > 0 ? '#ef4444' : '#38bdf8' }}>
                 {charge > 0 ? `+${charge}` : charge}
              </div>
           </div>
           <div className="forge-frame" style={{ padding: '0.75rem', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginBottom: 4 }}>ATOMIC_MASS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{massIndex}</div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                <span>PROTONS (Z)</span>
                <span style={{ color: '#ef4444' }}>{protons}</span>
             </div>
             <input type="range" min="1" max="10" value={protons} onChange={e => setProtons(Number(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                <span>NEUTRONS (N)</span>
                <span style={{ color: '#94a3b8' }}>{neutrons}</span>
             </div>
             <input type="range" min="0" max="15" value={neutrons} onChange={e => setNeutrons(Number(e.target.value))} style={{ width: '100%', accentColor: '#94a3b8' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                <span>ELECTRONS (E)</span>
                <span style={{ color: 'var(--neon-primary)' }}>{electrons}</span>
             </div>
             <input type="range" min="0" max="15" value={electrons} onChange={e => setElectrons(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--neon-primary)' }} />
          </div>
        </div>

        <div style={{ 
          marginTop: 'auto', padding: '1rem', borderRadius: 16, border: '1px solid currentColor',
          borderColor: isStable ? 'var(--neon-primary)' : '#ef4444',
          background: isStable ? 'rgba(0,255,179,0.05)' : 'rgba(239,68,68,0.05)',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
           {isStable ? <ShieldCheck size={20} color="var(--neon-primary)" /> : <ShieldAlert size={20} color="#ef4444" />}
           <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>
             {isStable ? 'STABLE_ISOTOPE' : 'ISOTOPE_UNSTABLE'}
           </div>
        </div>
      </div>
    </div>
  );
}
