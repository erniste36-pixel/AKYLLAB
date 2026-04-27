import { useState } from 'react';
import { RefreshCcw, CheckCircle2, XCircle, BrainCircuit, Play, RotateCcw, Info, Settings, LayoutList, Database, Zap, Activity, Code } from 'lucide-react';

export default function QuizSimulation({ questions = [], color, image }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [activeTab, setActiveTab] = useState('DATA'); // DATA, TASKS, INFO

  const primaryColor = color || 'var(--neon-primary)';

  if (!questions || questions.length === 0) {
    return (
      <div className="forge-frame" style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'rgba(5,7,12,0.4)', borderRadius: 24 }}>
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
           <BrainCircuit size={48} style={{ margin: '0 auto 1rem', color: primaryColor }} />
           <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>MODULE_INIT: WAITING_FOR_DATA_STREAM</p>
        </div>
      </div>
    );
  }

  const handleAnswer = (isCorrect, idx) => {
    setSelectedOpt(idx);
    if (isCorrect) setScore(s => s + 1);
    
    setTimeout(() => {
      setSelectedOpt(null);
      setShowHint(false);
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  const useHint = () => {
    setHintsUsed(h => h + 1);
    setShowHint(true);
  };

  const reset = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelectedOpt(null);
    setHintsUsed(0);
    setShowHint(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: '100%', alignItems: 'stretch', color: 'var(--text-bright)', fontFamily: 'var(--font-ui)' }}>
      
      {/* ─── MAIN ANALYSIS VIEWPORT ─── */}
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
        
        {/* CRT Scanline Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.01), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.01))', backgroundSize: '100% 3px, 3px 100%', pointerEvents: 'none', zIndex: 1, opacity: 0.5 }} />

        {/* HUD Details */}
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', display: 'flex', gap: '1rem', zIndex: 2 }}>
           <span>SYSTEM_SCAN // PASS_{currentQ + 1}</span>
           <span>LATENCY: 1.2ms</span>
        </div>

        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 2 }}>
           <div style={{ background: `rgba(var(--neon-primary-rgb, 0,255,179), 0.1)`, border: `1px solid ${primaryColor}`, color: primaryColor, padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
             PROGRESS: {currentQ + 1}/{questions.length}
           </div>
        </div>

        {/* Content Area */}
        <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'all 0.3s' }}>
          {showResult ? (
            <div className="animate-fade-in" style={{ textAlign: 'center', margin: 'auto', padding: '3rem', borderRadius: 32, border: '1px solid var(--forge-border-lit)', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
              <div className="forge-frame-tl" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', top: -2, left: -2, width: 12, height: 12, borderRight: 'none', borderBottom: 'none' }} />
              <div className="forge-frame-br" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderLeft: 'none', borderTop: 'none' }} />
              
              <CheckCircle2 size={64} color="var(--neon-primary)" style={{ margin: '0 auto 1.5rem auto' }} />
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Анализ завершен</h2>
              <div style={{ fontSize: '1.25rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '2rem' }}>
                 SCORE: <span style={{ color: 'var(--neon-primary)' }}>{score}</span> / {questions.length}
              </div>
              <button className="forge-btn-primary" onClick={reset} style={{ padding: '0.8rem 2rem' }}>
                 <RotateCcw size={16} /> Начать заново
              </button>
            </div>
          ) : (
            <div className="animate-fade-in" key={currentQ} style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
              
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'flex-start' }}>
                 <div style={{ width: 48, height: 48, borderRadius: 12, border: '1px solid var(--forge-border-lit)', display: 'grid', placeItems: 'center', color: primaryColor, flexShrink: 0 }}>
                    <Database size={24} />
                 </div>
                 <h2 style={{ margin: 0, fontSize: '1.85rem', lineHeight: '1.3', fontWeight: 800, letterSpacing: '-0.01em' }}>{questions[currentQ].q}</h2>
              </div>
              
              {showHint && (
                <div className="animate-fade-in" style={{ background: `rgba(var(--neon-primary-rgb, 0,255,179), 0.06)`, border: `1px solid ${primaryColor}`, padding: '1.25rem', marginBottom: '2rem', borderRadius: 16, fontSize: '0.9rem', color: 'var(--text-bright)', display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative' }}>
                   <div style={{ position: 'absolute', top: -10, left: 20, background: 'var(--forge-bg)', padding: '0 8px', fontSize: '0.65rem', color: primaryColor, fontFamily: 'var(--font-mono)' }}>HINT_RECOVERY</div>
                   <BrainCircuit size={20} color={primaryColor} style={{flexShrink:0}}/>
                   <div style={{ lineHeight: '1.6', opacity: 0.9 }}>{questions[currentQ].hint}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {questions[currentQ].options.map((opt, idx) => {
                  const isSelected = selectedOpt === idx;
                  const isCorrect = opt.correct;
                  const showTruth = selectedOpt !== null && isCorrect;
                  const showError = isSelected && !isCorrect;

                  let borderColor = 'var(--forge-border)';
                  let bg = 'rgba(255,255,255,0.03)';
                  if (showTruth) { borderColor = 'var(--neon-primary)'; bg = 'rgba(0,255,179,0.06)'; }
                  if (showError) { borderColor = '#ef4444'; bg = 'rgba(239,68,68,0.06)'; }
                  
                  return (
                    <button 
                      key={idx}
                      disabled={selectedOpt !== null}
                      onClick={() => handleAnswer(isCorrect, idx)}
                      style={{ 
                        padding: '1.25rem 1.5rem', borderRadius: '16px', textAlign: 'left',
                        background: bg, border: `1px solid ${borderColor}`,
                        color: 'var(--text-bright)', cursor: 'pointer', transition: 'all 0.2s ease',
                        fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
                        boxShadow: isSelected ? `0 0 20px ${borderColor}20` : 'none',
                        fontFamily: 'var(--font-ui)'
                      }}
                      onMouseEnter={e => selectedOpt === null && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => selectedOpt === null && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    >
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', border: '1px solid currentColor',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0,
                        fontSize: '0.8rem', fontFamily: 'var(--font-mono)', opacity: 0.6
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      
                      <span style={{ fontWeight: '600', flex: 1, lineHeight: '1.4' }}>{opt.text}</span>
                      
                      {showTruth && <CheckCircle2 color="var(--neon-primary)" size={20} />}
                      {showError && <XCircle color="#ef4444" size={20} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Global HUD Bottom */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, borderTop: '1px solid var(--forge-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', opacity: 0.6 }}>
           <span>ID: QUZ_STRM_{Math.random().toString(36).substr(2,4).toUpperCase()}</span>
           <span>RENDER: ACCEL_GPU</span>
           <span>SEC_STATUS: NOMINAL</span>
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
             <Code size={18} color={primaryColor} />
             <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Управление</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0, lineHeight: '1.5' }}>
             Анализируйте данные и подтверждайте гипотезы через терминал.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--forge-border)', background: 'rgba(0,0,0,0.1)' }}>
          {['DATA', 'STATS', 'INFO'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '1rem 0', background: 'transparent',
                border: 'none', borderBottom: activeTab === tab ? `2px solid ${primaryColor}` : '2px solid transparent',
                color: activeTab === tab ? 'var(--text-bright)' : 'var(--text-dim)',
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                fontSize: '0.7rem', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          
          {activeTab === 'DATA' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Visual Box */}
              <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--forge-border)', position: 'relative' }}>
                 <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 4, fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: primaryColor }}>CAM_01</div>
                 <img src={image} alt="Ref" style={{ width: '100%', height: 160, objectFit: 'cover', opacity: 0.7 }} />
                 <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000, transparent)' }} />
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <div className="forge-frame" style={{ padding: '0.8rem 1rem', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>THREAT_LVL</span>
                     <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--neon-primary)' }}>MINIMAL</span>
                  </div>
                  <div className="forge-frame" style={{ padding: '0.8rem 1rem', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>AI_SYNCH</span>
                     <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>ACTIVE</span>
                  </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <button 
                    className="forge-btn-secondary" 
                    onClick={useHint} 
                    disabled={showHint || selectedOpt !== null || showResult}
                    style={{ height: 48, fontSize: '0.8rem' }}
                  >
                    <BrainCircuit size={16} /> Анализ данных ИИ
                  </button>
                  <button className="forge-btn-icon" onClick={reset} style={{ width: '100%', height: 48, borderRadius: 12 }}>
                    <RotateCcw size={16} /> Сброс системы
                  </button>
              </div>
            </div>
          )}

          {activeTab === 'STATS' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ textAlign: 'center', padding: '2rem 1rem', borderRadius: 20, border: '1px solid var(--forge-border)', background: 'rgba(0,255,179,0.03)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>TOTAL_VALID_DATA</div>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: primaryColor }}>{score} / {questions.length}</div>
               </div>
               <div className="forge-frame" style={{ padding: '1rem', borderRadius: 16 }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: 10 }}>ERR_LOGS:</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: '#ef4444' }}>
                     {score < currentQ ? `// MISMATCH: ${currentQ - score} DATAPOINTS` : '// NO_ERR_DETECTED'}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'INFO' && (
            <div className="animate-fade-in" style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: '1.6' }}>
               <div style={{ borderLeft: `2px solid ${primaryColor}`, paddingLeft: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-bright)', marginBottom: 4 }}>PROCEDURE_01</div>
                  Изучите представленные на основном дисплее данные и сформируйте логическую связь.
               </div>
               <div style={{ borderLeft: `2px solid ${primaryColor}`, paddingLeft: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-bright)', marginBottom: 4 }}>PROCEDURE_02</div>
                  Используйте ИИ для восстановления поврежденных участков логики.
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
