import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Dashboard from './pages/Dashboard/Dashboard';
import KanbanBoard from './pages/KanbanBoard/KanbanBoard';
import EmployeesTable from './pages/EmployeesTable/EmployeesTable';
import Login from './pages/Auth/Login';
import SetupDB from './pages/Auth/SetupDB';

import './index.css';
import './App.css';

const SETUP_API_URL = "http://localhost:5268/api/setup/status";
const AUTH_API_URL = "http://localhost:5268/api/auth/login";

import { PROJECTS } from './constants'

function App() {
  const [authScreen, setAuthScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); 
  const [employeesMap, setEmployeesMap] = useState({});

  const[currentProject, setCurrentProject] = useState(PROJECTS?.ALL?.id || 'ALL');

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5268/api/employees");
      if (res.ok) {
        const data = await res.json();
        // Превращаем массив в объект: { 1: {name: '...', avatar: '...'}, 2: {...} }
        const map = data.reduce((acc, emp) => {
          acc[emp.id] = emp;
          return acc;
        }, {});
        setEmployeesMap(map);
      }
    } catch (err) {
      console.error("Ошибка загрузки сотрудников:", err);
    }
  };


  // Инициализация
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const res = await fetch(SETUP_API_URL);
        const data = await res.json();
        setAuthScreen(data.isConfigured ? 'login' : 'setup');
      } catch (err) {
        setAuthScreen('setup');
      }
    };
    checkInitialStatus();
  }, []);

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      } else {
        alert("Ошибка входа: " + data.message);
      }
    } catch (err) {
      alert("Сервер не доступен");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthScreen('login');
    setActiveTab('analytics');
    setCurrentProject(PROJECTS?.ALL?.id || 'ALL');
  };

  const goToSetup = () => setAuthScreen('setup');
  const goToLogin = () => setAuthScreen('login');

  const renderMainContent = () => {
    switch (activeTab) {
      case 'analytics': return <Dashboard employeesMap={employeesMap}/>;
      case 'kanban': return <KanbanBoard currentProject={currentProject} employeesMap={employeesMap}/>;
      case 'employees': return <EmployeesTable employees={Object.values(employeesMap)}/>;
      default: return <Dashboard employeesMap={employeesMap}/>;
    }
  };

  // Как всё рендерится

  if (user) {
    return (
      <div key="main" className="page-transition-enter app-layout">
        <Header
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
        <main className="main-viewport">
          {renderMainContent()}
        </main>
      </div>
    );
  }

  if (authScreen === 'setup') {
    return (
      <div key="setup" className="page-transition-enter">
        <SetupDB
          onSetupComplete={goToLogin}
          onGoToLogin={goToLogin}
        />
      </div>
    );
  }

  return (
    <div key="login" className="page-transition-enter">
      <Login
        onLogin={handleLogin}
        onGoToSetup={goToSetup}
      />
    </div>
  );
}

export default App;