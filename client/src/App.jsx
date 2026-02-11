import React, { useState, useEffect } from 'react';
import Header from './Header'; 
import Footer from './Footer';
import KanbanBoard from './KanbanBoard';
import TaskModal from './TaskModal';
import { PROJECTS } from './constants'
import EmployeesTable from './EmployeesTable';
import Dashboard from './Dashboard';

import './Buttons.css';
import './Inputs.css';
import './Auth.css';
import './index.css';
import './Kanban.css';

// --- НАСТРОЙКИ ---
// Порты бэкенда (из dotnet run)
const AUTH_API_URL = "http://localhost:5268/api/auth/login"; 
const TASKS_API_URL = "http://localhost:5268/api/tasks";

// UI
const PrimaryButton = ({ text, onClick }) => (
  <button className="btn btn-primary" onClick={onClick}>{text}</button>
);

const InputField = ({ placeholder, type = "text", value, onChange }) => (
  <div className="input-wrapper">
    <input 
      className="custom-input" 
      type={type} 
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

function App() {
  // --- STATE: АВТОРИЗАЦИЯ ---
  const [user, setUser] = useState(null); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- STATE: ИНТЕРФЕЙС ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentProject, setCurrentProject] = useState(PROJECTS.ALL.id);

  // --- STATE: ЗАДАЧИ ---
  const [tasks, setTasks] = useState([]); // Список задач
  const [isModalOpen, setModalOpen] = useState(false); // Открыта ли модалка
  const [modalStatus, setModalStatus] = useState('todo'); // В какую колонку добавляем

  // ЛОГИКА ЗАДАЧ (API)

  // 1. Загрузка задач с сервера
  const fetchTasks = async () => {
    try {
      const res = await fetch(TASKS_API_URL);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Ошибка сервера:", res.status, errorText);
        return;
      }

      const data = await res.json();
      setTasks(data);
    } catch (e) { 
      console.error("Ошибка сети или парсинга:", e); 
    }
  };

  // Грузим задачи, как только пользователь вошел
  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  // 2. Создание задачи
  const handleCreateTask = async (newTaskData) => {
    try {
      await fetch(TASKS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskData)
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Удаление задачи
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Удалить задачу?")) return;
    try {
      await fetch(`${TASKS_API_URL}/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  // 4. Смена статуса (по клику на карточку)
  const handleNextStatus = async (task) => {
    const nextStatus = task.status === 'todo' ? 'progress' : task.status === 'progress' ? 'done' : 'todo';
    try {
      await fetch(`${TASKS_API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: nextStatus })
      });
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  // 5. Фильтрация задач по проекту
  const filteredTasks = tasks.filter(t => {
    if (currentProject === PROJECTS.ALL.id) return true;
    return t.project?.toLowerCase() === currentProject.toLowerCase();
  });

  // 6. Открытие модалки (вызывается из Канбана)
  const openAddModal = (status) => {
    console.log("[App] openAddModal вызван со статусом:", status); // <--- ЛОГ
    setModalStatus(status);
    setModalOpen(true);
  };

  // ЛОГИКА АВТОРИЗАЦИИ
  const handleLogin = async () => {
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
    setEmail("");
    setPassword("");
    setTasks([]); // Очищаем задачи при выходе
  };

  // РЕНДЕРИНГ
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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
        return <h1>404</h1>;
    }
  };

  // 1. ЕСЛИ ПОЛЬЗОВАТЕЛЬ ВОШЕЛ
  if (user) {
    return (
      <div style={{ 
        backgroundColor: 'var(--color-bg-work)', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Хедер */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
        }}>
          <Header 
            user={user} 
            onLogout={handleLogout} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentProject={currentProject}
            setCurrentProject={setCurrentProject}
          />
        </div>

        {/* Контент */}
        <div style={{ 
          flexGrow: 1, 
          padding: '0 40px', 
          maxWidth: '1600px', 
          width: '100%', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0 
        }}>
          {renderContent()}
        </div>

        {/* Футер */}
        <div style={{ flexShrink: 0 }}>
          <Footer />
        </div>

        {/* Модальное окно (поверх всего) */}
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

  // 2. ЕСЛИ НЕ ВОШЕЛ (ЭКРАН ВХОДА)
  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src="/splitflow.png" alt="Splitflow" className="auth-logo-top" />
        <div className="auth-card">
          <p className="auth-desc">
            Используйте только официально выданную ВИСК
            <br />
            корпоративную почту или почту одобренную комитетом.
          </p>
          <InputField 
            placeholder="Корпоративная почта" 
            value={email}
            onChange={setEmail} 
          />
          <InputField 
            placeholder="Пароль" 
            type="password"
            value={password}
            onChange={setPassword} 
          />
          <div className="auth-divider"></div>
          <PrimaryButton text="Продолжить" onClick={handleLogin} />
          <p className="auth-footer">
            Продолжая вы соглашаетесь с текущим уставом ВИСК Анкерланда
          </p>
        </div>
        <img src="/razirtech.png" alt="Razirtech" className="auth-logo-bottom" />
      </div>
      <div className="auth-right">
        <div className="castle-wrapper">
          <img src="/castle.png" alt="Castle" className="castle-image" />
          <div className="castle-overlay"></div>
        </div>
      </div>
    </div>
  );
}

export default App;