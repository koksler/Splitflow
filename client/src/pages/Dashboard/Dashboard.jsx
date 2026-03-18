import React, { useEffect, useState } from 'react';
import { Crown, PiggyBank, Swords, Shield, Amphora } from 'lucide-react';
import TaskCard from '../../components/TaskCard/TaskCard'; // Подключаем твой компонент карточки
import './Dashboard.css';

const Dashboard = () => {
  const[stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    activeTasks: 0,
    projects: { 
      'наследие': 0, 
      'корона': 0, 
      'бюджет': 0, 
      'нападение': 0, 
      'защита': 0 
    },
    recentTasks:[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, tasksRes] = await Promise.all([
          fetch("http://localhost:5268/api/employees"),
          fetch("http://localhost:5268/api/tasks")
        ]);

        const employees = await empRes.json();
        const tasks = await tasksRes.json();

        const totalEmployees = employees.length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'done').length;
        const activeTasks = totalTasks - completedTasks;

        const projCounts = { 'наследие': 0, 'корона': 0, 'бюджет': 0, 'нападение': 0, 'защита': 0 };
        tasks.forEach(t => {
          const p = t.project ? t.project.toLowerCase() : 'наследие';
          if (projCounts[p] !== undefined) {
            projCounts[p]++;
          } else {
            projCounts['наследие']++;
          }
        });

        const recent = [...tasks].reverse().slice(0, 4);

        setStats({
          totalEmployees,
          totalTasks,
          activeTasks,
          projects: projCounts,
          recentTasks: recent
        });

      } catch (error) {
        console.error("Ошибка загрузки дэшборда:", error);
      }
    };

    fetchData();
  },[]);

  const sortedProjects = Object.entries(stats.projects).sort((a, b) => b[1] - a[1]);

  return (
    <div className="dashboard-container">
      
      {/* ЛЕВАЯ КОЛОНКА */}
      <div className="dash-col-stats">
        <StatCard value={stats.totalTasks} title="Задачи" desc="Общее количество внесенных задач" />
        <StatCard value={stats.activeTasks} title="В работе" desc="Общее количество задач в работе на данный момент" />
        <StatCard value={stats.totalEmployees} title="Сотрудники" desc="Общее количество зарегистрированных сотрудников" />
      </div>

      {/* ЦЕНТРАЛЬНАЯ КОЛОНКА */}
      <div className="dash-island dash-col-recent">
        <div className="island-header">
          <h3 className="island-title">Последние задачи</h3>
          <span className="island-subtitle">Последние 4 задачи</span>
        </div>
        
        <div className="recent-tasks-list">
          {stats.recentTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {stats.recentTasks.length === 0 && <span style={{color:'#999', fontSize: '12px'}}>Нет активностей</span>}
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА */}
      <div className="dash-island dash-col-projects">
        <div className="island-header">
          <h3 className="island-title">Нагрузка проектов</h3>
          <span className="island-subtitle">Количество задач на проект.</span>
        </div>

        <div className="projects-list">
          {sortedProjects.map(([projectName, count]) => (
            <ProjectBar 
              key={projectName}
              label={projectName.toUpperCase()} 
              count={count} 
              total={stats.totalTasks} 
            />
          ))}
        </div>
      </div>

    </div>
  );
};

// КОМПОНЕНТЫ

const StatCard = ({ title, desc, value }) => (
  <div className="dash-stat-card">
    <div className="stat-text-group">
      <h4 className="stat-title">{title}</h4>
      <p className="stat-desc">{desc}</p>
    </div>
    <div className="stat-value">{value}</div>
  </div>
);

const ProjectBar = ({ label, count, total }) => {
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);
  const meta = getProjectMeta(label);

  return (
    <div className="project-stat-row">
      <div className="project-stat-header">
        <div className="proj-label-group">
          <div className="proj-icon-box" style={{ backgroundColor: meta.color }}>
            {meta.icon}
          </div>
          <span className="proj-name">{label}</span>
        </div>
        <span className="proj-count">{count} ({percent}%)</span>
      </div>
      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${percent}%`, backgroundColor: meta.color }} />
      </div>
    </div>
  );
};

const getProjectMeta = (p) => {
  const name = p ? p.toLowerCase() : 'наследие';
  switch(name) {
    case 'корона': return { color: '#B7791F', icon: <Crown size={12} color="#fff" /> };
    case 'бюджет': return { color: '#8A5A19', icon: <PiggyBank size={12} color="#fff" /> }; 
    case 'нападение': return { color: '#A01B2E', icon: <Swords size={12} color="#fff" /> }; 
    case 'защита': return { color: '#0025A8', icon: <Shield size={12} color="#fff" /> }; 
    case 'наследие': 
    default: return { color: '#FF5656', icon: <Amphora size={12} color="#fff" /> }; 
  }
};

export default Dashboard;