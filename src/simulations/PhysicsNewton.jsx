import { useState, useEffect } from 'react';
import { RefreshCcw, Play, Compass } from 'lucide-react';

export default function PhysicsNewton() {
  const [mass, setMass] = useState(5); // kg
  const [force, setForce] = useState(10); // N
  const [running, setRunning] = useState(false);
  const [position, setPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('Управление');

  // Math F = m * a => a = F/m
  const acceleration = force / mass;
  const themeColor = '#3b82f6';

  useEffect(() => {
    let interval;
    if (running && position < 100) {
      interval = setInterval(() => {
        setPosition(prev => {
          const newPos = prev + (acceleration * 0.5); // Simplified physics loop
          if (newPos >= 100) {
            setRunning(false);
            return 100;
          }
          return newPos;
        });
      }, 50); // 20 FPS
    }
    return () => clearInterval(interval);
  }, [running, position, acceleration]);

  const reset = () => {
    setRunning(false);
    setPosition(0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 2fr) minmax(320px, 400px)', gap: '1.5rem', height: '100%', alignItems: 'stretch' }}>
      
      {/* --------------------
          VISUAL CANVAS (LEFT)
          -------------------- */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '16px', 
        minHeight: '600px',
        padding: '2.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative', 
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        color: '#1e293b'
      }}>
        
        {/* Subtle Background Graphic */}
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', background: `radial-gradient(circle, ${themeColor}20 0%, transparent 70%)`, opacity: 0.8, zIndex: 0, animation: 'pulse-glow 5s infinite' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', zIndex: 1, position: 'relative' }}>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
              <Compass color={themeColor} size={28} /> Физический Полигон
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Второй закон Ньютона: Механика</p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 1rem' }}>
          
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', width: '100%', maxWidth: '700px', height: '350px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) blur(1px)', zIndex: 0 }}></div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 5, width: '100%' }}>
              {/* Ground Line */}
              <div style={{ position: 'absolute', bottom: '20%', width: '100%', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius:'2px' }}></div>
              
              {/* Physics Block */}
              <div style={{ 
                position: 'absolute', bottom: 'calc(20% + 4px)',
                left: `${position * 0.8}%`, // Scale to 80% to fit screen
                width: `${40 + (mass * 2)}px`, height: `${40 + (mass * 2)}px`, 
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: '2px solid white',
                borderRadius: '8px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontWeight: 'bold', fontSize: '0.85rem', color: '#fff',
                transition: running ? 'none' : 'left 0.3s ease',
                boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
              }}>
                {mass} kg
              </div>

              {/* Forward arrow mapping force */}
              <div style={{
                position: 'absolute', bottom: 'calc(20% + 20px)',
                left: `calc(${position * 0.8}% + ${40 + (mass * 2)}px)`,
                width: `${force * 2}px`, height: '4px', background: '#ef4444',
                opacity: running ? 1 : 0.5,
                transition: running ? 'none' : 'left 0.3s ease'
              }}>
                <div style={{ position: 'absolute', right: '-10px', top: '-6px', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '10px solid #ef4444' }}></div>
              </div>
            </div>

            {position >= 100 && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '0.75rem 2rem', borderRadius: '2rem', fontWeight: 'bold', zIndex: 10, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.4)' }}>
                Цель достигнута!
              </div>
            )}
          </div>

        </div>
      </div>

      {/* --------------------
          RIGHT SIDEBAR CONTROLS
          -------------------- */}
      <div className="glass-card" style={{ 
        display: 'flex', flexDirection: 'column', 
        background: '#0f172a', border: '1px solid #1e293b', 
        borderRadius: '16px', overflow: 'hidden', height: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header inside Top of Sidebar */}
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid currentColor', borderColor: `${themeColor}40` }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Второй закон Ньютона</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
             Изучение зависимости ускорения от массы и силы.
          </p>
        </div>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: 'rgba(0,0,0,0.2)' }}>
          {['Управление', 'Справка'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '1rem 0', background: 'transparent',
                border: 'none', borderBottom: activeTab === tab ? `2px solid ${themeColor}` : '2px solid transparent',
                color: activeTab === tab ? '#f8fafc' : '#64748b',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer', transition: 'all 0.2s',
                fontSize: '0.9rem'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          
          {activeTab === 'Управление' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Sliders Widget */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: themeColor, marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                  ВВОДНЫЕ ДАННЫЕ
                </p>
                <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#cbd5e1' }}>Масса (m)</span>
                    <strong style={{ color: themeColor }}>{mass} kg</strong>
                  </label>
                  <input 
                    type="range" min="1" max="20" step="1"
                    value={mass} onChange={(e) => setMass(Number(e.target.value))}
                    disabled={running || position > 0}
                    style={{ width: '100%', margin: '0 0 2rem 0', cursor: (running || position > 0) ? 'default' : 'grab', accentColor: themeColor, opacity: (running || position > 0) ? 0.5 : 1 }}
                  />

                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#cbd5e1' }}>Сила (F)</span>
                    <strong style={{ color: themeColor }}>{force} N</strong>
                  </label>
                  <input 
                    type="range" min="1" max="50" step="1"
                    value={force} onChange={(e) => setForce(Number(e.target.value))}
                    disabled={running || position > 0}
                    style={{ width: '100%', margin: '0', cursor: (running || position > 0) ? 'default' : 'grab', accentColor: '#ef4444', opacity: (running || position > 0) ? 0.5 : 1 }}
                  />
                </div>
              </div>

              {/* Status Section */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: themeColor, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  РАСЧЁТНЫЙ РЕЗУЛЬТАТ
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Ускорение (a)</span>
                     <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.2rem' }}>{acceleration.toFixed(2)} m/s²</span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: themeColor, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  ДЕЙСТВИЯ
                </p>
                
                <button 
                  onClick={() => setRunning(true)} 
                  disabled={running || position >= 100}
                  style={{ 
                    width: '100%', background: `linear-gradient(135deg, ${themeColor}, #1d4ed8)`, border: 'none', color: '#fff',
                    padding: '1.25rem', borderRadius: '12px', cursor: (running || position >= 100) ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    transition: 'all 0.2s', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem',
                    opacity: (running || position >= 100) ? 0.5 : 1
                  }}
                  onMouseOver={e => {if(!(running || position >= 100)) e.currentTarget.style.transform = 'translateY(-2px)'}}
                  onMouseOut={e => {if(!(running || position >= 100)) e.currentTarget.style.transform = 'translateY(0)'}}
                >
                  <Play size={20} /> Начать движение
                </button>
                
                <button 
                  onClick={reset}
                  style={{ 
                    width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                    padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s', fontWeight: '500'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#334155'}
                  onMouseOut={e => e.currentTarget.style.background = '#1e293b'}
                >
                  <RefreshCcw size={18} /> Сбросить позицию
                </button>
              </div>

            </div>
          )}

          {activeTab === 'Справка' && (
            <div className="animate-fade-in" style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: themeColor, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                ФОРМУЛА (F = ma)
              </p>
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1rem' }}>
                <strong style={{color:'#f8fafc', display:'block', marginBottom:'0.25rem'}}>Ускорение (a) = Сила (F) / Масса (m)</strong>
                Чем больше масса объекта, тем меньшее ускорение он получит при фиксированной приложенной силе (Длина красного вектора).
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
