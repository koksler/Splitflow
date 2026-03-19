import React from 'react';
import { Calendar, SquareDashedMousePointer } from 'lucide-react';
import './TaskComponents.css';

// Компонент Статуса (icon-only, no text)
export const StatusBadge = ({ status }) => {
  // backlog is visual-only for now, logic unchanged

  let badgeClass = 'status-todo';
  let dotClass = 'status-dot-todo';

  if (status === 'backlog') {
    badgeClass = 'status-backlog';
    dotClass = 'status-dot-backlog';
  }
  if (status === 'progress') {
    badgeClass = 'status-progress';
    dotClass = 'status-dot-progress';
  } else if (status === 'done') {
    badgeClass = 'status-done';
    dotClass = 'status-dot-done';
  }

  return (
    <div className={`status-badge ${badgeClass}`}>
      <div className={`status-dot ${dotClass}`} />
    </div>
  );
};

// Компонент Даты
export const DateBadge = ({ date }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "---";
    try {
      // Создаем объект даты
      const d = new Date(dateStr);
      // Если дата невалидная - возвращаем как есть
      if (isNaN(d.getTime())) return dateStr;

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      return `${day}.${month}.${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="date-badge">
      <Calendar size={14} />
      <span>{formatDate(date)}</span>
    </div>
  );
};