import { Link } from 'react-router-dom';

export default function SubjectCard({ title, icon, color, description, delay = 0 }) {
  return (
    <Link to="/simulations" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', animationDelay: `${delay}ms` }}>
        <div style={{ 
            background: `linear-gradient(135deg, ${color}, #000)`, 
            width: '80px', height: '80px', 
            borderRadius: '50%', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: `0 0 20px ${color}80`
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>
    </Link>
  );
}
