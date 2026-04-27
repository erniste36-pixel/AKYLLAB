import { useParams, Link } from 'react-router-dom';
import { useState, Suspense } from 'react';
import { ArrowLeft, Share2, Maximize2, Info, Code } from 'lucide-react';
import { SimulationRegistry } from '../simulations/SimulationRegistry';

export default function ActiveSimulation() {
  const { id } = useParams();
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  const simData = SimulationRegistry.find(s => s.id === id);

  if (!simData) {
    return (
      <div className="forge-main-inner" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--neon-primary)', marginBottom: '1rem' }}>Модуль не найден</h2>
          <Link to="/simulations" className="forge-btn-primary">Вернуться в каталог</Link>
        </div>
      </div>
    );
  }

  const SimComponent = simData.component;

  return (
    <div className="forge-main-inner" style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div className="forge-frame" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '1.25rem 2rem', 
        borderRadius: 16,
        marginBottom: '2rem',
        gap: '1.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      }}>
        {/* Corner Accents */}
        <div className="forge-frame-tl" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', top: -2, left: -2, width: 12, height: 12, borderRight: 'none', borderBottom: 'none' }} />
        <div className="forge-frame-tr" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderLeft: 'none', borderBottom: 'none' }} />
        <div className="forge-frame-bl" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', bottom: -2, left: -2, width: 12, height: 12, borderRight: 'none', borderTop: 'none' }} />
        <div className="forge-frame-br" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderLeft: 'none', borderTop: 'none' }} />

        <Link to="/simulations" className="forge-btn-icon" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <ArrowLeft size={20} />
        </Link>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
             <span style={{ color: 'var(--neon-primary)', fontSize: '1.25rem' }}>{simData.icon}</span>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{simData.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              ID: {id.toUpperCase()}
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--forge-border)' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              CORE V2.4 / QUANTUM ENGINE
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="forge-btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', gap: '0.5rem' }} onClick={() => setShowEmbedModal(true)}>
             <Code size={14} /> Встроить
          </button>
          <button className="forge-btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', gap: '0.5rem' }}>
             <Share2 size={14} /> Поделиться
          </button>
        </div>
      </div>

      {/* Main Simulation Frame */}
      <div className="forge-frame" style={{ 
        flex: 1, 
        minHeight: '600px', 
        borderRadius: 20, 
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 90px rgba(0,0,0,0.5)',
        border: '1px solid var(--forge-border-lit)'
      }}>
        {/* Frame Header Decoration */}
        <div style={{ 
          height: 32, 
          background: 'rgba(255,255,255,0.03)', 
          borderBottom: '1px solid var(--forge-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', opacity: 0.6 }}>
            SYSTEM_STATUS: STABLE_INIT // RENDER_MODE: GPU_ACCELERATED
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <Info size={12} color="var(--text-dim)" />
             <Maximize2 size={12} color="var(--text-dim)" />
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
          <Suspense fallback={
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 40, height: 40, 
                    border: '3px solid var(--neon-primary)', 
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1.5rem'
                  }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--neon-primary)' }}>
                    INITIALIZING_DATA_STREAM...
                  </p>
               </div>
            </div>
          }>
            <div style={{ height: '100%', padding: '1rem' }}>
               <SimComponent />
            </div>
          </Suspense>
        </div>

        {/* Frame Footer Decoration */}
        <div style={{ 
          height: 24, 
          borderTop: '1px solid var(--forge-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          fontSize: '0.6rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-dim)',
          justifyContent: 'space-between',
          opacity: 0.5
        }}>
          <span>DATA_LOAD_COMPLETE</span>
          <span>© 2024 AKYLLAB_SCIENTIFIC_SYSTEMS</span>
        </div>

        {/* External corner markers */}
        <div className="forge-frame-tl" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderRight: 'none', borderBottom: 'none' }} />
        <div className="forge-frame-tr" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderLeft: 'none', borderBottom: 'none' }} />
        <div className="forge-frame-bl" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderRight: 'none', borderTop: 'none' }} />
        <div className="forge-frame-br" style={{ border: '2px solid var(--neon-primary)', position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderLeft: 'none', borderTop: 'none' }} />
      </div>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div onClick={() => setShowEmbedModal(false)} style={{ 
          position: 'fixed', inset: 0, zIndex: 1000, 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center'
        }}>
          <div onClick={e => e.stopPropagation()} className="forge-frame" style={{ 
            width: '100%', maxWidth: 600, padding: '2.5rem', borderRadius: 24, 
            boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
            border: '1px solid var(--forge-border-lit)'
          }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Код интеграции</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Используйте этот фрагмент кода для встраивания симуляции в ваши учебные материалы.
            </p>
            
            <div style={{ 
              background: 'rgba(0,0,0,0.4)', padding: '1.25rem', borderRadius: 12, 
              border: '1px solid var(--forge-border)', fontFamily: 'var(--font-mono)', 
              fontSize: '0.8rem', color: 'var(--neon-primary)', marginBottom: '1.5rem',
              wordBreak: 'break-all'
            }}>
              {`<iframe src="https://akyllab.ai/embed/sim/${id}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="forge-btn-secondary" onClick={() => setShowEmbedModal(false)}>Закрыть</button>
              <button className="forge-btn-primary" onClick={() => {
                navigator.clipboard.writeText(`<iframe src="https://akyllab.ai/embed/sim/${id}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`);
                setShowEmbedModal(false);
              }}>Скопировать код</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
