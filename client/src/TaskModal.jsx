import React, { useState, useEffect } from 'react';
import './Auth.css';
import './Inputs.css';
import './Buttons.css';

const TaskModal = ({ isOpen, onClose, onSave, initialStatus, currentProject, currentUser }) => {
  
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("green");
  const [project, setProject] = useState("nasledie");
  const [deadline, setDeadline] = useState("14.06.2025");
  
  const [assigneeId, setAssigneeId] = useState(""); 

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setPriority("green");
      setDeadline("14.06.2025");
      setAssigneeId(""); // Сбрасываем ID
      
      if (currentProject && currentProject !== 'all') {
        setProject(currentProject);
      } else {
        setProject('nasledie');
      }
    }
  }, [isOpen, currentProject]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Пожалуйста, введите название задачи");
      return;
    }

    const newTask = {
      title: title,
      priority: priority,
      project: project,
      status: initialStatus,
      deadline: deadline,
      
      assigneeId: parseInt(assigneeId) || 0,
      
      supervisorAvatar: currentUser?.avatar || currentUser?.Avatar || "default.jpg"
    };

    onSave(newTask);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="auth-card modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '500px', width: '100%', padding: '40px' }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px', fontFamily: 'Onest, sans-serif' }}>
          Новая задача
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="input-wrapper">
            <input 
              className="custom-input" 
              placeholder="Название задачи" 
              value={title} 
              autoFocus
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          {/* ID Исполнителя */}
          <div className="input-wrapper">
            <input 
              className="custom-input" 
              type="number"
              placeholder="ID Исполнителя (например: 1)" 
              value={assigneeId} 
              onChange={(e) => setAssigneeId(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="input-wrapper">
              <select 
                className="custom-input" 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="green">Низкий</option>
                <option value="yellow">Средний</option>
                <option value="red">Высокий</option>
              </select>
            </div>

            <div className="input-wrapper">
              <select 
                className="custom-input" 
                value={project} 
                onChange={(e) => setProject(e.target.value)}
                disabled={currentProject !== 'all'}
              >
                <option value="nasledie">Наследие</option>
                <option value="economy">Экономика</option>
                <option value="defense">Защита</option>
              </select>
            </div>
          </div>

          <div className="input-wrapper">
            <input 
              className="custom-input" 
              placeholder="Срок сдачи" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
            />
          </div>

        </div>

        <div className="auth-divider" style={{ margin: '24px 0' }}></div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            style={{ backgroundColor: 'var(--color-bg-work)', color: 'var(--color-text)', flex: 1 }}
            onClick={onClose}
          >
            Отмена
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 2 }}
            onClick={handleSubmit}
          >
            Создать
          </button>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;