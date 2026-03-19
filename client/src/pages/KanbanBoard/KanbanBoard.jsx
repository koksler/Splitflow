import React, { useState, useMemo } from 'react';
import { ListChevronsDownUp, ListChevronsUpDown, CirclePlus } from 'lucide-react';
import Button from '../../components/Buttons/Button';
import SubHeader from '../../components/SubHeader/SubHeader';
import TaskCard from '../../components/TaskCard/TaskCard'; // Подключим позже
import './KanbanBoard.css';

const COLUMNS =[
  { id: 'backlog', title: 'BACKLOG', dotClass: 'status-dot-backlog' },
  { id: 'todo', title: 'TODO', dotClass: 'status-dot-todo' },
  { id: 'progress', title: 'PROGRESS', dotClass: 'status-dot-progress' },
  { id: 'done', title: 'DONE', dotClass: 'status-dot-done' }
];

const KanbanBoard = ({ tasks =[], currentProject, onUpdateTaskStatus, onOpenModal }) => {
  const [collapsedCols, setCollapsedCols] = useState({ backlog: false, todo: false, progress: false, done: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null); // 'date' | 'name' | null
  const [filterPriority, setFilterPriority] = useState(null); // 'red' | 'yellow' | 'green' | null

  const processedTasks = useMemo(() => {
    let result =[...tasks];

    // 1. Фильтр по проекту (из хедера)
    if (currentProject !== 'all') {
      result = result.filter(t => t.project?.toLowerCase() === currentProject.toLowerCase());
    }

    // 2. Поиск по названию
    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 3. Фильтр по приоритету
    if (filterPriority) {
      result = result.filter(t => t.priority === filterPriority);
    }

    // 4. Сортировка
    if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    return result;
  }, [tasks, currentProject, searchQuery, filterPriority, sortBy]);


  // ДНД ТУТ
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'), 10);
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
  };


  const toggleColumn = (colId) => {
    setCollapsedCols(prev => ({ ...prev, [colId]: !prev[colId] }));
  };

  const handleSortClick = () => {
    if (!sortBy) setSortBy('date');
    else if (sortBy === 'date') setSortBy('name');
    else setSortBy(null);
  };

  const handleFilterClick = () => {
    if (!filterPriority) setFilterPriority('red');
    else if (filterPriority === 'red') setFilterPriority('yellow');
    else if (filterPriority === 'yellow') setFilterPriority('green');
    else setFilterPriority(null);
  };


  return (
    <div className="kanban-wrapper">
      
      <SubHeader 
        variant="kanban"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => onOpenModal('todo')}
        onSortClick={handleSortClick}
        onFilterClick={handleFilterClick}
      />

      {/* ДОСКА */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const isCollapsed = collapsedCols[col.id];
          const colTasks = processedTasks.filter(t => t.status === col.id);

          return (
            <div 
              key={col.id} 
              className={`kanban-column ${isCollapsed ? 'collapsed' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              
              <div className="column-header">
                <div className={`status-dot ${col.dotClass}`} />
                <span className="column-header-title">{col.title}</span>
                <span className="column-count">{colTasks.length}</span>
                
                <div className="column-actions">
                  <Button variant="icon" onClick={() => toggleColumn(col.id)}>
                    {isCollapsed ? <ListChevronsUpDown size={24} /> : <ListChevronsDownUp size={24} />}
                  </Button>
                  
                  {!isCollapsed && (
                    <Button variant="icon" onClick={() => onOpenModal(col.id)}>
                      <CirclePlus size={24} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="kanban-tasks">
                {colTasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <TaskCard task={task} onEdit={() => onOpenModal(col.id, task)} />
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default KanbanBoard;