import { useRef, useEffect, useState } from 'react';
import { Cpu, RotateCcw, Play, WallTower, Square, Hash, Activity, MousePointer2 } from 'lucide-react';

const COLS = 20;
const ROWS = 12;

function heuristic(a, b) {
  return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}

export default function AStarBuilder() {
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState([]);
  const [openSet, setOpenSet] = useState([]);
  const [closedSet, setClosedSet] = useState([]);
  const [path, setPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50); 

  useEffect(() => {
    resetGrid();
  }, []);

  function resetGrid() {
    const newGrid = new Array(COLS);
    for (let i = 0; i < COLS; i++) {
      newGrid[i] = new Array(ROWS);
      for (let j = 0; j < ROWS; j++) {
        newGrid[i][j] = { i, j, f: 0, g: 0, h: 0, neighbors: [], previous: undefined, wall: false };
      }
    }
    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            if (i < COLS - 1) newGrid[i][j].neighbors.push(newGrid[i+1][j]);
            if (i > 0) newGrid[i][j].neighbors.push(newGrid[i-1][j]);
            if (j < ROWS - 1) newGrid[i][j].neighbors.push(newGrid[i][j+1]);
            if (j > 0) newGrid[i][j].neighbors.push(newGrid[i][j-1]);
        }
    }
    setGrid(newGrid);
    setOpenSet([newGrid[2][2]]);
    setClosedSet([]);
    setPath([]);
    setIsRunning(false);
  };

  const drawGrid = () => {
     const canvas = canvasRef.current;
     if(!canvas || grid.length === 0) return;
     const ctx = canvas.getContext('2d');
     const w = canvas.width / COLS;
     const h = canvas.height / ROWS;

     ctx.clearRect(0,0,canvas.width, canvas.height);

     for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
           const cell = grid[i][j];
           
           ctx.beginPath();
           ctx.rect(i*w, j*h, w, h);
           ctx.strokeStyle = 'rgba(255,255,255,0.05)';
           ctx.stroke();

           if (cell.wall) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = 'rgba(255,255,255,0.1)';
              ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
              ctx.fillRect(i*w + 2, j*h + 2, w-4, h-4);
              ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
              ctx.strokeRect(i*w + 2, j*h + 2, w-4, h-4);
              ctx.shadowBlur = 0;
           } else if (openSet.includes(cell)) {
              ctx.fillStyle = 'rgba(0, 255, 179, 0.15)';
              ctx.fillRect(i*w, j*h, w, h);
           } else if (closedSet.includes(cell)) {
              ctx.fillStyle = 'rgba(244, 63, 94, 0.05)';
              ctx.fillRect(i*w, j*h, w, h);
           }
        }
     }

     if (path.length > 0) {
        ctx.beginPath();
        ctx.moveTo(path[0].i * w + w/2, path[0].j * h + h/2);
        for(let k=1; k<path.length; k++) {
           ctx.lineTo(path[k].i * w + w/2, path[k].j * h + h/2);
        }
        ctx.strokeStyle = 'var(--neon-primary)';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'var(--neon-primary)';
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
     }

     // START MARK
     ctx.fillStyle = '#fac415';
     ctx.shadowBlur = 10; ctx.shadowColor = '#fac415';
     ctx.beginPath();
     ctx.arc(2*w + w/2, 2*h + h/2, w/4, 0, Math.PI*2);
     ctx.fill();
     
     // END MARK
     ctx.fillStyle = '#ec4899';
     ctx.shadowColor = '#ec4899';
     ctx.beginPath();
     ctx.arc(17*w + w/2, 9*h + h/2, w/4, 0, Math.PI*2);
     ctx.fill();
     ctx.shadowBlur = 0;
  };

  useEffect(() => { drawGrid(); }, [grid, openSet, closedSet, path]);

  const handleCanvasClick = (e) => {
    if (isRunning) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const w = canvas.width / COLS;
    const h = canvas.height / ROWS;
    const i = Math.floor(x / w);
    const j = Math.floor(y / h);
    if ((i===2 && j===2) || (i===17 && j===9)) return;
    setGrid(prev => {
        const newGrid = [...prev];
        newGrid[i][j].wall = !newGrid[i][j].wall;
        return newGrid;
    });
  };

  const stepAStar = () => {
     if (openSet.length > 0) {
        let winner = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[winner].f) winner = i;
        }
        let current = openSet[winner];

        if (current.i === 17 && current.j === 9) {
            setIsRunning(false);
            return;
        }

        setOpenSet(prev => prev.filter(p => !(p.i === current.i && p.j === current.j)));
        setClosedSet(prev => [...prev, current]);

        const neighbors = current.neighbors;
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            if (!closedSet.includes(neighbor) && !neighbor.wall) {
                let tempG = current.g + 1;
                let newPath = false;
                if (openSet.includes(neighbor)) {
                   if (tempG < neighbor.g) { neighbor.g = tempG; newPath = true; }
                } else {
                   neighbor.g = tempG; newPath = true;
                   setOpenSet(prev => [...prev, neighbor]);
                }
                if (newPath) {
                   neighbor.h = heuristic(neighbor, {i: 17, j: 9});
                   neighbor.f = neighbor.g + neighbor.h;
                   neighbor.previous = current;
                }
            }
        }

        let temp = current;
        const newPath = [];
        newPath.push(temp);
        while(temp.previous) { newPath.push(temp.previous); temp = temp.previous; }
        setPath(newPath);
     } else {
        setIsRunning(false);
     }
  };

  useEffect(() => {
     let interval;
     if (isRunning) { interval = setInterval(() => { stepAStar(); }, speed); }
     return () => clearInterval(interval);
  });

  const startAlgo = () => {
    for(let i=0; i<COLS; i++) {
        for(let j=0; j<ROWS; j++) {
            grid[i][j].previous = undefined;
            grid[i][j].g = 0; grid[i][j].f = 0; grid[i][j].h = 0;
        }
    }
    setOpenSet([grid[2][2]]);
    setClosedSet([]);
    setPath([]);
    setIsRunning(true);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: '100%', color: 'var(--text-bright)', fontFamily: 'var(--font-ui)' }}>
      
      <div className="forge-frame" style={{ 
        background: 'rgba(5,7,12,0.4)', 
        borderRadius: 24, 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--forge-border-lit)'
      }}>
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', zIndex: 10 }}>ALGO_STREAM: ASTAR_NAV_BETA</div>
        <canvas 
           ref={canvasRef} 
           onClick={handleCanvasClick}
           width={1000} height={600} 
           style={{ width: '100%', height: '100%', objectFit: 'fill', cursor: 'pointer' }}
        />
        
        <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: '1rem', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 8, height: 8, background: '#fac415', borderRadius: '50%' }}></div> ORIGIN</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 8, height: 8, background: '#ec4899', borderRadius: '50%' }}></div> TARGET</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 8, height: 8, background: 'var(--neon-primary)', borderRadius: '50%' }}></div> PATH_LINK</div>
        </div>
      </div>

      <div className="forge-frame" style={{ width: 340, padding: '1.75rem', borderRadius: 28, display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10,12,18,0.7)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,255,179,0.1)', display: 'grid', placeItems: 'center', color: 'var(--neon-primary)' }}>
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900 }}>A*_NAVIGATOR</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>HEURISTIC: MANHATTAN</div>
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--forge-border)', fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
           Нажмите на сетку для установки <b>препятствий</b>. Алгоритм найдет оптимальный путь, минимизируя функцию F = G + H.
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800 }}>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14} color="var(--neon-primary)" /> PROC_LATENCY</span>
                 <span style={{ color: 'var(--neon-primary)', fontFamily: 'var(--font-mono)' }}>{speed}ms</span>
              </div>
              <input 
                 type="range" min="10" max="500" step="10"
                 value={speed} onChange={e => setSpeed(Number(e.target.value))}
                 disabled={isRunning}
                 style={{ width: '100%', accentColor: 'var(--neon-primary)' }}
              />
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="forge-frame" style={{ padding: '0.75rem', borderRadius: 12, textAlign: 'center' }}>
                 <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginBottom: 4 }}>OPEN_SET</div>
                 <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{openSet.length}</div>
              </div>
              <div className="forge-frame" style={{ padding: '0.75rem', borderRadius: 12, textAlign: 'center' }}>
                 <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginBottom: 4 }}>CLOSED_SET</div>
                 <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{closedSet.length}</div>
              </div>
           </div>
        </section>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <button 
              className="forge-btn-primary" 
              onClick={startAlgo} 
              disabled={isRunning}
              style={{ height: 50, borderRadius: 16, gap: '0.75rem' }}
           >
              <Play size={18} /> START_HEURISTIC
           </button>
           <button 
              className="forge-btn-secondary" 
              onClick={resetGrid}
              style={{ height: 44, borderRadius: 12, gap: '0.5rem' }}
           >
              <RotateCcw size={16} /> CLEAR_MAP
           </button>
        </div>
      </div>
    </div>
  );
}
