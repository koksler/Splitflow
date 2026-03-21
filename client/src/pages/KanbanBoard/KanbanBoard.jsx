import React, { useState, useMemo } from 'react';
import { ListChevronsDownUp, ListChevronsUpDown, CirclePlus } from 'lucide-react';
import Button from '../../components/Buttons/Button';
import SubHeader from '../../components/SubHeader/SubHeader';
import TaskCard from '../../components/TaskCard/TaskCard';
import './KanbanBoard.css';

const COLUMNS =[
  { id: 'backlog', title: 'BACKLOG', dotClass: 'status-dot-backlog' },
  { id: 'todo', title: 'TODO', dotClass: 'status-dot-todo' },
  { id: 'progress', title: 'PROGRESS', dotClass: 'status-dot-progress' },
  { id: 'done', title: 'DONE', dotClass: 'status-dot-done' }
];

const KanbanBoard = ({ tasks, currentProject, employeesMap, onUpdateTaskStatus, onOpenModal, onRefetch }) => {
  const [collapsedCols, setCollapsedCols] = useState({ backlog: false, todo: false, progress: false, done: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null); // 'date' | 'name' | null
  const [filterPriority, setFilterPriority] = useState(null); // 'red' | 'yellow' | 'green' | null

  const processedTasks = useMemo(() => {
    let result =[...tasks];

    if (currentProject !== 'all') {
      result = result.filter(t => t.project?.toLowerCase() === currentProject.toLowerCase());
    }

    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filterPriority) {
      result = result.filter(t => t.priority === filterPriority);
    }

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

  const handleCsvUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch("/api/tasks/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Успешно! Загружено задач: ${result.count}`);
        
        if (onRefetch) onRefetch(); 
      } else {
        alert("Ошибка при загрузке задач");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка сети");
    }
  };


  const toggleColumn = (colId) => {
    setCollapsedCols(prev => ({ ...prev, [colId]: !prev[colId] }));
  };


  return (
    <div className="kanban-wrapper">
      
      <SubHeader 
        variant="kanban"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => onOpenModal('todo')}
        
        sortBy={sortBy}
        onSortChange={setSortBy}
        
        filterPriority={filterPriority}
        onFilterChange={setFilterPriority} 
        onCsvUpload={handleCsvUpload}
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
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <TaskCard key={task.id} onEdit={() => onOpenModal(task.status, task)} task={task} employeesMap={employeesMap} />
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