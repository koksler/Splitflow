import React from 'react';
import { Calendar } from 'lucide-react';
import './TaskComponents.css';

// Компонент Статуса
export const StatusBadge = ({ status }) => {
  let indicatorClass = 'status-todo';
  let label = 'TODO';

  if (status === 'progress') {
    indicatorClass = 'status-progress';
    label = 'PROGRESS';
  } else if (status === 'done') {
    indicatorClass = 'status-done';
    label = 'DONE';
  }

  return (
    <div className="task-badge">
      <div className={`status-indicator ${indicatorClass}`}></div>
      <span>{label}</span>
    </div>
  );
};

// Компонент Даты
export const DateBadge = ({ date }) => {
  return (
    <div className="task-badge date-badge">
      <Calendar />
      <span>{date}</span>
    </div>
  );
};