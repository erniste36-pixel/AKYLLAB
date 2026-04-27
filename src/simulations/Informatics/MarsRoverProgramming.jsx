import { useState, useCallback, useRef } from 'react';
import { Play, RotateCcw, MoveUp, MoveDown, MoveLeft, MoveRight, ChevronRight, Terminal, Cpu, Database, Scan, Eye, Radio } from 'lucide-react';

const GRID_SIZE = 8;
const TARGET = { x: 7, y: 7 };
const INITIAL_POS = { x: 0, y: 0 };

export default function MarsRoverProgramming() {
  const [pos, setPos] = useState(INITIAL_POS);
  const [commands, setCommands] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCmdIndex, setCurrentCmdIndex] = useState(-1);
  const [status, setStatus] = useState('IDLE'); // IDLE, RUNNING, SUCCESS, FAIL
  const [obstacles] = useState([
    {x: 2, y: 2}, {x: 2, y: 3}, {x: 4, y: 5}, {x: 6, y: 1}, {x: 1, y: 6}, {x: 5, y: 4}
  ]);

  const reset = () => {
    setPos(INITIAL_POS);
    setIsRunning(false);
    setCurrentCmdIndex(-1);
    setStatus('IDLE');
  };

  const clearCommands = () => {
    setCommands([]);
    reset();
  };

  const addCommand = (cmd) => {
    if (commands.length < 12 && !isRunning) {
      setCommands([...commands, cmd]);
    }
  };

  const runProgram = useCallback(async () => {
    if (commands.length === 0 || isRunning) return;
    setIsRunning(true);
    setStatus('RUNNING');
    
    let currentPos = { ...INITIAL_POS };
    setPos(currentPos);

    for (let i = 0; i < commands.length; i++) {
      setCurrentCmdIndex(i);
      const cmd = commands[i];
      
      let nextPos = { ...currentPos };
      if (cmd === 'UP') nextPos.y = Math.max(0, currentPos.y - 1);
      if (cmd === 'DOWN') nextPos.y = Math.min(GRID_SIZE - 1, currentPos.y + 1);
      if (cmd === 'LEFT') nextPos.x = Math.max(0, currentPos.x - 1);
      if (cmd === 'RIGHT') nextPos.x = Math.min(GRID_SIZE - 1, currentPos.x + 1);

      // Check collision
      const hitObstacle = obstacles.find(o => o.x === nextPos.x && o.y === nextPos.y);
      if (hitObstacle) {
        setPos(nextPos);
        setStatus('FAIL_OBSTACLE');
        setIsRunning(false);
        return;
      }

      currentPos = nextPos;
      setPos(currentPos);
      
      await new Promise(r => setTimeout(r, 500));

      if (currentPos.x === TARGET.x && currentPos.y === TARGET.y) {
        setStatus('SUCCESS');
        setIsRunning(false);
        return;
      }
    }

    setStatus('FAIL_INCOMPLETE');
    setIsRunning(false);
  }, [commands, isRunning, obstacles]);

  return (
    <div style={{ padding: '1rem', color: 'var(--text-bright)', display: 'flex', gap: '1.5rem', height: '100%', fontFamily: 'var(--font-mono)' }}>
      
      {/* ─── TACTICAL GRID MAP ─── */}
      <div style={{ 
        flex: 1, 
        background: 'rgba(5,7,12,0.6)', 
        borderRadius: 24, 
        border: '1px solid var(--forge-border-lit)', 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
      }}>
        {/* Grid HUD Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--forge-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ width: 8, height: 8, borderRadius: '50%', background: isRunning ? 'var(--neon-primary)' : 'var(--text-dim)', boxShadow: isRunning ? '0 0 10px var(--neon-primary)' : 'none' }} />
             <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>TERRAIN_SCAN_007</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
             COORDS: <span style={{ color: 'var(--neon-primary)' }}>X:{pos.x} Y:{pos.y}</span>
          </div>
        </div>

        {/* The Grid Canvas Area */}
        <div style={{ 
          flex: 1, 
          display: 'grid', 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, 
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`, 
          gap: 1, 
          background: 'rgba(255,80,50,0.03)', 
          padding: 20 
        }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isRover = pos.x === x && pos.y === y;
            const isTarget = TARGET.x === x && TARGET.y === y;
            const isObstacle = obstacles.find(o => o.x === x && o.y === y);
            
            return (
              <div key={i} style={{ 
                border: '1px solid rgba(0,255,179,0.04)', 
                display: 'grid', 
                placeItems: 'center',
                position: 'relative',
                background: isRover ? 'rgba(0,255,179,0.02)' : 'transparent'
              }}>
                {/* Visual Distinctions */}
                {isTarget && (
                   <div style={{ 
                     width: '60%', height: '60%', borderRadius: '50%', 
                     border: '1px dashed var(--neon-primary)', 
                     display: 'grid', placeItems: 'center',
                     animation: 'spin 4s linear infinite'
                   }}>
                      <ChevronRight size={20} color="var(--neon-primary)" />
                   </div>
                )}
                {isObstacle && (
                  <div style={{ position: 'relative', width: '60%', height: '60%' }}>
                     <div style={{ width: '100%', height: '100%', background: '#334155', borderRadius: 6, transform: 'rotate(15deg)', boxShadow: '4px 4px 0 rgba(0,0,0,0.2)' }} />
                     <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, transform: 'rotate(-5deg)' }} />
                  </div>
                )}
                {isRover && (
                  <div style={{ 
                    width: '80%', height: '80%', background: 'linear-gradient(135deg, var(--neon-primary), var(--neon-accent))', 
                    borderRadius: 12, zIndex: 10, display: 'grid', placeItems: 'center',
                    boxShadow: '0 0 25px var(--theme-glow)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}>
                    <Cpu size={18} color="#07080d" />
                    {/* Scanning pulse */}
                    <div style={{ position: 'absolute', inset: -10, border: '1px solid var(--neon-primary)', borderRadius: '50%', animation: 'rover-pulse 1.5s infinite', opacity: 0.5 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map Legend / Data Overlay */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: '1rem', zIndex: 5 }}>
           <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, background: 'var(--neon-primary)', borderRadius: 2 }} /> ROVER
           </div>
           <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, background: '#334155', borderRadius: 2 }} /> OBSTACLE
           </div>
           <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, border: '1px solid var(--neon-primary)', borderRadius: '50%' }} /> TARGET
           </div>
        </div>
      </div>

      {/* ─── CODING TERMINAL ─── */}
      <div className="forge-frame" style={{ width: 400, padding: '1.75rem', borderRadius: 28, display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(10,12,18,0.7)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid var(--forge-border-lit)', display: 'grid', placeItems: 'center', color: 'var(--neon-primary)' }}>
            <Terminal size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>COMMAND_MODULE</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>AUTH_LEVEL: ADMIN // BUFFER: READY</div>
          </div>
        </div>

        {/* Command Buffer Area */}
        <div style={{ 
          flex: 1, 
          background: 'rgba(0,0,0,0.4)', 
          borderRadius: 16, 
          border: '1px solid var(--forge-border)', 
          padding: '1.25rem', 
          overflowY: 'auto',
          boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {commands.length === 0 && (
            <div style={{ height: '100%', display: 'flex', flexWrap: 'wrap', placeContent: 'center', color: 'var(--text-dim)', fontSize: '0.7rem', textAlign: 'center', opacity: 0.4 }}>
               <Database size={32} style={{ marginBottom: '1rem', width: '100%' }} />
               WAITING_FOR_COMMAND_INPUT...
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {commands.map((cmd, i) => (
              <div key={i} style={{ 
                padding: '10px 14px', 
                background: currentCmdIndex === i ? 'rgba(0,255,179,0.1)' : 'rgba(255,255,255,0.03)', 
                borderRadius: 10,
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: currentCmdIndex === i ? '1px solid var(--neon-primary)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                transform: currentCmdIndex === i ? 'translateX(4px)' : 'none'
              }}>
                <span style={{ opacity: 0.3, width: 20 }}>{(i + 1).toString().padStart(2, '0')}</span>
                <span style={{ flex: 1, color: currentCmdIndex === i ? 'var(--neon-primary)' : 'var(--text-bright)' }}>
                   {cmd === 'UP' && 'UNIT.PUSH_NORTH()'}
                   {cmd === 'DOWN' && 'UNIT.PUSH_SOUTH()'}
                   {cmd === 'LEFT' && 'UNIT.PUSH_WEST()'}
                   {cmd === 'RIGHT' && 'UNIT.PUSH_EAST()'}
                </span>
                <div style={{ opacity: 0.6 }}>
                  {cmd === 'UP' && <MoveUp size={14} />}
                  {cmd === 'DOWN' && <MoveDown size={14} />}
                  {cmd === 'LEFT' && <MoveLeft size={14} />}
                  {cmd === 'RIGHT' && <MoveRight size={14} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
           <div className="forge-frame" style={{ padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={14} color="var(--text-dim)" />
              <div style={{ fontSize: '0.6rem' }}>OBSTACLES: {obstacles.length}</div>
           </div>
           <div className="forge-frame" style={{ padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={14} color="var(--text-dim)" />
              <div style={{ fontSize: '0.6rem' }}>LATENCY: 14m</div>
           </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {[
            { id: 'UP', icon: MoveUp }, 
            { id: 'DOWN', icon: MoveDown }, 
            { id: 'LEFT', icon: MoveLeft }, 
            { id: 'RIGHT', icon: MoveRight }
          ].map(btn => (
            <button key={btn.id} className="forge-btn-icon" onClick={() => addCommand(btn.id)} disabled={isRunning} style={{ height: 50 }}>
              <btn.icon size={20} />
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="forge-btn-secondary" style={{ flex: 1, height: 48 }} onClick={clearCommands} disabled={isRunning}>
            <RotateCcw size={16} /> RESET
          </button>
          <button 
            className="forge-btn-primary" 
            style={{ flex: 2, height: 48, boxShadow: '0 0 20px rgba(0,255,179,0.2)' }} 
            onClick={runProgram} 
            disabled={isRunning || commands.length === 0}
          >
            <Play size={16} /> {isRunning ? 'PROCESS...' : 'EXECUTE_CODE'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rover-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
