import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function LiveCard({ sim, style }) {
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // --- УНИВЕРСАЛЬНЫЙ АНИМАЦИОННЫЙ ФОН ПРЕВЬЮ (ЧАСТИЦЫ) ---
    const numParticles = 40;
    const particles = Array.from({length: numParticles}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 2 + 1
    }));

    const drawParticlesPreview = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // Движение при наведении
        if (isHovered) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = sim.color || '#38bdf8';
        ctx.fill();
      });

      // Линии между близкими частицами
      ctx.lineWidth = 0.5;
      for(let i=0; i<particles.length; i++) {
        for(let j=i+1; j<particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 40) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `${sim.color || '#38bdf8'}${Math.floor((1 - dist/40) * 100).toString(16).padStart(2, '0')}`;
            ctx.stroke();
          }
        }
      }
    };

    // --- ПРЕВЬЮ ОПТИКИ (ДЛЯ СИМУЛЯЦИИ id = 2) ---
    const drawOpticsPreview = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const t = time * 0.05;
      
      // Среды
      ctx.fillStyle = '#1e293b'; 
      ctx.fillRect(0, 0, w, h/2);
      ctx.fillStyle = '#0f172a'; 
      ctx.fillRect(0, h/2, w, h/2);

      // Меняем угол при ховере
      const angle = isHovered ? Math.sin(t) * 0.3 : -0.2;
      
      ctx.beginPath();
      ctx.moveTo(w/2 - Math.sin(angle)*100, h/2 - Math.cos(angle)*100);
      ctx.lineTo(w/2, h/2);
      ctx.strokeStyle = '#f43f5e'; // Лазер Воздух
      ctx.lineWidth = 3;
      ctx.stroke();

      const refractedAngle = angle * 0.6; // n2 > n1
      ctx.beginPath();
      ctx.moveTo(w/2, h/2);
      ctx.lineTo(w/2 + Math.sin(refractedAngle)*100, h/2 + Math.cos(refractedAngle)*100);
      ctx.strokeStyle = '#38bdf8'; // Лазер Стекло
      ctx.stroke();

      // Нормаль
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(w/2, 10);
      ctx.lineTo(w/2, h - 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawMechanicsPreview = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const blockX = w/2;
        const blockY = h/2 + 20;

        // Поверхность
        ctx.beginPath();
        ctx.moveTo(0, blockY + 20);
        ctx.lineTo(w, blockY + 20);
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        // Блок
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(blockX - 30, blockY - 20, 60, 40);
        ctx.strokeStyle = sim.color || '#3b82f6';
        ctx.strokeRect(blockX - 30, blockY - 20, 60, 40);

        // Вектор силы тяжести
        ctx.beginPath();
        ctx.moveTo(blockX, blockY);
        ctx.lineTo(blockX, blockY + 40);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Вектор тяги (анимируется)
        const pullLen = isHovered ? Math.abs(Math.sin(time*0.1)) * 40 + 20 : 30;
        ctx.beginPath();
        ctx.moveTo(blockX, blockY);
        ctx.lineTo(blockX + pullLen, blockY);
        ctx.strokeStyle = '#22c55e';
        ctx.stroke();
    };

    const renderFrame = () => {
      // Маршрутизация превьюх
      if (sim.previewMode === 'optics') {
        drawOpticsPreview();
      } else if (sim.previewMode === 'astar' || sim.previewMode === 'math') {
        drawMechanicsPreview(); // Для остальных пока используем запасные (можно потом добавить)
      } else {
        drawParticlesPreview();
      }

      if (isHovered) {
        time++;
        animationFrameId = requestAnimationFrame(renderFrame);
      } else {
        // Возвращаем в исходное положение при потере фокуса
        time = 0;
      }
    };

    renderFrame();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, sim.id, sim.color]);

  return (
    <div 
      className="glass-card animate-fade-in" 
      style={{ 
        ...style,
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        transform: isHovered ? 'translateY(-5px)' : 'none',
        borderColor: isHovered ? sim.color : 'transparent',
        boxShadow: isHovered ? `0 10px 25px ${sim.color}20` : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Живое Canvas превью вместо Image */}
      <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
         <canvas 
            ref={canvasRef} 
            width={350} 
            height={220} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: sim.active ? 1 : 0.4 }} 
         />
         
         {sim.imageUrl && (
            <img 
              src={sim.imageUrl} 
              alt={sim.title}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isHovered ? 0 : (sim.active ? 0.8 : 0.3),
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none'
              }}
            />
         )}
        
        <div style={{ 
            position: 'absolute', top: '1rem', right: '1rem', 
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', 
            padding: '0.25rem 0.75rem', borderRadius: '1rem', 
            display: 'flex', alignItems: 'center', gap: '0.25rem', 
            color: sim.color, fontSize: '0.8rem', fontWeight: 'bold',
            border: `1px solid ${sim.color}40`
        }}>
          {sim.icon} {sim.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', background: 'rgba(15, 23, 42, 0.6)' }}>
        <div style={{ position: 'absolute', top: '-1px', left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${sim.color}, transparent)` }}></div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#f8fafc' }}>{sim.title}</h3>
        
        {sim.active ? (
          <Link to={`/simulation/${sim.id}`} className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', background: `linear-gradient(135deg, ${sim.color}, rgba(0,0,0,0.8))`, boxSizing: 'border-box', textDecoration: 'none', textAlign: 'center' }}>
            Запустить <ArrowRight size={16} style={{ marginLeft: '8px' }} />
          </Link>
        ) : (
          <Link to={`/simulation/${sim.id}`} className="btn btn-outline" style={{ marginTop: 'auto', width: '100%', opacity: 0.5, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
            В разработке
          </Link>
        )}
      </div>

    </div>
  );
}
