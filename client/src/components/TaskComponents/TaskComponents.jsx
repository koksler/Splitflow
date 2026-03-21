import React from 'react';
import { Calendar, SquareDashedMousePointer } from 'lucide-react';
import './TaskComponents.css';

export const StatusBadge = ({ status }) => {

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

export const DateBadge = ({ date }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "---";
    try {
      const d = new Date(dateStr);
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