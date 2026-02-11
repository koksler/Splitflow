import React, { useState, useEffect } from 'react';
import './Employees.css';

const EmployeesTable = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  // Загрузка данных
  useEffect(() => {
    fetch("http://localhost:5268/api/employees") // Твой порт
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error(err));
  }, []);

  // Логика фильтрации (Поиск)
  const filteredEmployees = employees.filter(emp => {
    if (!search) return true;
    const lowSearch = search.toLowerCase();
    
    // Поиск по ID, Имени или Почте
    return (
      emp.id.toString().includes(lowSearch) || 
      emp.name.toLowerCase().includes(lowSearch) ||
      emp.email.toLowerCase().includes(lowSearch)
    );
  });

  return (
    <div className="employees-container">
      
      {/* Заголовок и Поиск */}
      <div className="employees-header-block">
        <h1 className="page-title">Таблица Сотрудников</h1>
        <input 
          className="search-bar" 
          placeholder="Поиск (по ID, Имени или E-Mail)" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Шапка таблицы */}
      <div className="grid-table table-header">
        <div>Сотрудник</div>
        <div>ID</div>
        <div>E-Mail</div>
        <div>Должность</div>
        <div>Специализация</div>
        <div>Отделение</div>
        <div>Уровень Допуска</div>
        <div>Тип Контракта</div>
        <div>KPI</div>
      </div>

      {/* Список (Скролл) */}
      <div className="table-body">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="grid-table table-row">
            
            {/* 1. Имя + Аватарка (можно добавить картинку, если хочешь) */}
            <div className="cell" style={{fontWeight: 500}}>
              {emp.name}
            </div>

            {/* 2. ID */}
            <div className="cell" style={{color: 'var(--color-text-gray)'}}>
              {emp.id}
            </div>

            {/* 3. Email */}
            <div className="cell" style={{color: 'var(--color-text-gray)'}}>
              {emp.email}
            </div>

            {/* 4. Должность */}
            <div className="cell">{emp.position}</div>

            {/* 5. Специализация */}
            <div className="cell" title={emp.specialization}>{emp.specialization}</div>

            {/* 6. Отделение */}
            <div className="cell">{emp.department}</div>

            {/* 7. Допуск */}
            <div className="cell" style={{textAlign: 'center'}}>{emp.clearanceLevel}</div>

            {/* 8. Контракт */}
            <div className="cell">{emp.contractType}</div>

            {/* 9. KPI */}
            <div className="cell">
              <span className={`kpi-badge kpi-${emp.kpi?.replace('+','-plus')}`}>
                {emp.kpi}
              </span>
            </div>

          </div>
        ))}
        
        {/* Если ничего не найдено */}
        {filteredEmployees.length === 0 && (
          <div style={{padding: '40px', textAlign: 'center', color: '#7F7C8D'}}>
            Сотрудники не найдены
          </div>
        )}
      </div>

    </div>
  );
};

export default EmployeesTable;