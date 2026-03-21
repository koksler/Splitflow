import React, { useState, useEffect } from 'react';

// Компоненты лейаута и страниц
import Header from './components/Header/Header';
import Dashboard from './pages/Dashboard/Dashboard';
import KanbanBoard from './pages/KanbanBoard/KanbanBoard';
import EmployeesTable from './pages/EmployeesTable/EmployeesTable';
import Login from './pages/Auth/Login';
import SetupDB from './pages/Auth/SetupDB';
import TaskModal from './components/TaskModal/TaskModal';

// Константы и стили
import { PROJECTS } from './constants';
import './index.css';
import './App.css';

const BASE_URL = "/api";
const SETUP_API_URL = `${BASE_URL}/setup/status`;
const AUTH_API_URL = `${BASE_URL}/auth/login`;
const TASKS_API_URL = `${BASE_URL}/tasks`;
const EMPLOYEES_API_URL = `${BASE_URL}/employees`;

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [authScreen, setAuthScreen] = useState(null);  // 'login' | 'setup'
  const[user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('splitflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState('analytics');
  const [currentProject, setCurrentProject] = useState(PROJECTS.ALL.id);

  const [tasks, setTasks] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalInitialStatus, setModalInitialStatus] = useState('todo');

    const handleOpenModal = (status, task = null) => {
      setModalInitialStatus(status);
      setEditingTask(task);
      setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingTask(null);
    };
  
    const handleSaveTask = async (taskData, taskId) => {
      try {
        const isEditing = !!taskId;
        const url = isEditing ? `${TASKS_API_URL}/${taskId}` : TASKS_API_URL;
        const method = isEditing ? "PUT" : "POST";
  
        if (isEditing) taskData.id = taskId;
  
        const res = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData)
        });
  
        if (!res.ok) throw new Error("Ошибка при сохранении задачи");
  
        if (isEditing) {
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...taskData } : t));
        } else {
          const newTaskFromBackend = await res.json();
          setTasks(prev => [...prev, newTaskFromBackend]);
        }
  
        handleCloseModal();
      } catch (error) {
        console.error(error);
        alert("Не удалось сохранить задачу.");
      }
    };
  
    // УДАЛЕНИЕ
    const handleDeleteTask = async (taskId) => {
      if (!window.confirm("Удалить эту задачу навсегда?")) return;
  
      try {
        const res = await fetch(`${TASKS_API_URL}/${taskId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Ошибка удаления");
  
        setTasks(prev => prev.filter(t => t.id !== taskId));
        handleCloseModal();
      } catch (error) {
        console.error(error);
        alert("Не удалось удалить задачу.");
      }
    };

  // 1. ИНИЦИАЛИЗАЦИЯ: Проверяем, настроена ли БД на бэкенде
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const res = await fetch(SETUP_API_URL);
        const data = await res.json();
        setAuthScreen(data.isConfigured ? 'login' : 'setup');
      } catch (err) {
        console.error("Бэкенд недоступен");
        setAuthScreen('setup');
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

        const eMap = {};
        employeesData.forEach(emp => {
          const empId = emp.id !== undefined ? emp.id : emp.Id; 
          if (empId !== undefined) {
            eMap[empId] = emp;
          }
        });
        setEmployeesMap(eMap);

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
        // СОХРАНЯЕМ СЕССИЮ
        localStorage.setItem('splitflow_user', JSON.stringify(data.user)); 
      } else {
        alert("Ошибка входа: " + data.message);
      }
    } catch (err) {
      alert("Сервер не доступен");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('splitflow_user'); 
    setAuthScreen('login');
    setActiveTab('analytics');
    setCurrentProject(PROJECTS?.ALL?.id || 'all');
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
                <Dashboard tasks={tasks} employeesMap={employeesMap} onOpenModal={handleOpenModal} />
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
                <EmployeesTable employeesMap={employeesMap} />
              )}
            </>
          )}
        </main>
        {user && (
      <TaskModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        initialStatus={modalInitialStatus}
        employeesMap={employeesMap}
        currentUser={user}
      />
    )}
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