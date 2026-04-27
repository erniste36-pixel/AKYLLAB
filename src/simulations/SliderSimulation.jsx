import { useState } from 'react';
import { RefreshCcw, BookmarkPlus, Settings, Database, Activity, Zap, Info, Sliders } from 'lucide-react';

export default function SliderSimulation({ title = "PARAM_SIM", variableA, variableB, calculationHint, color, image }) {
  const [valA, setValA] = useState(variableA?.min || 0);
  const [valB, setValB] = useState(variableB?.min || 0);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('CONTROL'); // CONTROL, HISTORY, HELP

  const primaryColor = color || 'var(--neon-primary)';

  if (!variableA || !variableB) {
    return (
      <div className="forge-frame" style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'rgba(5,7,12,0.4)', borderRadius: 24 }}>
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
           <Sliders size={48} style={{ margin: '0 auto 1rem', color: primaryColor }} />
           <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>MODULE_INIT: WAITING_FOR_VARIABLE_MAP</p>
        </div>
      </div>
    );
  }

  const result = (valA * valB) / 100;

  const recordData = () => {
    setHistory([{ a: valA, b: valB, res: result.toFixed(2), time: new Date().toLocaleTimeString() }, ...history]);
  };

  const reset = () => {
    setValA(variableA.min || 0);
    setValB(variableB.min || 0);
    setHistory([]);
  };
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: '100%', alignItems: 'stretch', color: 'var(--text-bright)', fontFamily: 'var(--font-ui)' }}>
      
      {/* ─── MAIN SIMULATION VIEWPORT ─── */}
      <div className="forge-frame" style={{ 
        background: 'rgba(5,7,12,0.4)', 
        borderRadius: 24, 
        padding: '2.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--forge-border-lit)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
      }}>
        
        {/* HUD Headers */}
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', display: 'flex', gap: '1rem', zIndex: 10 }}>
           <span>PARAM_ANALYZER // V0.44</span>
           <span style={{ color: primaryColor }}>REALTIME_CALC: ACTIVE</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', zIndex: 10, position: 'relative' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <Activity color={primaryColor} size={24} /> {title}
            </h2>
          </div>
          <button className="forge-btn-primary" onClick={recordData} style={{ borderRadius: 12, padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
            <BookmarkPlus size={16} /> LOG_DATA
          </button>
        </div>

        {/* Dynamic Interactive View */}
        <div style={{ flex: 1, position: 'relative', borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--forge-border)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, filter: 'grayscale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.7), transparent)' }} />
          
          {/* Holographic Result Object */}
          <div style={{ 
            width: `${Math.min(400, 100 + valA * 3)}px`, 
            height: `${Math.min(400, 100 + valB * 3)}px`, 
            background: `rgba(var(--neon-primary-rgb, 0,255,179), 0.05)`,
            border: `1px solid ${primaryColor}`,
            borderRadius: 24,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 ${result * 1.5}px ${primaryColor}40, inset 0 0 30px ${primaryColor}20`,
            zIndex: 5,
            animation: 'pulse 4s ease-in-out infinite'
          }}>
            <div style={{ fontSize: '0.65rem', color: primaryColor, fontFamily: 'var(--font-mono)', marginBottom: 10 }}>COMPUTED_OUTPUT</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
              {result.toFixed(2)}
            </div>
            <div style={{ marginTop: 10, border: `1px solid ${primaryColor}`, padding: '2px 8px', borderRadius: 5, fontSize: '0.55rem', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
               STABILITY_SCAN: OK
            </div>
          </div>
          
          {/* Axis Labels */}
          <div style={{ position:'absolute', bottom: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>VAR_A: {valA}</div>
          <div style={{ position:'absolute', top: 20, right: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>VAR_B: {valB}</div>
        </div>

        {/* Global HUD Bottom */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--forge-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', opacity: 0.6 }}>
           <span>UNIT: ANALYZER_X7</span>
           <span>CALC_ENGINE: NEURAL_CORE_V1</span>
        </div>
      </div>

      {/* ─── SIDEBAR CONTROLS ─── */}
      <div className="forge-frame" style={{ 
        display: 'flex', flexDirection: 'column', 
        background: 'rgba(10,12,18,0.6)', 
        borderRadius: 24, overflow: 'hidden', height: '100%',
        border: '1px solid var(--forge-border-lit)'
      }}>
        {/* Top Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--forge-border)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
             <Sliders size={18} color={primaryColor} />
             <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>Параметры</h3>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: 0, lineHeight: '1.4' }}>
             {calculationHint}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--forge-border)', background: 'rgba(0,0,0,0.1)' }}>
          {['CONTROL', 'HISTORY', 'HELP'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '1rem 0', background: 'transparent',
                border: 'none', borderBottom: activeTab === tab ? `2px solid ${primaryColor}` : '2px solid transparent',
                color: activeTab === tab ? 'var(--text-bright)' : 'var(--text-dim)',
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          
          {activeTab === 'CONTROL' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 16, border: '1px solid var(--forge-border)' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--text-dim)' }}>{variableA.name.toUpperCase()}</span>
                    <strong style={{ color: primaryColor }}>{valA} {variableA.unit}</strong>
                  </label>
                  <input 
                    type="range" min={variableA.min} max={variableA.max} step={variableA.step || 1}
                    value={valA} onChange={(e) => setValA(Number(e.target.value))}
                    style={{ width: '100%', accentColor: primaryColor }}
                  />

                  <div style={{ height: '1.5rem' }} />

                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--text-dim)' }}>{variableB.name.toUpperCase()}</span>
                    <strong style={{ color: primaryColor }}>{valB} {variableB.unit}</strong>
                  </label>
                  <input 
                    type="range" min={variableB.min} max={variableB.max} step={variableB.step || 1}
                    value={valB} onChange={(e) => setValB(Number(e.target.value))}
                    style={{ width: '100%', accentColor: primaryColor }}
                  />
                </div>
              </div>

              <button className="forge-btn-secondary" onClick={reset} style={{ width: '100%', height: 48, fontSize: '0.8rem' }}>
                 <RefreshCcw size={16} /> Сбросить данные
              </button>
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: '1rem', overflowY: 'auto', border: `1px solid var(--forge-border)` }}>
                {history.length > 0 ? (
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--forge-border)', color: 'var(--text-dim)' }}>
                        <th style={{ paddingBottom: '0.5rem' }}>VAR_A</th>
                        <th style={{ paddingBottom: '0.5rem' }}>VAR_B</th>
                        <th style={{ paddingBottom: '0.5rem', color: primaryColor }}>VAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.5rem 0', opacity: 0.8 }}>{h.a}</td>
                          <td style={{ padding: '0.5rem 0', opacity: 0.8 }}>{h.b}</td>
                          <td style={{ padding: '0.5rem 0', fontWeight: 800, color: 'var(--text-bright)' }}>{h.res}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 1rem', fontSize: '0.7rem' }}>
                    <Database size={24} style={{ marginBottom: 10, opacity: 0.3, width: '100%' }} />
                    HISTORY_EMPTY
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'HELP' && (
            <div className="animate-fade-in" style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
               <div style={{ borderLeft: `2px solid ${primaryColor}`, paddingLeft: '1rem' }}>
                  Изменяйте значения переменных для наблюдения за динамической трансформацией расчетного объекта. Каждое изменение мгновенно пересчитывает целевой показатель.
               </div>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
