import React, { useState, useEffect } from 'react';

// Компоненты лейаута и страниц
import Header from './components/Header/Header';
import Dashboard from './pages/Dashboard/Dashboard';
import KanbanBoard from './pages/KanbanBoard/KanbanBoard';
import EmployeesTable from './pages/EmployeesTable/EmployeesTable';
import Login from './pages/Auth/Login';
import SetupDB from './pages/Auth/SetupDB';

// Константы и стили
import { PROJECTS } from './constants';
import './index.css';
import './App.css';

// API Эндпоинты (подставь свой порт, если отличается)
const BASE_URL = "http://localhost:5268/api";
const SETUP_API_URL = `${BASE_URL}/setup/status`;
const AUTH_API_URL = `${BASE_URL}/auth/login`;
const TASKS_API_URL = `${BASE_URL}/tasks`;
const EMPLOYEES_API_URL = `${BASE_URL}/employees`;

function App() {
  // --- STATE: СИСТЕМНЫЙ ---
  const [isAppReady, setIsAppReady] = useState(false); // Ждем проверки БД
  const [authScreen, setAuthScreen] = useState(null);  // 'login' | 'setup'
  const [user, setUser] = useState(null);              // Текущий юзер

  // --- STATE: ИНТЕРФЕЙС ---
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentProject, setCurrentProject] = useState(PROJECTS.ALL.id);

  // --- STATE: ГЛОБАЛЬНЫЕ ДАННЫЕ ---
  const [tasks, setTasks] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [isDataLoading, setIsDataLoading] = useState(false);

  // 1. ИНИЦИАЛИЗАЦИЯ: Проверяем, настроена ли БД на бэкенде
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const res = await fetch(SETUP_API_URL);
        const data = await res.json();
        setAuthScreen(data.isConfigured ? 'login' : 'setup');
      } catch (err) {
        console.error("Бэкенд недоступен");
        setAuthScreen('setup'); // Если бэк лежит, отправляем на настройку
      } finally {
        setIsAppReady(true);
      }
    };
    checkDbStatus();
  }, []);

  // 2. ЗАГРУЗКА ДАННЫХ: Выполняется один раз после успешного входа
  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setIsDataLoading(true);
      try {
        const [empRes, tasksRes] = await Promise.all([
          fetch(EMPLOYEES_API_URL),
          fetch(TASKS_API_URL)
        ]);

        const employeesData = await empRes.json();
        const rawTasks = await tasksRes.json();

        // Превращаем массив сотрудников в Map для мгновенного поиска по ID
        const eMap = {};
        employeesData.forEach(emp => { eMap[emp.id] = emp; });
        setEmployeesMap(eMap);

        // Нормализуем задачи (приводим проекты к единому виду из constants.js)
        const normalizedTasks = rawTasks.map(t => {
          let p = t.project ? t.project.toLowerCase() : 'nasledie';
          if (p === 'defense') p = 'zashita';
          if (p === 'economy') p = 'budget';
          return { ...t, project: p };
        });

        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

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
        alert(data.message || "Ошибка входа");
      }
    } catch (err) {
      alert("Сервер авторизации не отвечает");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthScreen('login');
    setActiveTab('analytics');
    setTasks([]);
  };

  // Обновление статуса (Drag-n-Drop в Канбане)
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    // Оптимистичное обновление на фронте
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      const res = await fetch(`${TASKS_API_URL}/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      console.error("Не удалось сохранить статус на сервере");
    }
  };

  const handleOpenModal = (status, task = null) => {
    // Тут будет логика открытия TaskModal
    console.log("Open Modal for:", status, task);
  };

  // --- РЕНДЕРИНГ ---

  // Экран ожидания ответа от бэкенда
  if (!isAppReady) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Синхронизация с ВИСК...</p>
      </div>
    );
  }

  // Основной интерфейс (если вошли)
  if (user) {
    return (
      <div className="app-layout">
        <Header
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
        />
        
        <main className="main-viewport">
          {isDataLoading ? (
            <div className="data-loader">Загрузка данных...</div>
          ) : (
            <>
              {activeTab === 'analytics' && (
                <Dashboard tasks={tasks} employeesMap={employeesMap} />
              )}
              {activeTab === 'kanban' && (
                <KanbanBoard 
                  tasks={tasks} 
                  currentProject={currentProject}
                  employeesMap={employeesMap}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onOpenModal={handleOpenModal}
                />
              )}
              {activeTab === 'employees' && (
                <EmployeesTable employees={Object.values(employeesMap)} />
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  // Экраны до входа
  if (authScreen === 'setup') {
    return (
      <SetupDB 
        onSetupComplete={() => setAuthScreen('login')} 
        onGoToLogin={() => setAuthScreen('login')} 
      />
    );
  }

  return (
    <Login 
      onLogin={handleLogin} 
      onGoToSetup={() => setAuthScreen('setup')} 
    />
  );
}

export default App;