import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import Button from '../Buttons/Button';
import Input from '../Inputs/Inputs';
import { PROJECTS } from '../../constants';
import './TaskModal.css';

const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  task,
  initialStatus,
  employeesMap,
  currentUser
}) => {
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'green',
    project: 'nasledie',
    deadline: '',
    assigneeId: '',
    supervisorId: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'todo',
          priority: task.priority || 'green',
          project: task.project || 'nasledie',
          deadline: task.deadline ? task.deadline.split('T')[0] : '',
          assigneeId: task.assigneeId || '',
          supervisorId: task.supervisorId || ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: initialStatus || 'todo',
          priority: 'green',
          project: 'nasledie',
          deadline: '',
          assigneeId: '',
          supervisorId: currentUser?.id || ''
        });
      }
    }
  },[isOpen, task, initialStatus, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert("Укажите название задачи");
      return;
    }
    
    const taskDataToSave = {
      ...formData,
      assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
      supervisorId: formData.supervisorId ? parseInt(formData.supervisorId) : null,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
    };

    onSave(taskDataToSave, task?.id);
  };

  const employeesList = Object.values(employeesMap || {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ХЕДЕР МОДАЛКИ */}
        <div className="modal-header">
          <h2 className="modal-title">
            {task ? `Редактирование: ${task.displayId}` : 'Новая задача'}
          </h2>
          <Button variant="icon" onClick={onClose} title="Закрыть">
            <X size={24} />
          </Button>
        </div>

        {/* ТЕЛО МОДАЛКИ */}
        <div className="modal-body">
          
          <div className="form-group full-width">
            <label>Название задачи *</label>
            <Input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Введите название..." 
              autoFocus
              className="modal-custom-input"
            />
          </div>

          <div className="form-group full-width">
            <label>Описание</label>
            <textarea 
              className="modal-textarea"
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Детальное описание..."
            />
          </div>

          {/* СЕТКА НАСТРОЕК */}
          <div className="modal-grid">
            
            <div className="form-group">
              <label>Проект</label>
              <select className="modal-select" name="project" value={formData.project} onChange={handleChange}>
                {Object.values(PROJECTS).filter(p => p.id !== 'all').map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Статус</label>
              <select className="modal-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label>Приоритет</label>
              <select className="modal-select" name="priority" value={formData.priority} onChange={handleChange}>
                <option value="red">Высокий (Red)</option>
                <option value="yellow">Средний (Yellow)</option>
                <option value="green">Низкий (Green)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Дедлайн</label>
              <Input 
                type="date" 
                name="deadline" 
                value={formData.deadline} 
                onChange={handleChange} 
                className="modal-custom-input modal-date-input"
              />
            </div>

            <div className="form-group">
              <label>Исполнитель</label>
              <select className="modal-select" name="assigneeId" value={formData.assigneeId} onChange={handleChange}>
                <option value="">-- Не назначен --</option>
                {employeesList.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Постановщик</label>
              <select className="modal-select" name="supervisorId" value={formData.supervisorId} onChange={handleChange}>
                <option value="">-- Не назначен --</option>
                {employeesList.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* ПОДВАЛ МОДАЛКИ */}
        <div className="modal-footer">
          {task ? (
             <Button variant="icon" onClick={() => onDelete(task.id)} title="Удалить задачу" style={{ color: 'var(--color-red)' }}>
               <Trash2 size={24} />
             </Button>
          ) : null}
          
          <div className="modal-actions-right">
            <Button variant="full-unfocused" onClick={onClose}>Отмена</Button>
            <Button variant="full" onClick={handleSubmit}>
              {task ? 'Сохранить изменения' : 'Создать задачу'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;