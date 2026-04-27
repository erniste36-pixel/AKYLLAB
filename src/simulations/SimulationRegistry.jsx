import { lazy } from 'react';
import { Cpu, Atom, Divide, Beaker, Globe, Activity, Network, Fingerprint, Calculator, Flame, Zap, Wind, Droplets, Link2, Box, Leaf } from 'lucide-react';

export const SimulationRegistry = [
  // ----------------------------------------------------
  // WAVE 1 SIMULATIONS
  // ----------------------------------------------------
  {
    id: 'inf-astar', title: 'Алгоритмы: A* Поиск Пути', category: 'Информатика', icon: <Cpu size={16} />, color: '#8b5cf6',
    component: lazy(() => import('./Informatics/AStarBuilder')), active: true, previewMode: 'astar',
    imageUrl: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800&q=80'
  },
  {
    id: 'prism', title: 'Оптика: Преломление и Линзы', category: 'Физика', icon: <Atom size={16} />, color: '#3b82f6',
    component: lazy(() => import('./Physics/LensesRefraction')), active: true, previewMode: 'optics',
    imageUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&q=80'
  },
  {
    id: 'chem-atom', title: 'Конструктор Атомов', category: 'Химия', icon: <Beaker size={16} />, color: '#ec4899',
    component: lazy(() => import('./Chemistry/AtomConstructor')), active: true, previewMode: 'atom',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80'
  },
  {
    id: 'glb-scales', title: 'Масштабы Вселенной', category: 'Биология', icon: <Globe size={16} />, color: '#10b981',
    component: lazy(() => import('./Global/UniverseScales')), active: true, previewMode: 'scales',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80'
  },
  {
    id: 'math-circle', title: 'Тригонометрия и Графики', category: 'Математика', icon: <Divide size={16} />, color: '#f59e0b',
    component: lazy(() => import('./Math/UnitCircle')), active: true, previewMode: 'math',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80'
  },
  // ----------------------------------------------------
  // WAVE 2 SIMULATIONS
  // ----------------------------------------------------
  {
    id: 'forces-motion', title: 'Второй закон Ньютона', category: 'Физика', icon: <Activity size={16} />, color: '#3b82f6',
    component: lazy(() => import('./Physics/PhysicsNewtonCanvas')), active: true, previewMode: 'mechanics',
    imageUrl: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=800&q=80'
  },
  {
    id: 'chem-titration', title: 'Титрование и pH', category: 'Химия', icon: <Beaker size={16} />, color: '#ec4899',
    component: lazy(() => import('./Chemistry/ChemistryTitrationCanvas')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1603126857599-f6e1570d2683?w=800&q=80'
  },
  {
    id: 'mitosis', title: 'Деление Клетки (Митоз)', category: 'Биология', icon: <Fingerprint size={16} />, color: '#10b981',
    component: lazy(() => import('./Biology/BiologyMitosis')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1530973428-5bf2db015a13?w=800&q=80'
  },
  {
    id: 'neural', title: 'Нейросети', category: 'Информатика', icon: <Network size={16} />, color: '#8b5cf6',
    component: lazy(() => import('./Informatics/InformaticsNeuralNet')), active: true, previewMode: 'astar',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80'
  },
  {
    id: 'math-fractals', title: 'Множество Мандельброта', category: 'Математика', icon: <Calculator size={16} />, color: '#f59e0b',
    component: lazy(() => import('./Math/MathFractals')), active: true, previewMode: 'math',
    imageUrl: 'https://images.unsplash.com/photo-1505506874110-6a7a48e147df?w=800&q=80'
  },
  // ----------------------------------------------------
  // WAVE 3 (NEW - 20 IDEAS FROM VIDEO EXPANSION)
  // ----------------------------------------------------
  {
    id: 'rocket', title: 'Физика: Запуск Ракеты', category: 'Физика', icon: <Flame size={16} />, color: '#ef4444',
    component: lazy(() => import('./Physics/PhysicsRocketLaunch')), active: true, previewMode: 'mechanics',
    imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&q=80'
  },
  {
    id: 'kepler', title: 'Kepler\'s Laws', category: 'Астрономия', icon: <Globe size={16} />, color: '#6366f1',
    component: lazy(() => import('./Astronomy/AstronomyKeplersLaws')), active: true, previewMode: 'scales',
    imageUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80'
  },
  {
    id: 'fusion', title: 'Термоядерный Синтез (Токамак)', category: 'Физика', icon: <Flame size={16} />, color: '#f43f5e',
    component: lazy(() => import('./Physics/PhysicsFusionTokamak')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1614729939124-032f0b5609ce?w=800&q=80'
  },
  {
    id: 'blood', title: 'Blood Circulation (Сердце)', category: 'Биология', icon: <Activity size={16} />, color: '#ef4444',
    component: lazy(() => import('./QuizSimulation')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80'
  },
  {
    id: 'mars-rover', title: 'Программирование Марсохода', category: 'Информатика', icon: <Cpu size={16} />, color: '#38bdf8',
    component: lazy(() => import('./Informatics/MarsRoverProgramming')), active: true, previewMode: 'astar',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80'
  },
  {
    id: 'protractor', title: 'Angles and Protractor', category: 'Математика', icon: <Calculator size={16} />, color: '#eab308',
    component: lazy(() => import('./ClickerSimulation')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1615555627546-5993de0b6e4e?w=800&q=80'
  },
  {
    id: 'entanglement', title: 'Квантовая запутанность', category: 'Физика', icon: <Zap size={16} />, color: '#8b5cf6',
    component: lazy(() => import('./Physics/PhysicsQuantumEntanglement')), active: true, previewMode: 'mechanics',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80'
  },
  {
    id: 'levitation', title: 'Акустическая левитация', category: 'Физика', icon: <Wind size={16} />, color: '#38bdf8',
    component: lazy(() => import('./Physics/PhysicsAcousticLevitation')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1516035270119-9ce7c3761cc2?w=800&q=80'
  },
  {
    id: 'reaction-rate', title: 'Скорость реакции', category: 'Химия', icon: <Flame size={16} />, color: '#fb923c',
    component: lazy(() => import('./Chemistry/ChemistryReactionRate')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1541818224527-31ef0c3dc0ff?w=800&q=80'
  },
  {
    id: 'electrolysis', title: 'Электролиз воды', category: 'Химия', icon: <Droplets size={16} />, color: '#3b82f6',
    component: lazy(() => import('./Chemistry/ChemistryElectrolysis')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1527660233045-8fbfd84fde9b?w=800&q=80'
  },
  {
    id: 'crystallization', title: 'Кристаллизация', category: 'Химия', icon: <Box size={16} />, color: '#f9a8d4',
    component: lazy(() => import('./Chemistry/ChemistryCrystallization')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1614729939124-032f0b5609ce?w=800&q=80'
  },
  {
    id: 'benzene', title: 'Органическая химия', category: 'Химия', icon: <Link2 size={16} />, color: '#ec4899',
    component: lazy(() => import('./Chemistry/ChemistryOrganics')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1582719202047-97d812ebdf92?w=800&q=80'
  },
  {
    id: 'heart', title: 'Работа сердца 3D', category: 'Биология', icon: <Activity size={16} />, color: '#ef4444',
    component: lazy(() => import('./Biology/BiologyHeart')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80'
  },
  {
    id: 'evolution', title: 'Эволюция видов', category: 'Биология', icon: <Globe size={16} />, color: '#10b981',
    component: lazy(() => import('./Biology/BiologyEvolution')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1549480017-d76466a4b8e8?w=800&q=80'
  },
  {
    id: 'golden-ratio', title: 'Золотое сечение', category: 'Математика', icon: <Calculator size={16} />, color: '#fbbf24',
    component: lazy(() => import('./Math/MathGoldenRatio')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1505506874110-6a7a48e147df?w=800&q=80'
  },
  {
    id: 'pi', title: 'Число Пи: Развертка', category: 'Математика', icon: <Calculator size={16} />, color: '#f59e0b',
    component: lazy(() => import('./Math/MathPi')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1506456184511-b1e4e137b0c3?w=800&q=80'
  },
  {
    id: 'chaos', title: 'Теория Хаоса (Эффект бабочки)', category: 'Математика', icon: <Wind size={16} />, color: '#eab308',
    component: lazy(() => import('./Math/MathChaos')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1460500063983-994d4c27756c?w=800&q=80'
  },
  {
    id: 'greenhouse', title: 'Парниковый эффект', category: 'Экология', icon: <Globe size={16} />, color: '#84cc16',
    component: lazy(() => import('./Ecology/EcologyGreenhouse')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&q=80'
  },
  {
    id: 'ocean-cleanup', title: 'Очистка океана', category: 'Экология', icon: <Droplets size={16} />, color: '#0ea5e9',
    component: lazy(() => import('./Ecology/EcologyOceanCleanup')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-25ff0109ae9b?w=800&q=80'
  },
  {
    id: 'davinci-bridge', title: 'Мост да Винчи', category: 'Инженерия', icon: <Box size={16} />, color: '#64748b',
    component: lazy(() => import('./Engineering/EngineeringDaVinci')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1517409276991-645c115712f5?w=800&q=80'
  },
  {
    id: 'star-birth', title: 'Рождение звезды', category: 'Астрономия', icon: <Zap size={16} />, color: '#f97316',
    component: lazy(() => import('./Astronomy/AstronomyStarBirth')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=800&q=80'
  },
  {
    id: 'lensing', title: 'Гравитационное линзирование', category: 'Астрономия', icon: <Globe size={16} />, color: '#6366f1',
    component: lazy(() => import('./Astronomy/AstronomyLensing')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80'
  },
  // ----------------------------------------------------
  // WAVE 4 SIMULATIONS (New 20+ Chemistry / Physics / Bio / Geology)
  // ----------------------------------------------------
  {
    id: 'hydrolysis', title: 'Гидролиз солей', category: 'Химия', icon: <Droplets size={16} />, color: '#38bdf8',
    component: lazy(() => import('./Chemistry/ChemistryHydrolysis')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80'
  },
  {
    id: 'redox', title: 'ОВР — Гальванический элемент', category: 'Химия', icon: <Zap size={16} />, color: '#facc15',
    component: lazy(() => import('./Chemistry/ChemistryRedox')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80'
  },
  {
    id: 'diffusion', title: 'Диффузия газов', category: 'Химия', icon: <Wind size={16} />, color: '#7dd3fc',
    component: lazy(() => import('./Chemistry/ChemistryDiffusion')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1614709093620-79d9dc2df3c0?w=800&q=80'
  },
  {
    id: 'polymerization', title: 'Полимеризация', category: 'Химия', icon: <Link2 size={16} />, color: '#34d399',
    component: lazy(() => import('./Chemistry/ChemistryPolymerization')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1635241161466-541f065683ba?w=800&q=80'
  },
  {
    id: 'sublimation', title: 'Сублимация (I₂)', category: 'Химия', icon: <Zap size={16} />, color: '#a78bfa',
    component: lazy(() => import('./Chemistry/ChemistrySublimation')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80'
  },
  {
    id: 'convection', title: 'Конвекция', category: 'Физика', icon: <Flame size={16} />, color: '#fb923c',
    component: lazy(() => import('./Physics/PhysicsConvection')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800&q=80'
  },
  {
    id: 'interference', title: 'Интерференция (Опыт Юнга)', category: 'Физика', icon: <Zap size={16} />, color: '#818cf8',
    component: lazy(() => import('./Physics/PhysicsInterference')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80'
  },
  {
    id: 'radioactive-decay', title: 'Радиоактивный распад', category: 'Физика', icon: <Activity size={16} />, color: '#4ade80',
    component: lazy(() => import('./Physics/PhysicsRadioactiveDecay')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80'
  },
  {
    id: 'photoelectric', title: 'Фотоэффект', category: 'Физика', icon: <Zap size={16} />, color: '#fde047',
    component: lazy(() => import('./Physics/PhysicsPhotoelectric')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1501446529957-6226b61ee504?w=800&q=80'
  },
  {
    id: 'induction', title: 'Электромагнитная Индукция', category: 'Физика', icon: <Zap size={16} />, color: '#f59e0b',
    component: lazy(() => import('./Physics/PhysicsInduction')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&q=80'
  },
  {
    id: 'photosynthesis', title: 'Фотосинтез', category: 'Биология', icon: <Leaf size={16} />, color: '#22c55e',
    component: lazy(() => import('./Biology/BiologyPhotosynthesis')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
  },
  {
    id: 'osmosis', title: 'Осмос', category: 'Биология', icon: <Droplets size={16} />, color: '#06b6d4',
    component: lazy(() => import('./Biology/BiologyOsmosis')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80'
  },
  {
    id: 'transcription', title: 'Транскрипция и Трансляция', category: 'Биология', icon: <Cpu size={16} />, color: '#10b981',
    component: lazy(() => import('./Biology/BiologyTranscription')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80'
  },
  {
    id: 'erosion', title: 'Эрозия горных пород', category: 'Геология', icon: <Globe size={16} />, color: '#d97706',
    component: lazy(() => import('./Geology/GeologyErosion')), active: true, previewMode: 'default',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
  }
];
