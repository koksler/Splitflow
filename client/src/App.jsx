import React, { useState, useEffect } from 'react';

// Компоненты (Layout)
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import TaskModal from './components/TaskModal/TaskModal';

// Страницы (Pages)
import Dashboard from './pages/Dashboard/Dashboard';
import KanbanBoard from './pages/KanbanBoard/KanbanBoard';
import EmployeesTable from './pages/EmployeesTable/EmployeesTable';
import Login from './pages/Auth/Login';
import SetupDB from './pages/Auth/SetupDB';

// Стили и Константы
import { PROJECTS } from './constants';
import './index.css';
import './App.css';

const SETUP_API_URL = "http://localhost:5268/api/setup/status";
const AUTH_API_URL = "http://localhost:5268/api/auth/login";
const TASKS_API_URL = "http://localhost:5268/api/tasks";

function App() {
  // --- STATE: ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
  const [isAppReady, setIsAppReady] = useState(false);

  // --- STATE: РОУТИНГ АВТОРИЗАЦИИ ---
  // 'login' | 'setup'
  const [authScreen, setAuthScreen] = useState(null); 

  // --- STATE: ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ---
  const [user, setUser] = useState(null);

  // --- STATE: ИНТЕРФЕЙС ---
  const[activeTab, setActiveTab] = useState('dashboard');
  const [currentProject, setCurrentProject] = useState(PROJECTS.ALL.id);

  // --- STATE: ЗАДАЧИ ---
  const[tasks, setTasks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('todo');

  // ЛОГИКА ЗАДАЧ (Осталась без изменений)
  const fetchTasks = async () => { /* ...твой старый код... */ };
  const handleCreateTask = async (newTaskData) => { /* ...твой старый код... */ };
  const handleDeleteTask = async (id) => { /* ...твой старый код... */ };
  const handleNextStatus = async (task) => { /* ...твой старый код... */ };

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch(SETUP_API_URL);
        if (response.ok) {
          const data = await response.json();
          // Если БД настроена -> кидаем на логин. Если нет -> на сетап.
          setAuthScreen(data.isConfigured ? 'login' : 'setup');
        } else {
          // Если апишка вернула ошибку, на всякий случай кидаем на сетап
          setAuthScreen('setup');
        }
      } catch (error) {
        console.error("Бэкенд недоступен:", error);
        // Если бэкенд вообще лежит (CORS или не запущен) - покажем форму настройки
        setAuthScreen('setup');
      } finally {
        setIsAppReady(true); // Приложение готово к отрисовке
      }
    };

    checkDbStatus();
  },[]);

  if (!isAppReady) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-gray)' }}>Загрузка Splitflow...</p>
      </div>
    );
  }

  const filteredTasks = tasks.filter(t => {
    if (currentProject === PROJECTS.ALL.id) return true;
    return t.project?.toLowerCase() === currentProject.toLowerCase();
  });

  const openAddModal = (status) => {
    setModalStatus(status);
    setModalOpen(true);
  };

  // ОБНОВЛЕННАЯ ЛОГИКА АВТОРИЗАЦИИ
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        alert("Ошибка: " + data.message);
      }
    } catch (error) {
      alert("Сервер не отвечает. Убедись, что dotnet run запущен.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]); // Очищаем задачи при выходе
    setAuthScreen('login'); // На всякий случай сбрасываем на экран логина
  };

  // --- РЕНДЕРИНГ КОНТЕНТА (ДЛЯ АВТОРИЗОВАННОГО) ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={tasks} />;
      case 'tasks':
        return (
          <KanbanBoard
            tasks={filteredTasks}
            onAdd={openAddModal}
            onDelete={handleDeleteTask}
            onNextStatus={handleNextStatus}
          />
        );
      case 'employees':
        return <EmployeesTable />;
      default:
        return <Dashboard />;
    }
  };

  // --- ГЛАВНЫЙ RETURN ПРИЛОЖЕНИЯ ---

  // 1. ЕСЛИ ПОЛЬЗОВАТЕЛЬ ВОШЕЛ (Основной интерфейс)
  if (user) {
    return (
      <div className="app-container">
        <Header
          user={user}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
        />

        <div className="app-content">
          {renderContent()}
        </div>

        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleCreateTask}
            initialStatus={modalStatus}
            currentProject={currentProject}
            currentUser={user}
          />
        )}
      </div>
    );
  }

  // 2. ЕСЛИ НЕ ВОШЕЛ (ЭКРАНЫ АВТОРИЗАЦИИ)
  // Тут работает наш мини-роутер
  if (authScreen === 'setup') {
    return (
      <SetupDB 
        onSetupComplete={() => setAuthScreen('login')} 
        onGoToLogin={() => setAuthScreen('login')} 
      />
    );
  }

  // По дефолту показываем логин
  return (
    <Login 
      onLogin={handleLogin} 
      onGoToSetup={() => setAuthScreen('setup')} 
    />
  );
}

export default App;