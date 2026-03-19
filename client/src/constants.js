import { Amphora, Crown, PiggyBank, Crosshair, Shield, Layers } from 'lucide-react';

// Единый словарь проектов (нужен для Header и фильтров)
export const PROJECTS = {
  ALL: { 
    id: 'all', 
    label: 'ВСЕ ПРОЕКТЫ', 
    color: '#7F7C8D', 
    icon: Layers 
  },
  NASLEDIE: { 
    id: 'nasledie', 
    label: 'НАСЛЕДИЕ', 
    color: '#FF5656', 
    icon: Amphora 
  },
  KORONA: { 
    id: 'korona', 
    label: 'КОРОНА', 
    color: '#B7791F', 
    icon: Crown 
  },
  BUDGET: { 
    id: 'budget', 
    label: 'БЮДЖЕТ', 
    color: '#A16207', 
    icon: PiggyBank 
  },
  NAPADENIE: { 
    id: 'napadenie', 
    label: 'НАПАДЕНИЕ', 
    color: '#B91C1C', 
    icon: Crosshair 
  },
  ZASHITA: { 
    id: 'zashita', 
    label: 'ЗАЩИТА', 
    color: '#0057FF', 
    icon: Shield 
  }
};

// Функция для получения цвета приоритета (для TaskCard)
export const getPriorityColor = (p) => {
  const priority = p ? p.toLowerCase() : 'green';
  switch (priority) {
    case 'red': return 'var(--color-red, #FF5656)';       // High
    case 'yellow': return 'var(--color-yellow, #FBBF24)'; // Medium
    case 'green': return 'var(--color-green, #10B981)';   // Low
    default: return 'var(--color-green, #10B981)';
  }
};

// Безопасная функция для получения проекта по ID (для TaskCard)
export const getProjectInfo = (projId) => {
  const raw = projId ? projId.toLowerCase() : 'nasledie';
  
  // Маппинг: превращаем серверные "defense" в наши "zashita" и т.д.
  let id = raw;
  if (raw === 'defense') id = 'zashita';
  if (raw === 'economy') id = 'budget';
  
  // Ищем в объекте PROJECTS
  const project = Object.values(PROJECTS).find(p => p.id === id);
  
  // Если не нашли (например, пришел мусор), возвращаем Наследие
  return project || PROJECTS.NASLEDIE;
};