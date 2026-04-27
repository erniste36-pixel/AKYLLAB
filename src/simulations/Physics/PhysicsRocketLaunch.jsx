import { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Rocket, Info, Zap, Settings, Activity } from 'lucide-react';

export default function PhysicsRocketLaunch() {
  const [fuel, setFuel] = useState(80);
  const [angle, setAngle] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, LAUNCHED, CRASHED, ORBIT
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ alt: 0, speed: 0 });

  const requestRef = useRef();
  
  const G = 0.05; 
  const THRUST_UNIT = 0.022;

  const reset = () => {
    setLaunched(false);
    setStatus('IDLE');
    setPos({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
    setStats({ alt: 0, speed: 0 });
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const launch = () => {
    if (launched) return;
    setLaunched(true);
    setStatus('LAUNCHED');
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = () => {
    setPos(prev => {
      setFuel(f => Math.max(0, f - 0.08));
      
      const realAngle = (angle - 90) * (Math.PI / 180);
      const thrust = fuel > 0 ? THRUST_UNIT : 0;
      
      const ax = Math.cos(realAngle) * thrust;
      const ay = Math.sin(realAngle) * thrust + G;

      const newVx = velocity.x + ax;
      const newVy = velocity.y + ay;
      setVelocity({ x: newVx, y: newVy });

      const newX = prev.x + newVx;
      const newY = prev.y + newVy;

      if (newY >= 0 && launched) {
        if (Math.abs(newVy) > 1.2) {
          setStatus('CRASHED');
          setLaunched(false);
          return { x: newX, y: 0 };
        } else {
          setLaunched(false);
          setStatus('IDLE');
          return { x: newX, y: 0 };
        }
      }

      setStats({
        alt: Math.abs(Math.floor(newY * -10)),
        speed: Math.floor(Math.sqrt(newVx * newVx + newVy * newVy) * 120)
      });

      if (newY < -1800) {
        setStatus('ORBIT');
        setLaunched(false);
      }

      return { x: newX, y: newY };
    });

    if (launched) {
       requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  return (
    <div style={{ padding: '1rem', color: 'var(--text-bright)', display: 'flex', gap: '1.5rem', height: '100%', fontFamily: 'var(--font-mono)' }}>
      
      {/* ─── MAIN VIEWPORT ─── */}
      <div style={{ 
        flex: 1, 
        background: 'radial-gradient(circle at center, #0a0d14 0%, #05070a 100%)', 
        borderRadius: 20, 
        position: 'relative', 
        overflow: 'hidden', 
        border: '1px solid var(--forge-border-lit)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
      }}>
        
        {/* CRT Scanline effect */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))', backgroundSize: '100% 3px, 3px 100%', pointerEvents: 'none', zIndex: 10, opacity: 0.6 }} />

        {/* Space / Earth Background */}
        <div style={{ position: 'absolute', bottom: -pos.y * 0.1, width: '100%', height: '200%', background: 'linear-gradient(to top, #1a2a40 0%, #020617 30%, #000 100%)', opacity: 0.8, transition: 'bottom 0.1s linear' }} />
        
        {/* Stars */}
        <div style={{ position: 'absolute', inset: 0 }}>
           {Array.from({ length: 60 }).map((_, i) => (
             <div key={i} style={{ 
               position: 'absolute', left: `${(i * 17) % 100}%`, top: `${(i * 31) % 100}%`,
               width: 1 + (i % 2), height: 1 + (i % 2), background: '#fff', borderRadius: '50%', opacity: 0.2 + (i % 5) * 0.1,
               animation: 'pulse 2s infinite' 
             }} />
           ))}
        </div>

        {/* Crosshair decoration */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 100, height: 100, border: '1px solid rgba(0,255,179,0.1)', borderRadius: '50%', pointerEvents: 'none' }}>
           <div style={{ position: 'absolute', top: '50%', left: -10, width: 20, height: 1, background: 'rgba(0,255,179,0.3)' }} />
           <div style={{ position: 'absolute', top: '50%', right: -10, width: 20, height: 1, background: 'rgba(0,255,179,0.3)' }} />
           <div style={{ position: 'absolute', top: -10, left: '50%', width: 1, height: 20, background: 'rgba(0,255,179,0.3)' }} />
           <div style={{ position: 'absolute', bottom: -10, left: '50%', width: 1, height: 20, background: 'rgba(0,255,179,0.3)' }} />
        </div>

        {/* Ground */}
        <div style={{ position: 'absolute', bottom: -pos.y, width: '100%', height: 40, borderTop: '2px solid var(--neon-primary)', background: 'linear-gradient(to bottom, rgba(0,255,179,0.05), transparent)', opacity: 0.3 }} />

        {/* ROCKET UNIT */}
        <div style={{ 
          position: 'absolute', 
          bottom: `${100 - pos.y * 0.5}px`, 
          left: `calc(50% + ${pos.x * 0.5}px)`, 
          transform: `translateX(-50%) rotate(${angle}deg)`,
          transition: 'none',
          zIndex: 5
        }}>
          {/* Flame Engine */}
          {launched && fuel > 0 && (
            <div style={{ 
              position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)',
              width: 14, height: 35 + Math.random() * 30, 
              background: 'linear-gradient(to bottom, #fff, #00ffb3, #7c3aed, transparent)', 
              borderRadius: '0 0 50% 50%',
              boxShadow: '0 0 20px #00ffb3, 0 0 40px #7c3aed',
              filter: 'blur(2px)'
            }} />
          )}

          <div style={{ position: 'relative' }}>
             <Rocket size={48} color={status === 'CRASHED' ? '#ef4444' : 'var(--neon-primary)'} style={{ filter: 'drop-shadow(0 0 10px var(--neon-primary))' }} />
             <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 6, height: 12, background: 'rgba(255,255,255,0.4)', borderRadius: 4 }} />
          </div>
        </div>

        {/* MISSION STATUS OVERSCREEN */}
        {status !== 'IDLE' && status !== 'LAUNCHED' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,7,12,0.85)', display: 'grid', placeItems: 'center', zIndex: 100, backdropFilter: 'blur(10px)' }}>
            <div style={{ textAlign: 'center', border: '1px solid var(--forge-border-lit)', padding: '3rem', borderRadius: 32, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem', letterSpacing: '0.3em' }}>MISSION_REPORT_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
              <h1 style={{ color: status === 'ORBIT' ? 'var(--neon-primary)' : '#f43f5e', fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.02em' }}>
                {status === 'ORBIT' ? 'ORBIT_STABILIZED' : 'VEHICLE_LOST'}
              </h1>
              <button 
                className={status === 'ORBIT' ? 'forge-btn-primary' : 'forge-btn-secondary'} 
                onClick={reset}
                style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
              >
                {status === 'ORBIT' ? 'Next Mission' : 'Reinitialize System'}
              </button>
            </div>
          </div>
        )}

        {/* TELEMETRY HUD (Floating) */}
        <div style={{ position: 'absolute', top: 25, left: 25, display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 20 }}>
            {/* Speedometer */}
            <div className="forge-frame" style={{ padding: '0.75rem 1.25rem', borderRadius: 12, minWidth: 160 }}>
               <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: 4 }}>VELOCITY</div>
               <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neon-primary)' }}>{stats.speed}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: 3 }}>km/h</span>
               </div>
               <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.05)', marginTop: 8, borderRadius: 1 }}>
                  <div style={{ width: `${Math.min(100, stats.speed / 120)}%`, height: '100%', background: 'var(--neon-primary)', boxShadow: '0 0 10px var(--neon-primary)' }} />
               </div>
            </div>

            {/* Altimeter */}
            <div className="forge-frame" style={{ padding: '0.75rem 1.25rem', borderRadius: 12 }}>
               <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: 4 }}>ALTITUDE</div>
               <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.alt}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: 3 }}>meters</span>
               </div>
            </div>
        </div>

        {/* Right Corner: Thermal / Fuel Map */}
        <div style={{ position: 'absolute', top: 25, right: 25, zIndex: 20 }}>
           <div className="forge-frame" style={{ padding: '1rem', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: 10 }}>FUEL_RESERVE</div>
              <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto' }}>
                 <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke={fuel < 20 ? '#f43f5e' : 'var(--neon-primary)'} strokeWidth="3" strokeDasharray={`${fuel}, 100`} />
                 </svg>
                 <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                    {Math.floor(fuel)}%
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ─── CONTROL HUB ─── */}
      <div className="forge-frame" style={{ width: 340, padding: '1.75rem', borderRadius: 24, display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10,12,18,0.6)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--forge-border)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,255,179,0.1)', display: 'grid', placeItems: 'center', color: 'var(--neon-primary)' }}>
            <Settings size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>LAUNCH_CONTROL</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>STATION_ID: KAZ_AKYLLAB_01</div>
          </div>
        </div>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Zap size={12} /> PROPELLANT_LOAD
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--neon-primary)' }}>{fuel}%</span>
          </div>
          <input 
            type="range" min="0" max="100" value={fuel} 
            onChange={(e) => setFuel(Number(e.target.value))} 
            disabled={launched}
            style={{ width: '100%', height: 4, borderRadius: 2, accentColor: 'var(--neon-primary)', background: 'rgba(255,255,255,0.1)' }}
          />
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Activity size={12} /> NOZZLE_VECTOR
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{angle}°</span>
          </div>
          <input 
            type="range" min="-45" max="45" value={angle} 
            onChange={(e) => setAngle(Number(e.target.value))} 
            disabled={launched}
            style={{ width: '100%', height: 4, borderRadius: 2, accentColor: 'var(--neon-primary)', background: 'rgba(255,255,255,0.1)' }}
          />
        </section>

        <div style={{ flex: 1, border: '1px dashed var(--forge-border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.5 }}>
           <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>SYSTEM_LOGS:</div>
           <div style={{ fontSize: '0.55rem' }}>// GYRO_STABILIZER: ACTIVE</div>
           <div style={{ fontSize: '0.55rem' }}>// ATM_DENSITY: 1.225 KG/M3</div>
           <div style={{ fontSize: '0.55rem' }}>// RE-ENTRY_SHIELD: NOMINAL</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
          <button className="forge-btn-secondary" onClick={reset} style={{ height: 50, borderRadius: 12 }}>
            <RotateCcw size={18} />
          </button>
          <button 
            className="forge-btn-primary" 
            onClick={launch} 
            disabled={launched || fuel <= 0}
            style={{ height: 50, borderRadius: 12, fontSize: '0.9rem', letterSpacing: '0.1em' }}
          >
            {launched ? 'IGNITION...' : 'LAUNCH'}
          </button>
        </div>
      </div>
      
      {/* Dynamic styles for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
