import React from 'react';
import { ArrowDownUp, Filter } from 'lucide-react';
import Button from '../Buttons/Button';
import './SubHeader.css';
import Input from '../Inputs/Inputs';

const SubHeader = ({ 
  variant,
  searchValue, 
  onSearchChange, 
  onAddClick, 
  onSortClick, 
  onFilterClick 
}) => {

  const configs = {
    analytics: {
      title: 'Аналитика',
      hasActions: false,
      hasSearch: false,
    },
    kanban: {
      title: 'Текущие Задачи',
      buttonText: 'Добавить Задачу',
      hasActions: true,
      hasSearch: true,
    },
    employees: {
      title: 'Таблица Сотрудников',
      buttonText: 'Добавить Сотрудника',
      hasActions: true,
      hasSearch: true,
    }
  };

  const config = configs[variant] || configs.analytics;

  return (
    <div className="subheader-container">
      
      {/* ЛЕВЫЙ ОСТРОВ: Заголовок и Действия */}
      <div className="subheader-main-island">
        <h2 className="subheader-title">{config.title}</h2>
        
        {config.hasActions && (
          <div className="subheader-actions">
            <Button variant = "icon" onClick={onSortClick} title="Сортировка">
              <ArrowDownUp size={24} color="var(--color-accentum)" />
            </Button>
            
            <Button variant = "icon" onClick={onFilterClick} title="Фильтры">
              <Filter size={24} color="var(--color-accentum)" />
            </Button>
            
            <Button variant="full" onClick={onAddClick}>
              {config.buttonText}
            </Button>
          </div>
        )}
      </div>

      {/* ПРАВЫЙ ОСТРОВ: Поиск (рендерится только если нужен) */}
      {config.hasSearch && (
        <div className="subheader-search-island">
          <Input 
            variant='search'
            type="text"
            className="subheader-search-input"
            placeholder="Поиск"
            value={searchValue || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      )}

    </div>
  );
};

export default SubHeader;