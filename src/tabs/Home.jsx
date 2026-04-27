import { Link } from 'react-router-dom';
import { Atom, Droplets, Leaf, Calculator, ArrowRight, FlaskConical } from 'lucide-react';

const subjects = [
  { title: 'Физика', icon: Atom, accent: '#3b82f6', desc: 'Механика, термодинамика, квантовые явления — живые кинетические модели.', count: '12 модулей' },
  { title: 'Химия', icon: Droplets, accent: '#ec4899', desc: 'Реакции, электролиз, полимеризация — интерактивные химические среды.', count: '9 модулей' },
  { title: 'Биология', icon: Leaf, accent: '#10b981', desc: 'Фотосинтез, эволюция, ДНК — симуляции живых систем в реальном времени.', count: '7 модулей' },
  { title: 'Математика', icon: Calculator, accent: '#f59e0b', desc: 'Фракталы, хаос, тригонометрия — визуальные математические миры.', count: '5 модулей' },
];

export default function Home() {
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>

      {/* Hero */}
      <section className="forge-hero animate-fade-in">
        <div className="forge-hero-eyebrow">
          <FlaskConical size={12} />
          Интерактивная платформа · {new Date().getFullYear()}
        </div>
        <h1 className="forge-hero-title">
          Наука, которую<br />
          можно <em>потрогать</em>
        </h1>
        <p className="forge-hero-subtitle">
          Akyllab — это 40+ живых STEM-симуляций прямо в браузере. Меняй параметры, наблюдай в реальном времени, понимай физику явлений — не зубри.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/simulations" className="btn btn-primary" style={{ animation: 'pulse-glow 3s infinite' }}>
            Войти в лабораторию <ArrowRight size={16} />
          </Link>
          <Link to="/auth" className="btn btn-ghost">
            Создать аккаунт
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <div className="forge-stats-strip">
        <div className="forge-stat">
          <div className="forge-stat-value">40<span>+</span></div>
          <div className="forge-stat-label">Симуляций</div>
        </div>
        <div className="forge-stat">
          <div className="forge-stat-value">5<span>×</span></div>
          <div className="forge-stat-label">Предметов</div>
        </div>
        <div className="forge-stat">
          <div className="forge-stat-value">60<span>fps</span></div>
          <div className="forge-stat-label">Canvas Engine</div>
        </div>
        <div className="forge-stat">
          <div className="forge-stat-value">0<span>₸</span></div>
          <div className="forge-stat-label">Бесплатно</div>
        </div>
      </div>

      {/* Section heading */}
      <div style={{ padding: '0.5rem 2rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          / предметы
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--forge-border)' }} />
      </div>

      {/* Subject cards */}
      <div className="forge-subjects">
        {subjects.map((sub) => {
          const Icon = sub.icon;
          return (
            <Link
              key={sub.title}
              to="/simulations"
              className="forge-subject-card"
              style={{ '--card-color': sub.accent }}
            >
              <div className="forge-subject-icon" style={{ color: sub.accent }}>
                <Icon size={22} />
              </div>
              <div className="forge-subject-name">{sub.title}</div>
              <div className="forge-subject-desc">{sub.desc}</div>
              <div className="forge-subject-count">{sub.count}</div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '3rem 2rem 1.5rem', borderTop: '1px solid var(--forge-border)', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          © {new Date().getFullYear()} Akyllab · Built with React + Vite + Canvas API
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--neon-primary)', opacity: 0.6 }}>
          v2.0.0 — Neural Forge
        </span>
      </div>
    </div>
  );
}
