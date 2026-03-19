import React, { useEffect, useState } from 'react';
import TaskCard from '../../components/TaskCard/TaskCard';
import { PROJECTS } from '../../constants';
import SubHeader from '../../components/SubHeader/SubHeader';
import './Dashboard.css';

const Dashboard = ({ employeesMap }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    activeTasks: 0,
    projects: {}, 
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
        const rawTasks = await tasksRes.json();

        const tasks = rawTasks.map(t => {
            let p = t.project ? t.project.toLowerCase() : 'nasledie';
            if (p === 'defense') p = 'zashita';
            if (p === 'economy') p = 'budget';
            return { ...t, project: p };
        });

        const totalEmployees = employees.length;
        const totalTasks = tasks.length;
        const activeTasks = tasks.filter(t => t.status.toLowerCase() !== 'done').length;

        const counts = { nasledie: 0, korona: 0, budget: 0, napadenie: 0, zashita: 0 };
        tasks.forEach(t => {
          if (counts[t.project] !== undefined) counts[t.project]++;
          else counts['nasledie']++;
        });

        const recent = [...tasks].reverse().slice(0, 5);

        setStats({
          totalEmployees,
          totalTasks,
          activeTasks,
          projects: counts,
          recentTasks: recent
        });

      } catch (error) {
        console.error("Ошибка дэшборда:", error);
      }
    };
    fetchData();
  },[]);

  const projectDisplayList = Object.values(PROJECTS)
    .filter(p => p.id !== 'all')
    .sort((a, b) => (stats.projects[b.id] || 0) - (stats.projects[a.id] || 0));

  return (
    <div className="dashboard-page">
      
      <SubHeader variant="analytics" />

      <div className="dashboard-container">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="dash-col-stats">
          <StatCard value={stats.totalTasks} title="Задачи" desc="Всего в системе" />
          <StatCard value={stats.activeTasks} title="В работе" desc="Активные задачи" />
          <StatCard value={stats.totalEmployees} title="Сотрудники" desc="Всего в штате" />
        </div>

        {/* ЦЕНТРАЛЬНАЯ КОЛОНКА */}
        <div className="dash-island dash-col-recent">
          <div className="island-header">
            <h3 className="island-title">Последние задачи</h3>
          </div>
          <div className="recent-tasks-list">
            {stats.recentTasks.map(task => (
              <TaskCard key={task.id} task={task} employeesMap={employeesMap} />
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="dash-island dash-col-projects">
          <div className="island-header">
            <h3 className="island-title">Нагрузка проектов</h3>
          </div>
          <div className="projects-list">
            {projectDisplayList.map((project) => (
              <ProjectBar 
                key={project.id}
                project={project} 
                count={stats.projects[project.id] || 0} 
                total={stats.totalTasks} 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const ProjectBar = ({ project, count, total }) => {
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);
  const Icon = project.icon; 

  return (
    <div className="project-stat-row">
      <div className="project-stat-header">
        <div className="proj-label-group">
          <div className="proj-icon-box" style={{ backgroundColor: project.color }}>
            <Icon size={12} color="#fff" />
          </div>
          <span className="proj-name">{project.label}</span>
        </div>
        <span className="proj-count">{count} ({percent}%)</span>
      </div>
      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${percent}%`, backgroundColor: project.color }} />
      </div>
    </div>
  );
};

const StatCard = ({ title, desc, value }) => (
  <div className="dash-stat-card">
    <div className="stat-text-group">
      <h4 className="stat-title">{title}</h4>
      <p className="stat-desc">{desc}</p>
    </div>
    <div className="stat-value">{value}</div>
  </div>
);

export default Dashboard;