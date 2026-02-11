import React from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import './Kanban.css';

// --- КОМПОНЕНТ ЗАГОЛОВКА КОЛОНКИ ---
const ColumnHeader = ({ status, count, onAdd }) => {
  let circleClass = 'circle-todo';
  let title = 'TODO';

  if (status === 'progress') {
    circleClass = 'circle-progress';
    title = 'PROGRESS';
  } else if (status === 'done') {
    circleClass = 'circle-done';
    title = 'DONE';
  }

  return (
    <div className="column-header">
      <div className="header-left">
        <div className={`status-circle ${circleClass}`}></div>
        <span className="column-title">{title}</span>
        <span className="task-count">{count}</span>
      </div>
      
      <button 
        className="btn-icon btn" 
        onClick={() => {
          console.log(`[ColumnHeader] Клик по плюсу в колонке: ${status}`);
          onAdd(); // Вызываем функцию, переданную сверху
        }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

const KanbanBoard = ({ tasks, onAdd, onDelete, onNextStatus }) => {
  
  console.log("[KanbanBoard] Рендер. Задач:", tasks.length);

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const progressTasks = tasks.filter(t => t.status === 'progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px', marginTop: '50px', flexShrink: 0 }}>
        Текущие Задачи
      </h1>
      
      <div className="kanban-board">
        
        {/* Колонка TODO */}
        <div className="kanban-column">
          <ColumnHeader 
            status="todo" 
            count={todoTasks.length} 
            onAdd={() => {
              console.log("[KanbanBoard] Вызываем onAdd('todo')");
              onAdd('todo'); 
            }} 
          />
          <div className="task-list">
            {todoTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={onDelete} 
                onNextStatus={onNextStatus} 
              />
            ))}
          </div>
        </div>

        {/* Колонка PROGRESS */}
        <div className="kanban-column">
          <ColumnHeader 
            status="progress" 
            count={progressTasks.length} 
            onAdd={() => onAdd('progress')} 
          />
          <div className="task-list">
            {progressTasks.map(task => (
              <TaskCard key={task.id} task={task} onDelete={onDelete} onNextStatus={onNextStatus} />
            ))}
          </div>
        </div>

        {/* Колонка DONE */}
        <div className="kanban-column">
          <ColumnHeader 
            status="done" 
            count={doneTasks.length} 
            onAdd={() => onAdd('done')} 
          />
          <div className="task-list">
            {doneTasks.map(task => (
              <TaskCard key={task.id} task={task} onDelete={onDelete} onNextStatus={onNextStatus} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KanbanBoard;