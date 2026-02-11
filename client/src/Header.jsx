import React, {useState} from 'react';
import { 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Users, 
  Filter, 
  ChevronDown,
  Amphora 
} from 'lucide-react';
import './Header.css';
import './buttons.css'
import { PROJECTS } from './constants.js';

const Header = ({ user, onLogout, activeTab, setActiveTab, currentProject, setCurrentProject }) => {
  const [isProjectMenuOpen, setMenuOpen] = useState(false);
  // Получаем конфиг текущего выбранного проекта
  const projectKey = currentProject ? currentProject.toUpperCase() : 'ALL';
  const activeProjConfig = PROJECTS[projectKey] || PROJECTS.ALL;
  const ActiveIcon = activeProjConfig.icon;
  
  const handleProjectSelect = (projKey) => {
    setCurrentProject(PROJECTS[projKey].id);
    setMenuOpen(false);
  };


  const avatarUrl = (user?.avatar || user?.Avatar) 
  ? `/avatars/${user.avatar || user.Avatar}` 
  : '/avatars/default.jpg';
  console.log(user.Avatar);

  return (
    <div className="header-container">
      
      {/* 1. ОСТРОВ ПРОФИЛЯ */}
      <div className="island profile-island">
        <div className="avatar-wrapper">
          <img src={avatarUrl} alt="Avatar" className="avatar-img" />
        </div>
        <div className="profile-info">
          {/* Обрезаем имя, если слишком длинное, или берем из пропсов */}
          <span className="profile-name">
            {user?.name || "Al. Vorontsova"}
          </span>
          <span className="profile-role">
            {user?.position || "Член Комитета"}
          </span>
        </div>
        <button className="btn-icon btn" onClick={onLogout}>
          <LogOut size={20} />
        </button>
      </div>

      {/* 2. ОСТРОВ НАВИГАЦИИ */}
      <div className="island nav-island">
        
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard />
          <span>Дэшборд</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <Package />
          <span>Задачи</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <Users />
          <span>Сотрудники</span>
        </button>

      </div>

      <div className="island project-island" style={{position: 'relative'}}>
        
        <div className="project-selector" onClick={() => setMenuOpen(!isProjectMenuOpen)}>
          <div className="project-icon-box" style={{ backgroundColor: activeProjConfig.color }}>
            <ActiveIcon size={20} />
          </div>
          <div className="project-text-box">
            <span className="project-label">Текущий проект</span>
            <span className="project-name">{activeProjConfig.label}</span>
          </div>
          <ChevronDown size={16} color="#7F7C8D" />
        </div>

        {/* DROPDOWN MENU */}
        {isProjectMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '0',
            background: 'white',
            borderRadius: '16px',
            padding: '10px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            width: '240px'
          }}>
            {Object.keys(PROJECTS).map(key => {
              const proj = PROJECTS[key];
              const Icon = proj.icon;
              return (
                <div 
                  key={key} 
                  onClick={() => handleProjectSelect(key)}
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px', 
                    cursor: 'pointer',
                    borderRadius: '10px',
                    background: currentProject === proj.id ? '#EEEFF4' : 'transparent'
                  }}
                >
                  <div style={{
                    width: '30px', height: '30px', 
                    background: proj.color, 
                    borderRadius: '8px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    <Icon size={16}/>
                  </div>
                  <span style={{fontWeight: 600, fontSize: '14px'}}>{proj.label}</span>
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