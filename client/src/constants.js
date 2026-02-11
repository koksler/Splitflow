import { Amphora, PiggyBank, Shield, Layers } from 'lucide-react';

export const PROJECTS = {
  NASLEDIE: { 
    id: 'nasledie', 
    label: 'НАСЛЕДИЕ', 
    color: '#FF5656', 
    icon: Amphora 
  },
  ECONOMY: { 
    id: 'economy', 
    label: 'ЭКОНОМИКА', 
    color: '#B7791F', // Коричнево-золотой
    icon: PiggyBank 
  },
  DEFENSE: { 
    id: 'defense', 
    label: 'ЗАЩИТА', 
    color: '#0057FF',
    icon: Shield 
  },
  ALL: {
    id: 'all',
    label: 'ВСЕ ПРОЕКТЫ',
    color: '#7F7C8D',
    icon: Layers
  }
};