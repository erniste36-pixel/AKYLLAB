import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function DailyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Пройти 1 симуляцию по Физике', completed: false, xp: 50 },
    { id: 2, title: 'Проверить закон Ньютона', completed: false, xp: 30 },
    { id: 3, title: 'Зайти в профиль', completed: true, xp: 10 },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const totalXP = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0);
  const maxXP = tasks.reduce((sum, t) => sum + t.xp, 0);
  const progress = (totalXP / maxXP) * 100;

  if (!user) return null; // Only show for logged in users, or if we want to show for everyone we can remove this. Let's show it to motivate registration. Wait, the user logic is better: if not logged in, ask them to log in to track tasks.

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target color="var(--secondary)" /> Ежедневные Задачи
        </h3>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Заработано: <strong style={{ color: 'var(--secondary)' }}>{totalXP} XP</strong></span>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.4)', height: '6px', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 0.5s ease', boxShadow: '0 0 10px var(--secondary)' }}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => toggleTask(task.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              padding: '0.75rem', borderRadius: '8px', 
              background: task.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${task.completed ? '#10b981' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.2s',
              opacity: task.completed ? 0.7 : 1
            }}
          >
            {task.completed ? <CheckCircle2 color="#10b981" size={20} /> : <Circle color="var(--text-secondary)" size={20} />}
            <span style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: task.completed ? '#10b981' : 'var(--secondary)' }}>+{task.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
