import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { renderSimulationFrame } from './SimulationEngine';
import { SimulationRegistry } from '../../simulations/SimulationRegistry';

export default function SimulationConceptCard({ simulation, index, onLaunch, qualityTier }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });

  // Intersection observer — only animate when visible
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setIsInView(true); return; }
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => setIsInView(e.isIntersecting)),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInView) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    const render = () => {
      renderSimulationFrame({
        ctx, simulationId: simulation.id,
        color: simulation.accent, isHovered, isActive: false,
        qualityTier, time,
      });
      time++;
      rafRef.current = requestAnimationFrame(render);
    };
    render();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isHovered, isInView, qualityTier, simulation.accent, simulation.id]);

  // Mouse tracking for spotlight effect
  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(0) + '%';
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(0) + '%';
    setMousePos({ x, y });
  };

  const registryItem = SimulationRegistry.find(s => s.id === simulation.id);

  return (
    <article
      ref={cardRef}
      className="concept-card animate-fade-in"
      style={{
        animationDelay: `${(index % 8) * 40}ms`,
        '--accent': simulation.accent,
        '--mx': mousePos.x,
        '--my': mousePos.y,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Media area */}
      <div className="concept-card-media">
        {/* Photo background */}
        {registryItem?.imageUrl && (
          <img src={registryItem.imageUrl} alt={simulation.title} loading="lazy" />
        )}

        {/* Animated canvas overlay */}
        <canvas ref={canvasRef} width={300} height={180} />

        {/* CRT scan-lines */}
        <div className="concept-card-scanlines" />

        {/* HUD corner brackets */}
        <div className="concept-card-hud">
          <div className="forge-frame-tl" style={{ border: '1.5px solid var(--neon-primary)', position: 'absolute', top: 10, left: 10, width: 8, height: 8, borderRight: 'none', borderBottom: 'none', opacity: 0.8 }} />
          <div className="forge-frame-tr" style={{ border: '1.5px solid var(--neon-primary)', position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderLeft: 'none', borderBottom: 'none', opacity: 0.8 }} />
          <div className="forge-frame-bl" style={{ border: '1.5px solid var(--neon-primary)', position: 'absolute', bottom: 10, left: 10, width: 8, height: 8, borderRight: 'none', borderTop: 'none', opacity: 0.8 }} />
          <div className="forge-frame-br" style={{ border: '1.5px solid var(--neon-primary)', position: 'absolute', bottom: 10, right: 10, width: 8, height: 8, borderLeft: 'none', borderTop: 'none', opacity: 0.8 }} />
        </div>

        {/* Glow bleed from bottom */}
        <div className="concept-card-energy" />

        {/* Category badge */}
        <div className="concept-overlay">
          {simulation.category}
        </div>
      </div>

      {/* Content */}
      <div className="concept-card-content">
        <h3>{simulation.title}</h3>

        {/* Engine indicator */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.67rem', color: 'var(--text-dim)' }}>
          {simulation.engine === 'three' ? '// WebGL Scene' : '// Canvas2D Engine'}
        </p>

        <div className="concept-card-footer">
          <span className="concept-tag" style={{ color: simulation.accent }}>
            STEM
          </span>
          {simulation.launchable ? (
            <button
              className="launch-btn"
              type="button"
              onClick={() => onLaunch(simulation)}
            >
              Открыть <ArrowUpRight size={13} />
            </button>
          ) : (
            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              dev mode
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
