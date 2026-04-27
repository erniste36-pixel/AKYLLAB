import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SlidersHorizontal, Orbit, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { renderSimulationFrame } from './SimulationEngine';

const FusionScene = lazy(() => import('./scenes/FusionScene'));

export default function LabModal({ simulation, onClose, qualityTier }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const simulationRef = useRef({
    position: 0,
    velocity: 0,
    acceleration: 0,
    time: 0,
  });
  const [activeTab, setActiveTab] = useState('controls');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [intensity, setIntensity] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [mode, setMode] = useState('one-force');
  const [mass, setMass] = useState(2);
  const [force, setForce] = useState(12);
  const [secondaryForce, setSecondaryForce] = useState(4);
  const [friction, setFriction] = useState(0.1);
  const [telemetry, setTelemetry] = useState({
    position: 0,
    velocity: 0,
    acceleration: 0,
    progress: 0,
    time: 0,
  });

  useEffect(() => {
    setSpeedMultiplier(1);
    setIntensity(1);
    setIsPaused(false);
    setAutoRotate(true);
    setResetSignal(0);
    setActiveTab('controls');
    setMode('one-force');
    setMass(2);
    setForce(12);
    setSecondaryForce(4);
    setFriction(0.1);
    setTelemetry({ position: 0, velocity: 0, acceleration: 0, progress: 0, time: 0 });
    simulationRef.current = { position: 0, velocity: 0, acceleration: 0, time: 0 };
  }, [simulation?.id]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simulation || simulation.id === 'fusion') return undefined;
    const ctx = canvas.getContext('2d');
    let frameCount = 0;
    const render = () => {
      const state = simulationRef.current;
      const dt = 1 / 60;
      if (!isPaused && simulation.id === 'forces-motion') {
        const effectiveRight = force;
        const effectiveLeft = mode === 'multi-force' ? secondaryForce : 0;
        const frictionForce =
          mode === 'friction'
            ? friction * mass * 9.81 * (state.velocity === 0 ? Math.sign(effectiveRight - effectiveLeft || 1) : Math.sign(state.velocity))
            : 0;
        const net = effectiveRight - effectiveLeft - frictionForce;
        state.acceleration = net / mass;
        state.velocity += state.acceleration * dt * speedMultiplier;
        state.position += state.velocity * dt * speedMultiplier;

        if (state.position > 8) {
          state.position = 8;
          state.velocity *= -0.35;
        }
        if (state.position < -8) {
          state.position = -8;
          state.velocity *= -0.35;
        }
        state.time += dt * speedMultiplier;
      } else if (!isPaused) {
        state.time += dt * speedMultiplier;
      }

      frameCount += 1;
      if (frameCount % 6 === 0) {
        setTelemetry({
          position: state.position,
          velocity: state.velocity,
          acceleration: state.acceleration,
          time: state.time,
          progress: Math.min(100, Math.abs(state.position) / 8 * 100),
        });
      }

      renderSimulationFrame({
        ctx,
        simulationId: simulation.id,
        color: simulation.accent,
        isHovered: true,
        isActive: true,
        qualityTier,
        speedMultiplier,
        intensity,
        telemetry: state,
        options: {
          mode,
          mass,
          force,
          secondaryForce,
          friction,
        },
        time: state.time * 60,
      });
      rafRef.current = requestAnimationFrame(render);
    };
    render();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [force, friction, intensity, isPaused, mass, mode, qualityTier, secondaryForce, simulation, speedMultiplier]);

  const handleReset = () => {
    setResetSignal((value) => value + 1);
    setSpeedMultiplier(1);
    setIntensity(1);
    setIsPaused(false);
    setAutoRotate(true);
    simulationRef.current = { position: 0, velocity: 0, acceleration: 0, time: 0 };
    setTelemetry({ position: 0, velocity: 0, acceleration: 0, progress: 0, time: 0 });
  };

  const missions = useMemo(
    () => [
      { id: 'm1', label: 'Разгони тележку до 1.5 м/с', done: Math.abs(telemetry.velocity) >= 1.5 },
      { id: 'm2', label: 'Достигни |x| >= 4.0 м', done: Math.abs(telemetry.position) >= 4 },
      { id: 'm3', label: 'Сделай ускорение < 0.5 м/с²', done: Math.abs(telemetry.acceleration) < 0.5 && telemetry.time > 2 },
    ],
    [telemetry],
  );

  const missionDoneCount = missions.filter((m) => m.done).length;
  const missionProgress = Math.round((missionDoneCount / missions.length) * 100);

  const doStep = () => {
    setIsPaused(true);
    const state = simulationRef.current;
    const dt = 0.12;
    const effectiveRight = force;
    const effectiveLeft = mode === 'multi-force' ? secondaryForce : 0;
    const frictionForce = mode === 'friction' ? friction * mass * 9.81 : 0;
    const net = effectiveRight - effectiveLeft - frictionForce * Math.sign(state.velocity || 1);
    state.acceleration = net / mass;
    state.velocity += state.acceleration * dt;
    state.position += state.velocity * dt;
    state.time += dt;
    setTelemetry({
      position: state.position,
      velocity: state.velocity,
      acceleration: state.acceleration,
      time: state.time,
      progress: Math.min(100, Math.abs(state.position) / 8 * 100),
    });
  };

  if (!simulation) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="lab-modal-backdrop"
        role="presentation"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.section
          layoutId={`simulation-card-${simulation.id}`}
          className="lab-modal"
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.stopPropagation()}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <header>
            <div>
              <p>{simulation.category}</p>
              <h2>{simulation.title}</h2>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Закрыть лабораторию">
              <X size={18} />
            </button>
          </header>
          <div className="lab-layout">
            <div className="lab-scene">
              {simulation.id === 'fusion' ? (
                <Suspense fallback={<div className="lab-scene-loader">Загрузка WebGL-сцены...</div>}>
                  <FusionScene
                    qualityTier={qualityTier}
                    speedMultiplier={speedMultiplier}
                    intensity={intensity}
                    isPaused={isPaused}
                    resetSignal={resetSignal}
                    autoRotate={autoRotate}
                  />
                </Suspense>
              ) : (
                <canvas ref={canvasRef} width={720} height={420} />
              )}
            </div>
            <aside className="lab-panel">
              <div className="lab-panel-tabs">
                <button type="button" className={activeTab === 'controls' ? 'active' : ''} onClick={() => setActiveTab('controls')}>Управление</button>
                <button type="button" className={activeTab === 'missions' ? 'active' : ''} onClick={() => setActiveTab('missions')}>Миссии</button>
                <button type="button" className={activeTab === 'help' ? 'active' : ''} onClick={() => setActiveTab('help')}>Справка</button>
              </div>
              {activeTab === 'controls' ? (
                <div className="lab-panel-content">
                  {simulation.id === 'forces-motion' ? (
                    <>
                      <div className="lab-modes">
                        <button type="button" className={mode === 'one-force' ? 'active' : ''} onClick={() => setMode('one-force')}>Одна сила</button>
                        <button type="button" className={mode === 'multi-force' ? 'active' : ''} onClick={() => setMode('multi-force')}>Несколько сил</button>
                        <button type="button" className={mode === 'friction' ? 'active' : ''} onClick={() => setMode('friction')}>Трение</button>
                      </div>
                      <label className="lab-control">
                        <SlidersHorizontal size={15} /> Масса
                        <input type="range" min="1" max="8" step="0.2" value={mass} onChange={(e) => setMass(Number(e.target.value))} />
                        <span>{mass.toFixed(1)} кг</span>
                      </label>
                      <label className="lab-control">
                        <Orbit size={15} /> Сила вправо
                        <input type="range" min="2" max="20" step="0.5" value={force} onChange={(e) => setForce(Number(e.target.value))} />
                        <span>{force.toFixed(1)} Н</span>
                      </label>
                      {mode === 'multi-force' ? (
                        <label className="lab-control">
                          <Orbit size={15} /> Сила влево
                          <input type="range" min="0" max="20" step="0.5" value={secondaryForce} onChange={(e) => setSecondaryForce(Number(e.target.value))} />
                          <span>{secondaryForce.toFixed(1)} Н</span>
                        </label>
                      ) : null}
                      {mode === 'friction' ? (
                        <label className="lab-control">
                          <Orbit size={15} /> Трение
                          <input type="range" min="0.05" max="0.9" step="0.05" value={friction} onChange={(e) => setFriction(Number(e.target.value))} />
                          <span>{friction.toFixed(2)}</span>
                        </label>
                      ) : null}
                    </>
                  ) : null}
                  <label className="lab-control">
                    <SlidersHorizontal size={15} /> Скорость
                    <input type="range" min="0.5" max="2" step="0.1" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(Number(e.target.value))} />
                    <span>{speedMultiplier.toFixed(1)}x</span>
                  </label>
                  <label className="lab-control">
                    <Orbit size={15} /> Интенсивность
                    <input type="range" min="0.5" max="1.8" step="0.1" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} />
                    <span>{intensity.toFixed(1)}</span>
                  </label>
                  {simulation.id === 'fusion' ? (
                    <button className="lab-action-btn" type="button" onClick={() => setAutoRotate((v) => !v)}>
                      Орбита: {autoRotate ? 'ON' : 'OFF'}
                    </button>
                  ) : null}
                  <div className="lab-actions-row">
                    <button className="lab-action-btn" type="button" onClick={() => setIsPaused((v) => !v)}>
                      {isPaused ? <Play size={15} /> : <Pause size={15} />}
                      {isPaused ? 'Пуск' : 'Пауза'}
                    </button>
                    <button className="lab-action-btn" type="button" onClick={doStep}>Шаг</button>
                    <button className="lab-action-btn" type="button" onClick={handleReset}>
                      <RotateCcw size={15} /> Сброс
                    </button>
                  </div>
                </div>
              ) : null}
              {activeTab === 'missions' ? (
                <div className="lab-panel-content">
                  <div className="lab-mission-progress">
                    <div>Прогресс: {missionDoneCount}/{missions.length}</div>
                    <div>{missionProgress}%</div>
                  </div>
                  <div className="lab-progress-bar"><span style={{ width: `${missionProgress}%` }} /></div>
                  {missions.map((mission) => (
                    <div key={mission.id} className={`lab-mission-item ${mission.done ? 'done' : ''}`}>
                      {mission.done ? '✓' : '○'} {mission.label}
                    </div>
                  ))}
                </div>
              ) : null}
              {activeTab === 'help' ? (
                <div className="lab-panel-content">
                  <p>1. Выбери режим и выставь параметры.</p>
                  <p>2. Нажми пуск или пошаговый запуск.</p>
                  <p>3. Смотри метрики и выполняй миссии справа.</p>
                  <div className="lab-kpis">
                    <div><span>Ускорение</span><strong>{telemetry.acceleration.toFixed(2)} м/с²</strong></div>
                    <div><span>Скорость</span><strong>{telemetry.velocity.toFixed(2)} м/с</strong></div>
                    <div><span>Положение</span><strong>{telemetry.position.toFixed(2)} м</strong></div>
                    <div><span>Время</span><strong>{telemetry.time.toFixed(1)} c</strong></div>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
