import React, { useState } from 'react';
import {
  LogOut,
  LayoutDashboard,
  PackageCheck,
  FileUser,
  ChevronDown,
  Bolt 
} from 'lucide-react';
import './Header.css';
import Button from '../Buttons/Button'
import { PROJECTS } from '../../constants.js';

const Header = ({ user, activeTab, onTabChange, onLogout, currentProject, setCurrentProject }) => {
  const [isProjectMenuOpen, setMenuOpen] = useState(false);

  const projectKey = currentProject ? currentProject.toUpperCase() : 'ALL';
  const activeProjConfig = PROJECTS[projectKey] || PROJECTS.ALL;
  const ActiveIcon = activeProjConfig?.icon || PackageCheck;

  const handleProjectSelect = (projKey) => {
    setCurrentProject(PROJECTS[projKey].id);
    setMenuOpen(false);
  };

  const avatarUrl = (user?.avatar || user?.Avatar)
    ? `/avatars/${user.avatar || user.Avatar}`
    : '/avatars/default.jpg';

  return (
    <div className="header-wrapper">

      {/* 1. ОСТРОВ ПРОФИЛЯ (Левый) - 278px */}
      <div className="header-island left-island">
        {/* TODO: Заменить на динамическое лого БД, когда добавим в бэкенд */}
        <div className="db-logo-box">
          <img src="/visk-proj.png" alt="DB" className="db-logo-img" />
        </div>

        <div className="avatar-box">
          <img src={avatarUrl} alt="Avatar" className="avatar-img" />
        </div>

        <div className="profile-info">
          <span className="profile-name">
            {user?.name || "Al. Vorontsova"}
          </span>
          <span className="profile-role">
            {user?.position || "Член Комитета"}
          </span>
        </div>

        <Button variant="icon" onClick={onLogout} title="Выйти">
          <LogOut size={24} />
        </Button>
      </div>

      {/* 2. ОСТРОВ НАВИГАЦИИ (Центр) - 398px */}
      <div className="header-island center-island">
        <button
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
        >
          <LayoutDashboard size={24} />
          <span>Аналитика</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => onTabChange('kanban')}
        >
          <PackageCheck size={24} />
          <span>Задачи</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => onTabChange('employees')}
        >
          <FileUser size={24} />
          <span>Сотрудники</span>
        </button>
      </div>

      {/* 3. ОСТРОВ ПРОЕКТОВ (Правый) - 278px */}
      <div className="header-island right-island">
        
        <div className="project-selector" onClick={() => setMenuOpen(!isProjectMenuOpen)}>
          <div className="project-icon-box" style={{ backgroundColor: activeProjConfig?.color || '#7F7C8D' }}>
            <ActiveIcon size={24} color="white" />
          </div>
          
          <div className="project-text-box">
            <span className="project-label">Текущий проект</span>
            <span className="project-name">{activeProjConfig?.label || 'ВСЕ ПРОЕКТЫ'}</span>
          </div>
          
          <ChevronDown size={24} color="#7F7C8D" style={{ marginLeft: 'auto', marginRight: '5px' }} />
        </div>

        {/* Кнопка настроек вместо рамки у селектора */}
        <Button variant="icon" title="Настройки" onClick={() => console.log('Settings')}>
          <Bolt size={24} />
        </Button>

        {/* DROPDOWN MENU */}
        {isProjectMenuOpen && (
          <div className="project-dropdown">
            {Object.keys(PROJECTS).map(key => {
              const proj = PROJECTS[key];
              const Icon = proj.icon;
              return (
                <div
                  key={key}
                  className={`dropdown-item ${currentProject === proj.id ? 'active' : ''}`}
                  onClick={() => handleProjectSelect(key)}
                >
                  <div className="dropdown-icon" style={{ backgroundColor: proj.color }}>
                    <Icon size={24} />
                  </div>
                  <span className="dropdown-text">{proj.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Header;