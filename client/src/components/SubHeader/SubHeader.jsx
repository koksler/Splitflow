import React, { useState, useRef } from 'react';
import { ArrowDownUp, Filter } from 'lucide-react';
import Button from '../Buttons/Button';
import Input from '../Inputs/Inputs';
import './SubHeader.css';

const SubHeader = ({ 
  variant,
  searchValue, 
  onSearchChange, 
  onAddClick, 
  sortBy, 
  onSortChange, 
  filterValue,
  onFilterChange,
  onCsvUpload 
}) => {
  const [activeMenu, setActiveMenu] = useState(null); 
  const fileInputRef = useRef(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && onCsvUpload) onCsvUpload(file);
    e.target.value = null; 
  };

  const configs = {
    analytics: { title: 'Аналитика', hasActions: false, hasSearch: false },
    kanban: { title: 'Текущие Задачи', buttonText: 'Добавить Задачу', hasActions: true, hasSearch: true, hasCsv: true }, // <-- ВКЛЮЧИЛИ CSV
    employees: { title: 'Таблица Сотрудников', buttonText: 'Добавить Сотрудника', hasActions: true, hasSearch: true, hasCsv: true }
  };

  const config = configs[variant] || configs.analytics;

  const sortOptions = variant === 'employees' 
    ?[ { label: 'По ID', val: 'id' }, { label: 'По имени', val: 'name' }, { label: 'По KPI', val: 'kpi' } ]
    :[ { label: 'По дате', val: 'date' }, { label: 'По названию', val: 'name' } ];

  const filterOptions = variant === 'employees'
    ?[ { label: 'Уровень 5 (Макс)', val: '5' }, { label: 'Только Бессрочные', val: 'bessrochniy' } ]
    :[ { label: 'Высокий (Red)', val: 'red' }, { label: 'Средний (Yellow)', val: 'yellow' }, { label: 'Низкий (Green)', val: 'green' } ];

  return (
    <div className="subheader-container">
      <div className="subheader-main-island">
        <h2 className="subheader-title">{config.title}</h2>
        
        {config.hasActions && (
          <div className="subheader-actions">
            
            <div className="dropdown-wrapper">
              <Button variant="icon" onClick={() => toggleMenu('sort')} title="Сортировка">
                <ArrowDownUp size={24} color={sortBy ? 'var(--color-accentum)' : 'var(--color-text-gray)'} />
              </Button>
              {activeMenu === 'sort' && (
                <div className="mini-popup">
                  {sortOptions.map(opt => (
                    <div key={opt.val} className="popup-item" onClick={() => { onSortChange && onSortChange(opt.val); setActiveMenu(null); }}>
                      {opt.label}
                    </div>
                  ))}
                  <div className="popup-divider" />
                  <div className="popup-item clear-opt" onClick={() => { onSortChange && onSortChange(null); setActiveMenu(null); }}>Сбросить</div>
                </div>
              )}
            </div>

            <div className="dropdown-wrapper">
              <Button variant="icon" onClick={() => toggleMenu('filter')} title="Фильтры">
                <Filter size={24} color={filterValue ? 'var(--color-accentum)' : 'var(--color-text-gray)'} />
              </Button>
              {activeMenu === 'filter' && (
                <div className="mini-popup">
                  {filterOptions.map(opt => (
                    <div key={opt.val} className="popup-item" onClick={() => { onFilterChange && onFilterChange(opt.val); setActiveMenu(null); }}>
                      {opt.label}
                    </div>
                  ))}
                  <div className="popup-divider" />
                  <div className="popup-item clear-opt" onClick={() => { onFilterChange && onFilterChange(null); setActiveMenu(null); }}>Сбросить</div>
                </div>
              )}
            </div>

            {config.hasCsv && (
              <>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileSelect} />
                <Button variant="full-unfocused" onClick={() => fileInputRef.current.click()}>Импорт CSV</Button>
              </>
            )}

            <Button variant="full" onClick={onAddClick}>{config.buttonText}</Button>
          </div>
        )}
      </div>

      {config.hasSearch && (
        <div className="subheader-search-island">
          <Input 
            variant="search" type="text" placeholder="Поиск"
            value={searchValue || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default SubHeader;