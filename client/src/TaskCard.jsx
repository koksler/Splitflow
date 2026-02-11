import React from 'react';
import { Amphora, PiggyBank, Shield, Layers } from 'lucide-react';
import { StatusBadge, DateBadge } from './TaskComponents';
import './TaskCard.css';

const TaskCard = ({ task, onDelete, onNextStatus }) => {
  
  const getPriorityColor = (p) => {
    const priority = p ? p.toLowerCase() : 'green';

    switch(priority) {
      case 'red': return 'var(--color-red)';   
      case 'yellow': return 'var(--color-yellow)';
      case 'green': return 'var(--color-green)';
      default: return 'var(--color-green)';
    }
  };

  const getProjectInfo = (proj) => {
    const project = proj ? proj.toLowerCase() : 'nasledie';
    
    switch(project) {
      case 'economy': 
        return { icon: <PiggyBank size={18} />, color: '#B7791F' };
      case 'defense': 
        return { icon: <Shield size={18} />, color: '#0057FF' };
      case 'nasledie':
      default: 
        return { icon: <Amphora size={18} />, color: '#FF5656' };
    }
  };

  const projectInfo = getProjectInfo(task.project);

  const assigneeUrl = task.assigneeAvatar ? `/avatars/${task.assigneeAvatar}` : '/avatars/default.jpg';
  const supervisorUrl = task.supervisorAvatar ? `/avatars/${task.supervisorAvatar}` : '/avatars/default.jpg';

  return (
    <div 
      className="task-card" 
      style={{ '--color-project': getPriorityColor(task.priority) }}
      onClick={() => onNextStatus(task)}
      onContextMenu={(e) => { e.preventDefault(); onDelete(task.id); }}
    >
      {/* Цветная полоска (берет цвет из style выше) */}
      <div className="task-color-strip"></div>

      <div className="task-content">
        
        {/* Хедер: Иконка проекта и ID */}
        <div className="task-header">
          <div className="mini-project-icon" style={{ backgroundColor: projectInfo.color }}>
            {projectInfo.icon}
          </div>
          <span className="task-id">{task.displayId || `#${task.id}`}</span>
        </div>

        {/* Название */}
        <div className="task-title">{task.title}</div>

        {/* Футер: Статус и Люди */}
        <div className="task-footer">
          <div className="task-badges-row">
            <StatusBadge status={task.status ? task.status.toLowerCase() : 'todo'} />
            <DateBadge date={task.deadline} />
          </div>

          <div className="task-assignees">
             {/* Исполнитель */}
             <div className="assignee-circle" title={`Assignee ID: ${task.assigneeId}`}>
               <img src={assigneeUrl} alt="Assignee" onError={(e) => e.target.src = '/avatars/default.jpg'} />
             </div>
             {/* Супервайзер */}
             <div className="assignee-circle" title="Supervisor">
               <img src={supervisorUrl} alt="Supervisor" onError={(e) => e.target.src = '/avatars/default.jpg'} />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskCard;