import { useRef, useEffect, useState } from 'react';

export default function OpticsRefraction() {
  const canvasRef = useRef(null);
  const [n1, setN1] = useState(1.0); // Воздух по дефолту
  const [n2, setN2] = useState(1.5); // Стекло по дефолту
  const [angleDegrees, setAngleDegrees] = useState(45); // Угол падения (от нормали)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Среда 1 (Верх)
      ctx.fillStyle = '#0f172a'; // Темный фон
      ctx.fillRect(0, 0, width, cy);
      
      // Среда 2 (Низ - с легким оттенком синего/зеленого, зависящим от плотности)
      ctx.fillStyle = `rgba(14, 165, 233, ${n2 * 0.1})`;
      ctx.fillRect(0, cy, width, cy);

      // Рисование линии раздела сред
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Нормаль
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.stroke();
      ctx.setLineDash([]);

      // Расчет углов
      const theta1 = (angleDegrees * Math.PI) / 180;
      
      // Луч падения
      const rayLen = 400;
      const x1 = cx - rayLen * Math.sin(theta1);
      const y1 = cy - rayLen * Math.cos(theta1);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = '#f43f5e'; // Лазерный красный
      ctx.lineWidth = 3;
      ctx.stroke();

      const sinTheta2 = (n1 * Math.sin(theta1)) / n2;

      if (Math.abs(sinTheta2) > 1) {
        // Полное внутреннее отражение (TIR)
        const xTIR = cx + rayLen * Math.sin(theta1);
        const yTIR = cy - rayLen * Math.cos(theta1);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(xTIR, yTIR);
        ctx.strokeStyle = '#f43f5e';
        ctx.stroke();
      } else {
        // Преломление
        const theta2 = Math.asin(sinTheta2);
        const x2 = cx + rayLen * Math.sin(theta2);
        const y2 = cy + rayLen * Math.cos(theta2);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#38bdf8'; // Синий преломленный луч
        ctx.stroke();

        // Отображение дуги угла преломления
        ctx.beginPath();
        ctx.arc(cx, cy, 50, Math.PI / 2 - theta2, Math.PI / 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();
      }

      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText(`Среда 1 (n = ${n1})`, 20, 30);
      ctx.fillText(`Среда 2 (n = ${n2})`, 20, cy + 30);
      ctx.fillText(`Угол падения: ${angleDegrees}°`, width - 220, 30);
    };

    render();
  }, [n1, n2, angleDegrees]);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', height: '100%' }}>
      
      <div style={{ flex: 1, minWidth: '300px', background: '#000', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e293b' }}>
        <canvas 
           ref={canvasRef} 
           width={800} 
           height={550} 
           style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <div style={{ width: '320px', background: '#0f172a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#f8fafc' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', margin: 0 }}>Закон Снеллиуса</h2>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#38bdf8' }}>
          <span>Индекс среды 1 (n₁ = {n1.toFixed(2)})</span>
          <input 
            type="range" min="1" max="3" step="0.01" 
            value={n1} onChange={(e) => setN1(parseFloat(e.target.value))}
            style={{ accentColor: '#38bdf8' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#38bdf8' }}>
          <span>Индекс среды 2 (n₂ = {n2.toFixed(2)})</span>
          <input 
            type="range" min="1" max="3" step="0.01" 
            value={n2} onChange={(e) => setN2(parseFloat(e.target.value))}
            style={{ accentColor: '#38bdf8' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#f43f5e' }}>
          <span>Угол падения: {angleDegrees}°</span>
          <input 
            type="range" min="0" max="89" step="1" 
            value={angleDegrees} onChange={(e) => setAngleDegrees(parseInt(e.target.value))}
            style={{ accentColor: '#f43f5e' }}
          />
        </label>

        <div style={{ marginTop: 'auto', background: '#1e293b', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>
          <p style={{ margin: 0 }}>При <strong>n₁ &gt; n₂</strong> и достаточно большом угле возникает полное внутреннее отражение.</p>
        </div>
      </div>
    </div>
  );
}
