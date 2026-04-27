import { Link, useLocation } from 'react-router-dom';
import { Atom, Home, Phone, FlaskConical, BookOpen, Cpu } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import ThemePicker from './ThemePicker';

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { name: 'Главная', path: '/', icon: Home },
      { name: 'Симуляции', path: '/simulations', icon: FlaskConical },
    ]
  },
  {
    label: 'Разделы',
    items: [
      { name: 'Физика', path: '/simulations', icon: Atom },
      { name: 'Химия', path: '/simulations', icon: BookOpen },
      { name: 'Биология', path: '/simulations', icon: Cpu },
    ]
  },
  {
    label: 'Поддержка',
    items: [
      { name: 'Контакты', path: '/contacts', icon: Phone },
    ]
  }
];

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  return (
    <nav className="forge-nav">
      {/* Logo */}
      <Link to="/" className="forge-nav-logo">
        <div className="forge-nav-logo-icon">
          <FlaskConical size={18} color="#07080d" />
        </div>
        <div className="forge-nav-logo-text">
          Akyllab
          <span>science · v2</span>
        </div>
      </Link>

      {/* Nav groups */}
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {group.label && (
            <div className="forge-nav-section">{group.label}</div>
          )}
          {group.items.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`forge-nav-link ${active ? 'active' : ''}`}
              >
                <span className="forge-nav-icon">
                  <Icon size={15} />
                </span>
                {link.name}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Bottom: theme picker + profile */}
      <div className="forge-nav-bottom">
        {/* Theme picker row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', flex: 1 }}>
            Тема фона
          </span>
          <ThemePicker />
        </div>

        {/* Profile */}
        <Link
          to="/auth"
          className="forge-nav-link"
          style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem', padding: '0.75rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: user ? 'linear-gradient(135deg, var(--neon-primary), var(--neon-accent))' : 'rgba(255,255,255,0.08)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              fontSize: '0.75rem', fontWeight: '700', color: '#07080d'
            }}>
              {user ? user.email?.[0]?.toUpperCase() : '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user ? user.email : 'Войти в систему'}
              </div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                {user ? 'Студент' : 'Гость'}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </nav>
  );
}
