import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimulationConceptCard from '../interface/concept/SimulationConceptCard';
import LabModal from '../interface/concept/LabModal';
import { stemConcepts } from '../data/stemConcepts';

const CATEGORY_EMOJIS = {
  'Все': '◎',
  'Физика': '⚛',
  'Химия': '⬡',
  'Биология': '◉',
  'Математика': '∑',
  'Экология': '◈',
  'Инженерия': '⬙',
  'Астрономия': '✦',
  'Геология': '▲',
  'Информатика': '⌘',
};

export default function Simulations() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Все');
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [qualityTier, setQualityTier] = useState('high');

  const categories = useMemo(() => {
    const cats = ['Все', ...new Set(stemConcepts.map(s => s.category))];
    return cats;
  }, []);

  const filteredSims = useMemo(() => {
    return filter === 'Все' ? stemConcepts : stemConcepts.filter(s => s.category === filter);
  }, [filter]);

  useEffect(() => {
    const memory = navigator.deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 8;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || memory <= 4 || cores <= 4) { setQualityTier('low'); return; }
    if (memory <= 8 || cores <= 6) { setQualityTier('medium'); return; }
    setQualityTier('high');
  }, []);

  return (
    <div className="concept-page">

      {/* Top header */}
      <div className="forge-page-header">
        <div>
          <h1 className="forge-page-title">Лаборатории</h1>
          <div className="forge-page-meta">
            {filteredSims.length} симуляций · Выберите модуль и откройте его
          </div>
        </div>

        {/* Category filters */}
        <div className="concept-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8em' }}>
                {CATEGORY_EMOJIS[cat] || '·'}
              </span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="concept-grid">
        {filteredSims.map((sim, i) => (
          <SimulationConceptCard
            key={sim.id}
            simulation={sim}
            index={i}
            onLaunch={(s) => navigate(`/simulation/${s.id}`)}
            qualityTier={qualityTier}
          />
        ))}
      </section>

      {selectedSimulation && (
        <LabModal
          simulation={selectedSimulation}
          onClose={() => setSelectedSimulation(null)}
          qualityTier={qualityTier}
        />
      )}
    </div>
  );
}
