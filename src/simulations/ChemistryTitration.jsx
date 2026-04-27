import { useState, useEffect } from 'react';
import { RefreshCcw, Droplets, TestTube2 } from 'lucide-react';

export default function ChemistryTitration() {
  const [drops, setDrops] = useState(0);
  const [indicatorAdded, setIndicatorAdded] = useState(false);
  const [color, setColor] = useState('rgba(255, 255, 255, 0.1)'); // Transparent/slight white
  const [activeTab, setActiveTab] = useState('Управление');

  // Reaction logic: requires indicator + 5 drops to turn pink
  useEffect(() => {
    if (indicatorAdded && drops >= 5) {
      setColor('rgba(236, 72, 153, 0.7)'); // Pink!
    } else if (indicatorAdded) {
      setColor('rgba(255, 255, 255, 0.2)');
    } else {
      setColor('rgba(255, 255, 255, 0.1)');
    }
  }, [drops, indicatorAdded]);

  const reset = () => {
    setDrops(0);
    setIndicatorAdded(false);
  };

  const isComplete = indicatorAdded && drops >= 5;
  const themeColor = '#ec4899';

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
              <TestTube2 color={themeColor} size={28} /> Лабораторный Стенд
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Визуализация кислотно-основного титрования</p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 1rem' }}>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px', height: '400px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) blur(2px)', zIndex: 0 }}></div>
            
            {/* Overlay messages */}
            {isComplete && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: '2rem', background: '#10b981', color: '#fff', padding: '0.75rem 2rem', borderRadius: '2rem', fontWeight: 'bold', zIndex: 20, boxShadow: '0 10px 20px rgba(16, 185, 129, 0.4)' }}>
                🎉 Реакция успешна! Нейтрализация пройдена.
              </div>
            )}

            {/* CSS Beaker Drawing */}
            <div style={{
              width: '180px', height: '240px',
              border: '4px solid rgba(255,255,255,0.8)',
              borderTop: 'none',
              borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 -20px 50px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.3)',
              zIndex: 10,
              animation: 'float 4s ease-in-out infinite'
            }}>
              {/* Liquid level */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${40 + (drops * 5)}%`,
                background: color,
                transition: 'height 0.3s ease, background 1s ease',
                borderTop: '2px solid rgba(255,255,255,0.4)'
              }}></div>
            </div>
            
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
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#f8fafc' }}>Титрование</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
             Изменение pH среды реактивов.
          </p>
        </div>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: 'rgba(0,0,0,0.2)' }}>
          {['Управление', 'Журнал', 'Справка'].map(tab => (
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
              
              {/* Status Section */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: themeColor, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  ХИМИЧЕСКАЯ СРЕДА
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Объем титранта</span>
                     <span style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '1.2rem' }}>{drops * 0.1} мл</span>
                  </div>
                  <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Среда pH</span>
                     <span style={{ fontWeight: 'bold', color: isComplete ? '#ec4899' : '#3b82f6', fontSize: '1.1rem' }}>
                       {isComplete ? 'Щелочная (>8.2)' : 'Кислая (<8.0)'}
                     </span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: themeColor, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  РЕАГЕНТЫ
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => setIndicatorAdded(true)}
                    disabled={indicatorAdded}
                    style={{ 
                      background: indicatorAdded ? '#10b98120' : 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)', 
                      border: `1px solid ${indicatorAdded ? '#10b981' : '#475569'}`, 
                      color: indicatorAdded ? '#10b981' : '#f8fafc',
                      padding: '1.25rem', borderRadius: '12px', cursor: indicatorAdded ? 'default' : 'pointer',
                      transition: 'all 0.2s', fontWeight: 'bold', fontSize: '1rem'
                    }}
                  >
                    {indicatorAdded ? 'Фенолфталеин (Добавлен ✓)' : 'Добавить Фенолфталеин'}
                  </button>

                  <button
                    onClick={() => setDrops(d => d + 1)}
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColor}, #be185d)`, border: 'none', color: '#fff',
                      padding: '1.25rem', borderRadius: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.2s', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem',
                      boxShadow: `0 4px 15px ${themeColor}40`
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Droplets size={20} /> Капля NaOH (0.1 мл)
                  </button>
                </div>
                
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
                  <RefreshCcw size={18} /> Сбросить опыт
                </button>
              </div>

            </div>
          )}

          {activeTab === 'Журнал' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: themeColor, margin: 0, textTransform: 'uppercase' }}>
                 ПРОТОКОЛ ТИТРОВАНИЯ
              </p>
              <div style={{ flex: 1, background: '#1e293b', borderRadius: '12px', padding: '1.5rem', overflowY: 'auto', border: `1px solid #334155` }}>
                <div style={{ borderLeft: `2px solid ${themeColor}`, paddingLeft: '1rem', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Шаг 1</span> 
                  <span style={{ color: indicatorAdded ? '#10b981' : '#e2e8f0', fontSize: '0.95rem' }}>{indicatorAdded ? 'Индикатор успешно добавлен.' : 'Ожидание индикатора (фенолфталеин).'}</span>
                </div>
                <div style={{ borderLeft: `2px solid ${themeColor}`, paddingLeft: '1rem', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Шаг 2</span> 
                  <span style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>Добавление NaOH: {drops} капель.</span>
                </div>
                <div style={{ borderLeft: `2px solid ${themeColor}`, paddingLeft: '1rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Итог</span> 
                  <span style={{ color: isComplete ? '#ec4899' : '#e2e8f0', fontSize: '0.95rem', fontWeight: isComplete ? 'bold' : 'normal' }}>
                    {isComplete ? 'Точка эквивалентности достигнута (Окрас малиновый).' : 'Реакция идет...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Справка' && (
            <div className="animate-fade-in" style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: themeColor, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                ПОРЯДОК РАБОТЫ
              </p>
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1rem' }}>
                <strong style={{color:'#f8fafc', display:'block', marginBottom:'0.25rem'}}>Цель:</strong>
                Провести нейтрализацию кислоты. Добавьте индикатор (фенолфталеин) и затем по каплям добавляйте щёлочь (NaOH).
              </div>
              <p style={{ color: '#94a3b8' }}>Фенолфталеин — индикатор, который в кислой среде бесцветный, а в щелочной становится малиновым.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
