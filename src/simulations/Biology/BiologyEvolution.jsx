import { useRef, useEffect, useState } from 'react';
import { Globe, Info } from 'lucide-react';

export default function BiologyEvolution() {
  const canvasRef = useRef(null);
  
  // Контроллеры пользователя
  const [mutationRate, setMutationRate] = useState(15); // %
  const [foodSizeSetting, setFoodSizeSetting] = useState(10); // 5 to 20
  const [predators, setPredators] = useState(0); 
  
  const [generation, setGeneration] = useState(0);
  const [avgBeakSize, setAvgBeakSize] = useState(10);

  // Храним популяцию за рамками рендера чтобы не сбрасывалась
  const populationRef = useRef({ birds: [], foods: [], gen: 1 });

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Инициализация при первом запуске
    if (populationRef.current.birds.length === 0) {
        for(let i=0; i<30; i++) {
            populationRef.current.birds.push({
                x: Math.random() * width, y: Math.random() * height,
                vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
                beakSize: 10 + (Math.random()*4 - 2), // Start ~10
                energy: 100,
                color: `hsl(${Math.random()*360}, 70%, 60%)`
            });
        }
        populationRef.current.gen = 1;
    }

    let time = 0;
    let ticks = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#1e293b'; // Цвет почвы/леса
      ctx.fillRect(0, 0, width, height);
      
      const { birds, foods } = populationRef.current;
      time += 0.016;
      ticks++;

      // Генерация еды
      if (Math.random() < 0.1 && foods.length < 50) {
          // Еда генерируется случайного размера вокруг целевого foodSizeSetting
          foods.push({
              x: Math.random() * width, y: Math.random() * height,
              size: Math.max(2, foodSizeSetting + (Math.random()*6 - 3))
          });
      }

      // Естественный отбор / Хищники
      if (predators > 0 && Math.random() < predators * 0.005 && birds.length > 5) {
          // Хищники съедают самую медленную или случайную
          birds.splice(Math.floor(Math.random() * birds.length), 1);
      }

      let totalBeak = 0;

      // Логика Птиц
      for (let i = birds.length - 1; i >= 0; i--) {
          let b = birds[i];
          
          totalBeak += b.beakSize;
          
          // Поиск ближайшей еды
          let nearestFood = null;
          let minDist = 200;
          let nearestFoodIndex = -1;

          foods.forEach((f, idx) => {
              const dist = Math.sqrt((f.x - b.x)**2 + (f.y - b.y)**2);
              if (dist < minDist) {
                  minDist = dist;
                  nearestFood = f;
                  nearestFoodIndex = idx;
              }
          });

          // Движение к еде или случайное
          if (nearestFood) {
              b.vx += (nearestFood.x - b.x) * 0.001;
              b.vy += (nearestFood.y - b.y) * 0.001;
          } else {
              b.vx += (Math.random() - 0.5) * 0.2;
              b.vy += (Math.random() - 0.5) * 0.2;
          }

          // Физика
          const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
          if (speed > 3) {
             b.vx = (b.vx/speed)*3;
             b.vy = (b.vy/speed)*3;
          }
          
          b.x += b.vx; b.y += b.vy;
          b.energy -= 0.15; // Трата энергии на жизнь

          // Границы
          if(b.x < 0 || b.x > width) b.vx *= -1;
          if(b.y < 0 || b.y > height) b.vy *= -1;

          // Поедание
          if (nearestFood && minDist < 15) {
              // ШТРАФ или БОНУС в зависимости от размера клюва vs размера еды!
              const fitness = Math.abs(b.beakSize - nearestFood.size);
              if (fitness < 4) {
                  b.energy += 40; // Идеально подходит
              } else {
                  b.energy += 10; // С трудом ест
              }
              foods.splice(nearestFoodIndex, 1);
          }

          // Смерть от голода
          if (b.energy <= 0) {
              birds.splice(i, 1);
              continue;
          }

          // Размножение (Митоз с Мутацией)
          if (b.energy > 200) {
              b.energy = 50;
              // Мутация размера клюва
              let newBeak = b.beakSize;
              if (Math.random() * 100 < mutationRate) {
                  newBeak += (Math.random() * 4 - 2); 
                  newBeak = Math.max(2, newBeak);
              }

              birds.push({
                  x: b.x, y: b.y,
                  vx: -b.vx, Math: -b.vy,
                  beakSize: newBeak,
                  energy: 50,
                  color: b.color // Наследует цвет для понимания родства
              });
          }

          // Отрисовка Птицы
          ctx.translate(b.x, b.y);
          ctx.rotate(Math.atan2(b.vy, b.vx));

          // Тело
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI*2);
          ctx.fill();

          // Клюв (адаптивная длина!)
          ctx.fillStyle = '#fcd34d';
          ctx.beginPath();
          ctx.moveTo(8, -3);
          ctx.lineTo(8 + b.beakSize, 0); // Длина зависит от ДНК (beakSize)
          ctx.lineTo(8, 3);
          ctx.fill();

          ctx.rotate(-Math.atan2(b.vy, b.vx));
          ctx.translate(-b.x, -b.y);
      }

      // Если все вымерли
      if (birds.length === 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.font = '30px Arial';
          ctx.fillText('Популяция вымерла!', width/2 - 140, height/2);
      }

      // Смена поколений (условно каждые 500 тиков)
      if (ticks % 500 === 0 && birds.length > 0) {
          populationRef.current.gen++;
          setGeneration(populationRef.current.gen);
      }

      if (birds.length > 0 && ticks % 30 === 0) {
          setAvgBeakSize((totalBeak / birds.length).toFixed(1));
      }

      // Отрисовка еды
      foods.forEach(f => {
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          // Звезда / Семечка
          ctx.arc(f.x, f.y, f.size/2, 0, Math.PI*2);
          ctx.fill();
      });

      // HUD
      ctx.fillStyle = '#fff';
      ctx.font = '12px Courier';
      ctx.fillText(`Птиц: ${birds.length}`, 10, 20);
      ctx.fillText(`Еды: ${foods.length}`, 10, 40);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [mutationRate, foodSizeSetting, predators]);

  const restart = () => {
      populationRef.current = { birds: [], foods: [], gen: 1 };
      setGeneration(1);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full text-slate-100 flex-nowrap w-full">
      <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative min-w-[300px]">
        <canvas ref={canvasRef} width={600} height={500} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-600 p-3 rounded-lg backdrop-blur-md text-right">
           <div className="text-emerald-400 font-bold mb-1 border-b border-slate-700 pb-1">Эволюция (Дарвин)</div>
           <div className="text-sm">Поколение: <span className="font-mono text-white">{generation}</span></div>
           <div className="text-sm">Средний клюв: <span className="font-mono text-yellow-400">{avgBeakSize} мм</span></div>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-5 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-600 pb-2">
             <Globe className="text-emerald-500" /> Естественный отбор
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             Вьюрки Галапагосских островов. Если птица ест семена, которые подходят по размеру к её клюву, она получает больше энергии и размножается!
          </p>
        </div>

        <label className="flex flex-col gap-2 font-bold text-green-400 text-sm">
           Размер семян (Условия среды): {foodSizeSetting} мм
           <input type="range" min="4" max="25" step="1" value={foodSizeSetting} onChange={e => setFoodSizeSetting(Number(e.target.value))} className="accent-green-500" />
           <span className="text-xs text-slate-400 font-normal">Сдвинь ползунок, и выживут только птицы с мутациями нужного клюва.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-fuchsia-400 text-sm">
           Частота мутаций ДНК: {mutationRate}%
           <input type="range" min="0" max="50" step="5" value={mutationRate} onChange={e => setMutationRate(Number(e.target.value))} className="accent-fuchsia-500" />
           <span className="text-xs text-slate-400 font-normal">Как сильно может измениться клюв у потомства по сравнению с родителем.</span>
        </label>

        <label className="flex flex-col gap-2 font-bold text-red-400 text-sm">
           Угроза хищников: {predators}/10
           <input type="range" min="0" max="10" step="1" value={predators} onChange={e => setPredators(Number(e.target.value))} className="accent-red-500" />
        </label>

        <button onClick={restart} className="bg-slate-700 hover:bg-slate-600 py-2 rounded-md font-bold text-white border border-slate-500 mt-2">Перезаселить остров</button>

        <div className="mt-auto bg-slate-900 flex items-start gap-3 p-4 rounded text-xs border border-emerald-900/40 shadow-inner text-slate-300">
           <Info size={16} className="shrink-0 mt-0.5 text-emerald-400" />
           <div>
             <strong>Адаптация:</strong> Измените размер семян на 25мм. Птицы с маленькими клювами (10мм) начнут вымирать, так как не смогут эффективно клевать пищу, а генетические линии с крупными клювами доминируют.
           </div>
        </div>
      </div>
    </div>
  );
}
