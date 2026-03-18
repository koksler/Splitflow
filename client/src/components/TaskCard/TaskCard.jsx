import React from 'react';
import { Amphora, Crown, PiggyBank, Crosshair, Shield, Bolt } from 'lucide-react';
import { StatusBadge, DateBadge } from '../TaskComponents/TaskComponents';
import './TaskCard.css';
import Button from '../Buttons/Button';

import { getPriorityColor, getProjectInfo } from '../../constants.js';

const TaskCard = ({ task, employeesMap = {}, onClick, onContextMenu }) => {

  const projectInfo = getProjectInfo(task.project);
  const barColor = getPriorityColor(task.priority);
  const ProjectIcon = projectInfo.icon;

  const assignee = employeesMap[task.assigneeId];
  const supervisor = employeesMap[task.supervisorId];

  const assigneeUrl = assignee?.avatar ? `/avatars/${assignee.avatar}` : '/avatars/default.jpg';
  const supervisorUrl = supervisor?.avatar ? `/avatars/${supervisor.avatar}` : '/avatars/default.jpg';

  return (
    <div
      className="task-card"
      onClick={() => onClick && onClick(task)}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu && onContextMenu(task.id); }}
    >
      {/* Тонкая цветная полоска слева */}
      <div className="task-priority-bar" style={{ backgroundColor: barColor }}></div>

      {/* Верхняя часть: Заголовок и кнопка опций */}
      <div className="task-header">
        <span className="task-title" title={task.title}>{task.title}</span>
        <Button variant = "icon" title = "Настройки">
          <Bolt size={24} color='var(--color-text-gray)'/>
        </Button>
      </div>

      {/* Описание (Превью) */}
      <p className="task-desc">
        {task.description || "Краткое описание задачи..."}
      </p>

      {/* Подвал: Бейджи и Аватарки */}
      <div className="task-footer">
        
        {/* Левая группа бейджей */}
        <div className="task-badges-left">
          <StatusBadge status={task.status ? task.status.toLowerCase() : 'todo'} />
          <DateBadge date={task.deadline || "Не задан"} />
          <div className="project-icon-badge" style={{ backgroundColor: projectInfo.color }}>
            <ProjectIcon size={14} color="#FFF" />
          </div>
        </div>

        {/* Правая группа: ID и Исполнители */}
        <div className="task-badges-right">
          <span className="task-project-id">{task.displayId || `TSK-${task.id}`}</span>
          
          <div className="task-avatars">
            {/* Супервайзер снизу */}
            <img 
                src={supervisorUrl} 
                alt="Supervisor" 
                className="task-avatar" 
                title={`Постановщик: ${supervisor?.name || 'Неизвестен'}`}
            />
            {/* Исполнитель сверху (перекрывает) */}
            <img 
                src={assigneeUrl} 
                alt="Assignee" 
                className="task-avatar stacked" 
                title={`Исполнитель: ${assignee?.name || 'Неизвестен'}`}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskCard;