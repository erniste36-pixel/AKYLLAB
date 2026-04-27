import { useRef, useEffect, useState } from 'react';
import { Activity, Zap, Play, RotateCcw, Sliders, Info, Cpu } from 'lucide-react';

export default function PhysicsNewtonCanvas() {
  const canvasRef = useRef(null);
  const graphRef = useRef(null); 
  
  const [mass1, setMass1] = useState(10); 
  const [force1, setForce1] = useState(100); 
  const [frictionCoef, setFrictionCoef] = useState(0.1); 
  const [enableCollision, setEnableCollision] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const sRef = useRef({
    x1: 100, v1: 0, a1: 0,
    x2: 600, v2: 0, m2: 8,
    time: 0,
    history: [] 
  });

  useEffect(() => {
    let animationId;
    let lastTime = performance.now();
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const cy = canvas.height - 120;

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const state = sRef.current;

      if (isPlaying) {
         state.time += dt;
         const F1 = force1;
         const F_friction1 = mass1 * 9.8 * frictionCoef * Math.sign(state.v1 || F1); 
         let netForce1 = F1 - F_friction1;
         if (Math.abs(state.v1) < 0.1 && Math.abs(F1) <= mass1 * 9.8 * frictionCoef) { netForce1 = 0; state.v1 = 0; }
         state.a1 = netForce1 / mass1;
         state.v1 += state.a1 * dt;
         state.x1 += state.v1 * dt * 10; 

         if (enableCollision) {
            const F_friction2 = state.m2 * 9.8 * frictionCoef * Math.sign(state.v2);
            let netForce2 = -F_friction2;
            if (Math.abs(state.v2) < 0.1) { netForce2 = 0; state.v2 = 0; }
            state.v2 += (netForce2 / state.m2) * dt;
            state.x2 += state.v2 * dt * 10;
         }

         const size1 = 20 + mass1*2;
         const size2 = 20 + state.m2*2;
         if (enableCollision && (state.x1 + size1/2 >= state.x2 - size2/2)) {
             const v1_new = ((mass1 - state.m2)*state.v1 + 2*state.m2*state.v2) / (mass1 + state.m2);
             const v2_new = ((state.m2 - mass1)*state.v2 + 2*mass1*state.v1) / (mass1 + state.m2);
             state.v1 = v1_new;
             state.v2 = v2_new;
             const overlap = (state.x1 + size1/2) - (state.x2 - size2/2);
             state.x1 -= overlap/2 + 0.1;
             state.x2 += overlap/2 + 0.1;
         }

         if (Math.floor(state.time * 20) > state.history.length) {
            state.history.push({ t: state.time, v1: state.v1, v2: state.v2 });
            if (state.history.length > 200) state.history.shift();
         }
      }

      ctx.clearRect(0,0,canvas.width, canvas.height);
      
      // GRID FLOOR
      let camOffset = 0;
      if (state.x1 > canvas.width / 2 - 100) camOffset = state.x1 - (canvas.width / 2 - 100);

      ctx.save();
      ctx.translate(-camOffset, 0);

      // Floor Line
      ctx.beginPath(); ctx.moveTo(camOffset, cy); ctx.lineTo(camOffset + canvas.width, cy);
      ctx.strokeStyle = 'var(--neon-primary)'; ctx.lineWidth = 2; ctx.stroke();
      
      // Marker lines
      const startX = Math.floor(camOffset / 100) * 100;
      for(let i=startX; i<startX + canvas.width + 100; i+=100) {
         ctx.beginPath(); ctx.moveTo(i, cy); ctx.lineTo(i, cy + 8);
         ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth=1; ctx.stroke();
         ctx.fillStyle = 'var(--text-dim)'; ctx.font = '10px var(--font-mono)';
         ctx.fillText(`${i/10}m`, i+5, cy + 20);
      }

      // Block 1
      const sz1 = 20 + mass1 * 2;
      ctx.fillStyle = 'rgba(0, 255, 179, 0.1)'; 
      ctx.fillRect(state.x1 - sz1/2, cy - sz1, sz1, sz1);
      ctx.strokeStyle = 'var(--neon-primary)'; ctx.lineWidth=2; ctx.strokeRect(state.x1 - sz1/2, cy - sz1, sz1, sz1);
      
      // Label 1
      ctx.fillStyle = 'var(--text-bright)'; ctx.font = 'bold 12px var(--font-mono)'; 
      ctx.fillText(`M1: ${mass1}kg`, state.x1 - sz1/2, cy - sz1 - 10);

      // Force Vector
      if (force1 !== 0) {
         ctx.beginPath(); ctx.moveTo(state.x1, cy - sz1/2); ctx.lineTo(state.x1 + force1, cy - sz1/2);
         ctx.strokeStyle = '#ef4444'; ctx.lineWidth=3; ctx.stroke();
         // Arrow head
         const head = 10 * Math.sign(force1);
         ctx.beginPath(); ctx.moveTo(state.x1 + force1, cy - sz1/2); ctx.lineTo(state.x1 + force1 - head, cy - sz1/2 - 5); ctx.lineTo(state.x1 + force1 - head, cy - sz1/2 + 5); ctx.closePath();
         ctx.fillStyle = '#ef4444'; ctx.fill();
      }

      // Block 2
      if (enableCollision) {
          const sz2 = 20 + state.m2 * 2;
          ctx.fillStyle = 'rgba(244, 63, 94, 0.1)'; 
          ctx.fillRect(state.x2 - sz2/2, cy - sz2, sz2, sz2);
          ctx.strokeStyle = '#f43f5e'; ctx.strokeRect(state.x2 - sz2/2, cy - sz2, sz2, sz2);
          ctx.fillStyle = '#f43f5e'; ctx.fillText(`M2: ${state.m2}kg`, state.x2 - sz2/2, cy - sz2 - 10);
      }
      
      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, force1, mass1, frictionCoef, enableCollision]);

  // Velocity Graph
  useEffect(() => {
    let animId;
    const renderG = () => {
       const gC = graphRef.current;
       if(gC) {
          const ctx = gC.getContext('2d');
          ctx.clearRect(0,0,gC.width, gC.height);
          const hist = sRef.current.history;
          
          if(hist.length > 1) {
             ctx.beginPath();
             hist.forEach((pt, i) => {
                const x = (i / 200) * gC.width;
                const y = gC.height/2 - pt.v1 * 4; 
                if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
             });
             ctx.strokeStyle = 'var(--neon-primary)'; ctx.lineWidth=2; ctx.stroke();

             if (enableCollision) {
                ctx.beginPath();
                hist.forEach((pt, i) => {
                   const x = (i / 200) * gC.width;
                   const y = gC.height/2 - pt.v2 * 4;
                   if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                });
                ctx.strokeStyle = '#f43f5e'; ctx.lineWidth=2; ctx.stroke();
             }
          }
          ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(0,gC.height/2); ctx.lineTo(gC.width, gC.height/2); ctx.stroke();
       }
       animId = requestAnimationFrame(renderG);
    };
    renderG();
    return () => cancelAnimationFrame(animId);
  }, [enableCollision]);

  const reset = () => {
    setIsPlaying(false);
    sRef.current = { x1: 100, v1: 0, a1: 0, x2: 600, v2: 0, m2: 8, time: 0, history: [] };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: '100%', color: 'var(--text-bright)', fontFamily: 'var(--font-ui)' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="forge-frame" style={{ flex: 1, borderRadius: 24, position: 'relative', overflow: 'hidden', border: '1px solid var(--forge-border-lit)', background: 'rgba(5,7,12,0.4)' }}>
           <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', zIndex: 10 }}>TEST_BENCH: MECHANICAL_LAWS_V4</div>
           <canvas ref={canvasRef} width={800} height={400} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div className="forge-frame" style={{ height: 140, borderRadius: 20, padding: '1rem', border: '1px solid var(--forge-border)', background: 'rgba(0,0,0,0.3)' }}>
           <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>VELOCITY_TIME_GRAPH (V/T)</div>
           <canvas ref={graphRef} width={800} height={100} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <div className="forge-frame" style={{ width: 340, padding: '1.75rem', borderRadius: 28, display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(10,12,18,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,255,179,0.1)', display: 'grid', placeItems: 'center', color: 'var(--neon-primary)' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900 }}>DYNAMICS_HUB</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>NEWTON_SECOND_LAW: TRUE</div>
          </div>
        </div>

        <label className="forge-frame" style={{ padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
           <input type="checkbox" checked={enableCollision} onChange={e=>setEnableCollision(e.target.checked)} style={{ accentColor: 'var(--neon-primary)', width: 18, height: 18 }} />
           <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>COLLISION_SIMULATION</span>
        </label>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}><span>FORCE (N)</span><span style={{ color: '#ef4444' }}>{force1}</span></div>
            <input type="range" min="-200" max="200" step="10" value={force1} onChange={e => setForce1(Number(e.target.value))} style={{ accentColor: '#ef4444' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}><span>MASS M1 (KG)</span><span style={{ color: 'var(--neon-primary)' }}>{mass1}</span></div>
            <input type="range" min="1" max="50" value={mass1} onChange={e => setMass1(Number(e.target.value))} style={{ accentColor: 'var(--neon-primary)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}><span>FRICTION (µ)</span><span style={{ color: '#38bdf8' }}>{frictionCoef}</span></div>
            <input type="range" min="0" max="1" step="0.05" value={frictionCoef} onChange={e => setFrictionCoef(Number(e.target.value))} style={{ accentColor: '#38bdf8' }} />
          </div>
        </section>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <button className="forge-btn-primary" onClick={() => setIsPlaying(!isPlaying)} style={{ height: 50, borderRadius: 14 }}>
              {isPlaying ? 'ABORT_PROCESS' : 'INIT_SEQUENCE'}
           </button>
           <button className="forge-btn-secondary" onClick={reset} style={{ height: 44, borderRadius: 12 }}>
              RESET_STAND
           </button>
        </div>
      </div>
    </div>
  );
}
