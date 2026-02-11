import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, Briefcase, Amphora, PiggyBank, Shield } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    projects: { nasledie: 0, economy: 0, defense: 0 },
    recentTasks: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Параллельная загрузка
        const [empRes, tasksRes] = await Promise.all([
          fetch("http://localhost:5268/api/employees"),
          fetch("http://localhost:5268/api/tasks")
        ]);

        const employees = await empRes.json();
        const tasks = await tasksRes.json();

        // Считаем математику
        const totalEmployees = employees.length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const activeTasks = totalTasks - completedTasks;

        // Считаем проекты
        const projCounts = { nasledie: 0, economy: 0, defense: 0 };
        tasks.forEach(t => {
          const p = t.project ? t.project.toLowerCase() : 'nasledie';
          if (projCounts[p] !== undefined) projCounts[p]++;
        });

        // Берем последние 5 задач (предполагаем, что новые в конце, поэтому reverse)
        const recent = [...tasks].reverse().slice(0, 5);

        setStats({
          totalEmployees,
          totalTasks,
          activeTasks,
          completedTasks,
          projects: projCounts,
          recentTasks: recent
        });

      } catch (error) {
        console.error("Ошибка загрузки дэшборда:", error);
      }
    };

    fetchData();
  }, []);

  // Вспомогательная функция для % ширины
  const getPercent = (val) => stats.totalTasks === 0 ? 0 : (val / stats.totalTasks) * 100;

  return (
    <div className="dashboard-container">
      
      {/* 1. ВЕРХНИЕ КАРТОЧКИ */}
      <div className="stats-grid">
        <StatCard 
          icon={Users} color="#3a374b" 
          value={stats.totalEmployees} label="Всего сотрудников" 
        />
        <StatCard 
          icon={Briefcase} color="#FFB71B" 
          value={stats.totalTasks} label="Всего задач" 
        />
        <StatCard 
          icon={Clock} color="#FF2F1C" 
          value={stats.activeTasks} label="В работе" 
        />
        <StatCard 
          icon={CheckCircle} color="#00C458" 
          value={stats.completedTasks} label="Завершено" 
        />
      </div>

      {/* 2. НИЖНИЙ РЯД */}
      <div className="dashboard-row">
        
        {/* График проектов */}
        <div className="dash-island">
          <h3 className="island-title">Загрузка Проектов</h3>
          
          <ProjectBar 
            label="Наследие" 
            count={stats.projects.nasledie} 
            total={stats.totalTasks} 
            color="#FF5656" 
          />
          <ProjectBar 
            label="Экономика" 
            count={stats.projects.economy} 
            total={stats.totalTasks} 
            color="#B7791F" 
          />
          <ProjectBar 
            label="Защита" 
            count={stats.projects.defense} 
            total={stats.totalTasks} 
            color="#0057FF" 
          />
        </div>

        {/* Список последних действий */}
        <div className="dash-island">
          <h3 className="island-title">Последние задачи</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
            {stats.recentTasks.map(task => (
              <div key={task.id} className="recent-item">
                <div className="recent-icon" style={{background: getProjectColor(task.project)}}>
                  {getProjectIcon(task.project)}
                </div>
                <div className="recent-info">
                  <span className="recent-title">{task.title}</span>
                  <span className="recent-date">{task.displayId} • {task.deadline}</span>
                </div>
              </div>
            ))}
            {stats.recentTasks.length === 0 && <span style={{color:'#999'}}>Нет активностей</span>}
          </div>
        </div>

      </div>
    </div>
  );
};

// МЕЛКИЕ КОМПОНЕНТЫ

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="stat-card">
    <div className="stat-header">
      <div className="stat-icon" style={{ color: color }}>
        <Icon size={24} />
      </div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const ProjectBar = ({ label, count, total, color }) => {
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="project-stat-row">
      <div className="project-stat-header">
        <span>{label}</span>
        <span style={{ color: '#7F7C8D' }}>{count} ({percent}%)</span>
      </div>
      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${percent}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
};

// Хелперы для иконок (дублируем логику, чтобы не импортировать TaskCard)
const getProjectColor = (p) => {
  switch(p?.toLowerCase()) {
    case 'economy': return '#B7791F';
    case 'defense': return '#0057FF';
    default: return '#FF5656';
  }
}
const getProjectIcon = (p) => {
  switch(p?.toLowerCase()) {
    case 'economy': return <PiggyBank size={16} />;
    case 'defense': return <Shield size={16} />;
    default: return <Amphora size={16} />;
  }
}

export default Dashboard;