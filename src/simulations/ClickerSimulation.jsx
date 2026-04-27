import { useState } from 'react';
import { RefreshCcw, Hand, Terminal, AlertCircle, Play, Activity, Database, CheckCircle2 } from 'lucide-react';

export default function ClickerSimulation({ title = "SYSTEM_MODULE", steps = [], color, image }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('STEPS'); // STEPS, LOGS, HELP

  const primaryColor = color || 'var(--neon-primary)';

  if (!steps || steps.length === 0) {
    return (
      <div className="forge-frame" style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'rgba(5,7,12,0.4)', borderRadius: 24 }}>
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
           <Hand size={48} style={{ margin: '0 auto 1rem', color: primaryColor }} />
           <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>MODULE_INIT: WAITING_FOR_SEQUENCE_DATA</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      const stepData = steps[currentStep];
      setLogs(prev => [
        { time: new Date().toLocaleTimeString(), msg: `EXEC: ${stepData.actionText}` },
        ...prev
      ]);
      setCurrentStep(c => c + 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setLogs([]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: '100%', alignItems: 'stretch', color: 'var(--text-bright)', fontFamily: 'var(--font-ui)' }}>
      
      {/* ─── MAIN VIEWPORT ─── */}
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
        
        {/* HUD Details */}
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', display: 'flex', gap: '1rem', zIndex: 10 }}>
           <span>SYS_CONTROLLER // EVNT_V2.9</span>
           <span style={{ color: primaryColor }}>ACTIVE_PHASE: {currentStep}</span>
        </div>

        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
           <div style={{ background: `rgba(var(--neon-primary-rgb, 0,255,179), 0.1)`, border: `1px solid ${primaryColor}`, color: primaryColor, padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
             STEP: {currentStep}/{steps.length}
           </div>
        </div>

        {/* Visual Engine View */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '400px', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--forge-border)' }}>
             <div style={{ 
               position: 'absolute', inset: 0, 
               backgroundImage: `url(${image})`, 
               backgroundSize: 'cover', backgroundPosition: 'center',
               filter: `blur(${Math.max(0, 10 - currentStep * 3)}px) grayscale(${Math.max(0, 1 - currentStep/steps.length)})`,
               transform: `scale(${1 + currentStep * 0.04})`,
               transition: 'all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1)',
               opacity: 0.4 + (currentStep / steps.length) * 0.6
             }} />
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
             
             {/* Progress lines */}
             <div style={{ position: 'absolute', top: 0, left: 0, height: 4, width: `${(currentStep / steps.length) * 100}%`, background: primaryColor, boxShadow: `0 0 15px ${primaryColor}`, transition: 'width 0.8s ease' }} />

             {currentStep >= steps.length && (
               <div className="animate-fade-in" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(5,7,12,0.7)', backdropFilter: 'blur(8px)' }}>
                 <div style={{ textAlign: 'center' }}>
                   <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,255,179,0.1)', color: 'var(--neon-primary)', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem auto', border: '1px solid var(--neon-primary)' }}>
                     <CheckCircle2 size={32} />
                   </div>
                   <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>ПРОЦЕСС ЗАВЕРШЕН</h2>
                   <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>ALL_SEQUENCES_STABILIZED // 100%</p>
                   <button className="forge-btn-secondary" onClick={reset} style={{ marginTop: '2rem' }}>Повторный запуск</button>
                 </div>
               </div>
             )}
          </div>

        </div>

        {/* Global HUD Bottom */}
        <div style={{ borderTop: '1px solid var(--forge-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', opacity: 0.6 }}>
           <span>ENGINE_ID: CLK_MOD_0{currentStep}</span>
           <span>STATUS: {currentStep < steps.length ? 'PROCESSING' : 'COMPLETED'}</span>
           <span>DATA_CORRECTION: AUTO</span>
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
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>{title}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0, lineHeight: '1.4' }}>
             Инициируйте системные события для продвижения по цепочке анализа.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--forge-border)', background: 'rgba(0,0,0,0.1)' }}>
          {['STEPS', 'LOGS', 'HELP'].map(tab => (
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

        {/* Content Area */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          
          {activeTab === 'STEPS' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {steps.map((step, idx) => {
                  const isActive = idx === currentStep;
                  const isPassed = idx < currentStep;
                  
                  return (
                    <div key={idx} style={{ 
                      padding: '1rem', borderRadius: '12px', 
                      background: isPassed ? `rgba(var(--neon-primary-rgb, 0,255,179), 0.04)` : (isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'),
                      border: `1px solid ${isActive ? primaryColor : (isPassed ? `rgba(var(--neon-primary-rgb, 0,255,179), 0.2)` : 'var(--forge-border)')}`,
                      transition: 'all 0.3s ease',
                      opacity: idx > currentStep ? 0.3 : 1,
                      display: 'flex', gap: '1rem'
                    }}>
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                        background: isPassed ? primaryColor : 'transparent', 
                        border: isPassed ? 'none' : `1px solid ${isActive ? primaryColor : 'var(--text-dim)'}`,
                        color: isPassed ? '#07080d' : (isActive ? primaryColor : 'var(--text-dim)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem'
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isPassed ? primaryColor : 'inherit' }}>{step.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Area */}
              <div style={{ marginTop: '1rem' }}>
                {currentStep < steps.length ? (
                  <button 
                    onClick={handleNext}
                    className="forge-btn-primary"
                    style={{ width: '100%', height: 48, fontSize: '0.9rem' }}
                  >
                    <Play size={16} /> {steps[currentStep].actionText}
                  </button>
                ) : (
                  <div className="forge-frame" style={{ textAlign: 'center', color: primaryColor, padding: '1rem', borderRadius: 12, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                     PHASE_CHAIN_COMPLETE
                  </div>
                )}
                
                <button 
                  onClick={reset}
                  className="forge-btn-secondary"
                  style={{ width: '100%', height: 48, marginTop: '0.75rem', fontSize: '0.8rem' }}
                >
                  <RefreshCcw size={16} /> Сброс системы
                </button>
              </div>

            </div>
          )}

          {activeTab === 'LOGS' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: '1rem', overflowY: 'auto', border: `1px solid var(--forge-border)` }}>
                {logs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {logs.map((l, i) => (
                      <div key={i} style={{ borderLeft: `1px solid ${primaryColor}`, paddingLeft: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>[{l.time}]</span> {l.msg}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 1rem', fontSize: '0.7rem' }}>
                    <Terminal size={24} style={{ marginBottom: 10, opacity: 0.3, width: '100%' }} />
                    WAITING_FOR_DATA_EVENTS...
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'HELP' && (
            <div className="animate-fade-in" style={{ fontSize: '0.8rem', lineHeight: '1.6', color: 'var(--text-dim)' }}>
               <div style={{ borderLeft: `2px solid ${primaryColor}`, paddingLeft: '1rem' }}>
                  Для активации следующей фазы процесса нажмите на главную кнопку действия. Каждый этап размывает границу между данными и визуализацией.
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
