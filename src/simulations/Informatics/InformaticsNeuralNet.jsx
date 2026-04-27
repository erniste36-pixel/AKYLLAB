import { useRef, useEffect, useState } from 'react';
import { Network, Zap, Play, Terminal, Database, Cpu, Activity, Info } from 'lucide-react';

export default function NeuralNetVisualizer() {
  const canvasRef = useRef(null);
  const [pulse, setPulse] = useState(0);
  const [learningRate, setLearningRate] = useState(0.5);
  const [activation, setActivation] = useState('sigmoid'); 

  const layers = [3, 5, 2];
  
  useEffect(() => {
    let animationId;
    let time = 0;

    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0,0,width,height);

      time += 0.05;
      const layerWidth = width / (layers.length + 1);
      const nodes = [];

      layers.forEach((nodeCount, lIndex) => {
         const x = layerWidth * (lIndex + 1);
         const startY = height/2 - ((nodeCount-1)*100)/2;
         nodes[lIndex] = [];
         
         for(let i=0; i<nodeCount; i++) {
             const z = Math.sin(time * learningRate + lIndex + i);
             let act = 0;
             if (activation === 'sigmoid') act = 1 / (1 + Math.exp(-z));
             else if (activation === 'relu') act = Math.max(0, z); 
             else if (activation === 'tanh') act = Math.tanh(z);

             nodes[lIndex].push({ x, y: startY + i*100, activation: act, baseZ: z });
         }
      });

      // Draw Connections
      for(let l=0; l<layers.length-1; l++) {
          const currentNodes = nodes[l];
          const nextNodes = nodes[l+1];
          
          currentNodes.forEach((n1, i1) => {
             nextNodes.forEach((n2, i2) => {
                 const weightRaw = Math.sin(l*10 + i1*5 + i2); 
                 const weight = (weightRaw * learningRate + 1) / 2;
                 
                 ctx.beginPath();
                 ctx.moveTo(n1.x, n1.y);
                 const dist = pulse - l; 
                 
                 // Signal Pulse Effect
                 if (dist > 0 && dist < 1) {
                     ctx.lineTo(n1.x + (n2.x-n1.x)*dist, n1.y + (n2.y-n1.y)*dist);
                     ctx.strokeStyle = 'var(--neon-primary)';
                     ctx.lineWidth = weight * 6;
                     ctx.stroke();
                     
                     ctx.beginPath();
                     ctx.arc(n1.x + (n2.x-n1.x)*dist, n1.y + (n2.y-n1.y)*dist, 4, 0, Math.PI*2);
                     ctx.fillStyle = '#fff';
                     ctx.shadowBlur = 15;
                     ctx.shadowColor = 'var(--neon-primary)';
                     ctx.fill();
                     ctx.shadowBlur = 0;
                 }

                 ctx.lineTo(n2.x, n2.y);
                 ctx.strokeStyle = weight > 0.5 ? `rgba(0, 255, 179, ${weight*0.2})` : `rgba(244, 63, 94, ${0.2 - weight*0.2})`;
                 ctx.lineWidth = 1 + weight*2;
                 ctx.stroke();
             });
          });
      }

      // Draw Neurons
      nodes.forEach((layer, lIndex) => {
          layer.forEach(n => {
              ctx.beginPath();
              ctx.arc(n.x, n.y, 28, 0, Math.PI*2);
              
              let colorA = Math.abs(n.activation); 
              if(colorA > 1) colorA = 1;
              
              ctx.fillStyle = lIndex === 0 ? 'rgba(250, 204, 21, 0.1)' : lIndex === layers.length-1 ? 'rgba(236, 72, 153, 0.1)' : 'rgba(0, 255, 179, 0.05)';
              ctx.fill();
              ctx.strokeStyle = lIndex === 0 ? '#fac415' : lIndex === layers.length-1 ? '#ec4899' : 'var(--neon-primary)';
              ctx.lineWidth = 2;
              ctx.stroke();

              // Inner glow
              ctx.beginPath();
              ctx.arc(n.x, n.y, 20 * colorA, 0, Math.PI*2);
              ctx.fillStyle = ctx.strokeStyle;
              ctx.globalAlpha = 0.3 * colorA;
              ctx.fill();
              ctx.globalAlpha = 1.0;

              // Value Label
              ctx.fillStyle = 'var(--text-bright)';
              ctx.font = '11px var(--font-mono)';
              ctx.textAlign = 'center';
              ctx.fillText(n.activation.toFixed(2), n.x, n.y + 4);
          });
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [pulse, learningRate, activation, layers]);

  const firePulse = () => {
     let p = 0;
     const interval = setInterval(() => {
        p += 0.04 * (learningRate + 0.5);
        setPulse(p);
        if (p > layers.length + 1) {
            clearInterval(interval);
            setPulse(0);
        }
     }, 25);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: '100%', color: 'var(--text-bright)', fontFamily: 'var(--font-ui)' }}>
      
      {/* ─── NETWORK VIEWPORT ─── */}
      <div className="forge-frame" style={{ 
        background: 'rgba(5,7,12,0.4)', 
        borderRadius: 24, 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--forge-border-lit)'
      }}>
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', display: 'flex', gap: '1rem', zIndex: 10 }}>
           <span>NEURO_CORE_DUMP</span>
           <span style={{ color: 'var(--neon-primary)' }}>PROPAGATION: {pulse > 0 ? 'PUSHING_SIGNAL' : 'IDLE'}</span>
        </div>

        <canvas ref={canvasRef} width={900} height={600} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        
        {/* Hover labels */}
        <div style={{ position: 'absolute', top: 30, width: '100%', display: 'flex', justifyContent: 'space-around', pointerEvents: 'none', opacity: 0.4, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.3em', fontFamily: 'var(--font-mono)' }}>
           <span>INPUT_LAYER</span>
           <span>HIDDEN_NODES</span>
           <span>OUTPUT_LOGITS</span>
        </div>
      </div>

      {/* ─── SIDEBAR CONTROLS ─── */}
      <div className="forge-frame" style={{ width: 340, padding: '1.75rem', borderRadius: 28, display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10,12,18,0.7)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,255,179,0.1)', display: 'grid', placeItems: 'center', color: 'var(--neon-primary)' }}>
            <Network size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900 }}>NEURAL_FORGE</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>MODEL: FEED_FORWARD_BETA</div>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
           Визуализация прохождения сигнала через веса нейронной сети. Настройте скорость обучения для изменения динамики.
        </p>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-bright)', fontWeight: 800 }}>
                <Terminal size={14} color="#38bdf8" /> ACTIVATION_FUNC
             </div>
             <select 
                value={activation} 
                onChange={e => setActivation(e.target.value)}
                className="forge-frame"
                style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: '0.8rem', borderRadius: 12 }}
             >
                <option value="sigmoid">Sigmoid (Logistic)</option>
                <option value="relu">ReLU (Rectified)</option>
                <option value="tanh">Tanh (Hyperbolic)</option>
             </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14} color="var(--neon-primary)" /> LEARNING_RATE</span>
                <span style={{ color: 'var(--neon-primary)' }}>{learningRate.toFixed(2)}</span>
             </div>
             <input 
                type="range" min="0.1" max="2.0" step="0.1" 
                value={learningRate} onChange={e => setLearningRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--neon-primary)' }}
             />
          </div>
        </section>

        <button 
           className="forge-btn-primary" 
           onClick={firePulse} 
           disabled={pulse > 0}
           style={{ marginTop: 'auto', height: 50, borderRadius: 16, fontSize: '0.9rem', gap: '0.75rem' }}
        >
           <Play size={18} /> FORWARD_PROPAGATION
        </button>

        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
           SYNTHETIC_BRAIN_V0.12 // EPOCH: 884
        </div>
      </div>
    </div>
  );
}
