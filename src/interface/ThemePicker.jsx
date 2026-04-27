import { useState } from 'react';
import { Palette, X, Check } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemePicker() {
  const { themeKey, setThemeKey, themes } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        title="Сменить тему"
        style={{
          width: 34, height: 34,
          borderRadius: 8,
          border: '1px solid var(--forge-border)',
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--neon-primary)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      >
        <Palette size={15} />
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 200 }}
          />

          {/* Picker panel */}
          <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '260px',
            zIndex: 201,
            background: 'rgba(7,8,13,0.95)',
            border: '1px solid var(--forge-border-lit)',
            borderRadius: 16,
            padding: '1.25rem',
            width: 280,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,179,0.05)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Тема интерфейса</div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 2 }}>
                  Цвет фона и акцентов
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--forge-border)', background: 'transparent', color: 'var(--text-mid)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={13} />
              </button>
            </div>

            {/* Theme swatches */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.entries(themes).map(([key, t]) => {
                const active = themeKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setThemeKey(key); setOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 10,
                      border: active ? `1px solid ${t.primary}` : '1px solid var(--forge-border)',
                      background: active ? `rgba(${hexToRgb(t.primary)},0.08)` : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      fontFamily: 'var(--font-ui)',
                    }}
                    onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  >
                    {/* Color dot */}
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                      flexShrink: 0,
                      boxShadow: active ? `0 0 12px ${t.primary}` : 'none',
                      display: 'grid',
                      placeItems: 'center',
                    }}>
                      {active && <Check size={13} color={t.bg} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: active ? t.primary : 'var(--text-mid)' }}>
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live preview swatch */}
            <div style={{
              marginTop: '1rem',
              height: 6,
              borderRadius: 3,
              background: `linear-gradient(90deg, var(--neon-primary), var(--neon-accent))`,
              opacity: 0.6,
            }} />
          </div>
        </>
      )}
    </>
  );
}

// Helper — simple hex to rgb (e.g. "#00ffb3" → "0,255,179")
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2), 16);
  const g = parseInt(h.substring(2,4), 16);
  const b = parseInt(h.substring(4,6), 16);
  return `${r},${g},${b}`;
}
