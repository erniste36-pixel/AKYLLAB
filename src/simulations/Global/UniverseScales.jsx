import { useRef, useEffect, useState } from 'react';
import { Globe, ZoomIn, ZoomOut, Target, Database, Activity, Info } from 'lucide-react';

const entities = [
  { p: -35, name: 'Планковская длина', note: 'Квантовая пена', url: 'https://images.unsplash.com/photo-1636953056323-9c09fdd3866a?w=400&q=80' },
  { p: -18, name: 'Кварк', note: 'Внутри протона', url: 'https://images.unsplash.com/photo-1618609378039-b572a59c3d43?w=400&q=80' },
  { p: -15, name: 'Протон', note: 'Ядро атома', url: 'https://images.unsplash.com/photo-1549405626-d667c3bfee92?w=400&q=80' },
  { p: -10, name: 'Атом Водорода', note: 'Атом', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80' },
  { p: -7, name: 'Вирус', note: 'Бактериофаг', url: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=400&q=80' },
  { p: -5, name: 'Клетка человека', note: 'Биология', url: 'https://images.unsplash.com/photo-1530973428-5bf2db015a13?w=400&q=80' },
  { p: -3, name: 'Муравей', note: 'Насекомое', url: 'https://images.unsplash.com/photo-1587393437146-24ebf5ebc087?w=400&q=80' },
  { p: 0, name: 'Человек', note: 'homo sapiens (10^0 м)', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80' },
  { p: 3, name: 'Эверест', note: 'Гора', url: 'https://images.unsplash.com/photo-1512273222628-4daea6e55abb?w=400&q=80' },
  { p: 7, name: 'Земля', note: 'Планета', url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&q=80' },
  { p: 9, name: 'Солнце', note: 'Звезда', url: 'https://images.unsplash.com/photo-1532662057917-73ccb3558c73?w=400&q=80' },
  { p: 13, name: 'Солнечная система', note: 'До облака Оорта', url: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&q=80' },
  { p: 21, name: 'Млечный Путь', note: 'Галактика', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&q=80' },
  { p: 26, name: 'Наблюдаемая Вселенная', note: 'Предел светимости', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80' }
];

export default function UniverseScales() {
  const canvasRef = useRef(null);
  const [exp, setExp] = useState(0); 
  const imagesRef = useRef({});

  useEffect(() => {
    entities.forEach(ent => {
      const img = new Image();
      img.src = ent.url;
      img.onload = () => { imagesRef.current[ent.p] = img; };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    const render = () => {
      ctx.clearRect(0,0,width,height);
      
      // GRID LINES (Dynamically scaling)
      const gridScale = Math.pow(10, Math.floor(exp) - exp); 
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      const step = 120 * gridScale;
      for(let x=cx%step; x<width; x+=step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
      for(let y=cy%step; y<height; y+=step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }

      const visible = entities.filter(e => Math.abs(e.p - exp) < 4);
      visible.sort((a,b) => b.p - a.p);

      visible.forEach(ent => {
         const diff = ent.p - exp; 
         const objSize = 240 * Math.pow(10, diff); 
         if (objSize < 0.1 || objSize > width*6) return;

         const img = imagesRef.current[ent.p];
         if (img && objSize > 5) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, objSize, 0, Math.PI*2);
            ctx.clip();
            ctx.globalAlpha = 1 - Math.abs(diff)/4;
            ctx.drawImage(img, cx - objSize, cy - objSize, objSize*2, objSize*2);
            ctx.restore();
         }

         ctx.beginPath();
         ctx.arc(cx, cy, objSize, 0, Math.PI*2);
         ctx.strokeStyle = ent.p > 0 ? `rgba(var(--neon-primary-rgb, 0,255,179), ${1 - Math.abs(diff)/4})` : `rgba(56, 189, 248, ${1 - Math.abs(diff)/4})`;
         ctx.lineWidth = objSize > 300 ? 3 : 1;
         ctx.stroke();

         if (objSize > 25 && objSize < width*0.8) {
             ctx.fillStyle = 'var(--text-bright)';
             ctx.font = `bold ${Math.max(12, Math.min(22, objSize*0.15))}px var(--font-ui)`;
             ctx.fillText(ent.name.toUpperCase(), cx + objSize + 15, cy - 8);
             ctx.fillStyle = 'var(--text-dim)';
             ctx.font = `10px var(--font-mono)`;
             ctx.fillText(ent.note, cx + objSize + 15, cy + 12);
         }
      });

      // CROSSHAIR
      ctx.strokeStyle = 'var(--neon-primary)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.moveTo(cx-30,cy); ctx.lineTo(cx+30,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy-30); ctx.lineTo(cx,cy+30); ctx.stroke();
      ctx.globalAlpha = 1.0;
    };

    render();
  }, [exp]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: '100%', color: 'var(--text-bright)', fontFamily: 'var(--font-ui)' }}>
      
      {/* ─── SCANNER VIEWPORT ─── */}
      <div className="forge-frame" style={{ 
        background: 'rgba(5,7,12,0.4)', 
        borderRadius: 24, 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--forge-border-lit)'
      }}>
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', display: 'flex', gap: '1rem', zIndex: 10 }}>
           <span>SCALAR_SCANNER_V8</span>
           <span style={{ color: 'var(--neon-primary)' }}>RESOLUTION: 10^{exp.toFixed(1)}m</span>
        </div>

        <canvas ref={canvasRef} width={1000} height={700} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        
        {/* Scalar HUD elements */}
        <div style={{ position: 'absolute', bottom: 20, right: 20, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--neon-primary)' }}>
           <div>COORD_X: 0.000</div>
           <div>COORD_Y: 0.000</div>
           <div style={{ color: 'var(--text-dim)' }}>STABILITY: 99.8%</div>
        </div>
      </div>

      {/* ─── SIDEBAR CONTROLS ─── */}
      <div className="forge-frame" style={{ width: 340, padding: '1.75rem', borderRadius: 28, display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10,12,18,0.7)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,255,179,0.1)', display: 'grid', placeItems: 'center', color: 'var(--neon-primary)' }}>
            <Globe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900 }}>MULTISCALE_VIEW</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>SYSTEM: UNIVERSE_EXPLORER</div>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
           Исследуйте масштабы Вселенной от элементарных частиц до границ наблюдаемого космоса.
        </p>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Target size={14} color="var(--neon-primary)" /> SCALAR_LEVEL</span>
                <span style={{ color: 'var(--neon-primary)', fontFamily: 'var(--font-mono)' }}>10^{exp.toFixed(1)}</span>
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ZoomOut size={16} color="var(--text-dim)" />
                <input 
                    type="range" min="-35" max="26" step="0.05"
                    value={exp} onChange={e => setExp(parseFloat(e.target.value))} 
                    style={{ flex: 1, accentColor: 'var(--neon-primary)' }}
                />
                <ZoomIn size={16} color="var(--text-dim)" />
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {entities.map(ent => (
                <div 
                  key={ent.p} 
                  onClick={() => setExp(ent.p)}
                  style={{ 
                    padding: '6px 10px', borderRadius: 8, fontSize: '0.6rem', 
                    cursor: 'pointer', border: '1px solid var(--forge-border)',
                    background: Math.abs(ent.p - exp) < 0.5 ? 'rgba(0,255,179,0.1)' : 'transparent',
                    color: Math.abs(ent.p - exp) < 0.5 ? 'var(--neon-primary)' : 'var(--text-dim)',
                    transition: 'all 0.2s', fontFamily: 'var(--font-mono)'
                  }}
                >
                   {ent.name.toUpperCase()}
                </div>
             )).filter((_, i) => i % 3 === 0)}
          </div>
        </section>

        <div style={{ marginTop: 'auto' }}>
           <div className="forge-frame" style={{ padding: '0.75rem', borderRadius: 12, fontSize: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 5 }}>
                 <Activity size={14} color="#f43f5e" /> <span>HOLOGRAPHIC_DATA</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.6rem' }}>
                 LOADING_TEXTURES... [OK]<br/>
                 SPATIAL_SYNC... [ACTIVE]
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
