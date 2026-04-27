import { useRef, useEffect, useState } from 'react';

export default function MathFractals() {
  const canvasRef = useRef(null);
  
  const [maxIter, setMaxIter] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(-0.5);
  const [offsetY, setOffsetY] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  
  const [isJulia, setIsJulia] = useState(false);
  const [juliaReal, setJuliaReal] = useState(-0.4);
  const [juliaImag, setJuliaImag] = useState(0.6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      setIsRendering(true);
      
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      const rangeX = 3.5 / zoom;
      const rangeY = (3.5 * (height/width)) / zoom;
      
      const minRe = offsetX - rangeX/2;
      const maxRe = offsetX + rangeX/2;
      const minIm = offsetY - rangeY/2;
      const maxIm = offsetY + rangeY/2;
      
      const reStep = (maxRe - minRe) / width;
      const imStep = (maxIm - minIm) / height;

      for (let y = 0; y < height; y++) {
          const c_im = minIm + y * imStep;
          for (let x = 0; x < width; x++) {
              const c_re = minRe + x * reStep;
              
              let z_re = c_re;
              let z_im = c_im;
              
              // Если это Множество Жюлиа (Julia Set), "С" - это константа, а Z загружается из пикселя
              let cur_c_re = c_re;
              let cur_c_im = c_im;

              if (isJulia) {
                  cur_c_re = juliaReal;
                  cur_c_im = juliaImag;
              } else {
                  z_re = c_re;
                  z_im = c_im;
              }
              
              let n;
              for (n = 0; n < maxIter; n++) {
                 const z_re2 = z_re * z_re;
                 const z_im2 = z_im * z_im;
                 if (z_re2 + z_im2 > 4) break;
                 z_im = 2 * z_re * z_im + cur_c_im;
                 z_re = z_re2 - z_im2 + cur_c_re;
              }

              const pixelIndex = (x + y * width) * 4;
              if (n === maxIter) {
                  data[pixelIndex] = 0;
                  data[pixelIndex+1] = 0;
                  data[pixelIndex+2] = 0;
                  data[pixelIndex+3] = 255;
              } else {
                  const c = n/maxIter * 255;
                  data[pixelIndex] = c; 
                  data[pixelIndex+1] = isJulia ? c * 0.8 : c * 0.2; 
                  data[pixelIndex+2] = isJulia ? c * 0.2 : c * 0.8 + 50; 
                  data[pixelIndex+3] = 255; 
              }
          }
      }
      
      ctx.putImageData(imgData, 0, 0);
      setIsRendering(false);
    };

    setTimeout(render, 10);
  }, [zoom, offsetX, offsetY, maxIter, isJulia, juliaReal, juliaImag]);

  const handleCanvasClick = (e) => {
     const canvas = canvasRef.current;
     const rect = canvas.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;

     const width = canvas.width;
     const height = canvas.height;
     
     const rangeX = 3.5 / zoom;
     const rangeY = (3.5 * (height/width)) / zoom;

     const clickedRe = (offsetX - rangeX/2) + (x / width) * rangeX;
     const clickedIm = (offsetY - rangeY/2) + (y / height) * rangeY;

     setOffsetX(clickedRe);
     setOffsetY(clickedIm);
     setZoom(z => z * 2); 
  };

  return (
    <div className="flex flex-wrap gap-6 h-full text-slate-100">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative cursor-crosshair min-w-[300px]">
        {isRendering && (
           <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 transition-opacity">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-2 text-sky-400 font-bold tracking-widest text-sm">ГЕНЕРАЦИЯ...</span>
           </div>
        )}
        <canvas 
           ref={canvasRef} 
           onClick={handleCanvasClick}
           width={600} height={400} 
           className="w-full h-full object-fill" 
        />
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b border-slate-600 pb-2">Фракталы Z² + C</h2>
        
        <div className="flex flex-col gap-2">
           <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-700/50 rounded-lg">
              <input type="radio" checked={!isJulia} onChange={() => setIsJulia(false)} className="accent-sky-500 w-4 h-4"/>
              <span className="font-bold text-sky-300">Множество Мандельброта</span>
           </label>
           <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-700/50 rounded-lg">
              <input type="radio" checked={isJulia} onChange={() => { setIsJulia(true); setOffsetX(0); setOffsetY(0); setZoom(1); }} className="accent-amber-500 w-4 h-4"/>
              <span className="font-bold text-amber-300">Множество Жюлиа</span>
           </label>
        </div>

        {isJulia && (
           <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col gap-3">
              <span className="text-xs text-amber-500">Настройки константы C для Жюлиа:</span>
              <label className="flex flex-col gap-1 text-[11px] text-slate-300">
                 Real (X): {juliaReal.toFixed(2)}
                 <input type="range" min="-1" max="1" step="0.05" value={juliaReal} onChange={e=>setJuliaReal(Number(e.target.value))} className="accent-amber-500" disabled={isRendering}/>
              </label>
              <label className="flex flex-col gap-1 text-[11px] text-slate-300">
                 Imaginary (Y): {juliaImag.toFixed(2)}
                 <input type="range" min="-1" max="1" step="0.05" value={juliaImag} onChange={e=>setJuliaImag(Number(e.target.value))} className="accent-amber-500" disabled={isRendering}/>
              </label>
           </div>
        )}

        <label className="flex flex-col gap-2 mt-2 text-slate-300 font-bold">
           Итерации (Четкость): {maxIter}
           <input 
              type="range" min="10" max="250" step="10"
              value={maxIter} onChange={e => setMaxIter(Number(e.target.value))}
              disabled={isRendering}
              className="accent-slate-400"
           />
        </label>

        <button 
           onClick={() => { setZoom(1); setOffsetX(isJulia ? 0 : -0.5); setOffsetY(0); }} 
           className="mt-auto btn btn-outline border-slate-500 hover:bg-slate-700 text-slate-300 py-3 rounded-lg font-bold"
        >
           Сбросить Масштаб (Зум: {zoom}x)
        </button>
      </div>
    </div>
  );
}
