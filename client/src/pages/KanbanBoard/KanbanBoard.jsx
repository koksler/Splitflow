import React, { useState, useEffect } from 'react';
import TaskCard from '../../components/TaskCard/TaskCard';
// import TaskModal from '../../components/TaskModal/TaskModal'; // TODO: Переделать модалку.
import { 
    CircleDashed, // Иконка для Backlog
    Circle,       // Todo
    CircleDot,    // Progress
    CheckCircle2, // Done
    Plus,
    ArrowDownUp,
    Filter
} from 'lucide-react';
import './KanbanBoard.css';

const TASKS_API = "http://localhost:5268/api/tasks";
const EMPLOYEES_API = "http://localhost:5268/api/employees"; // Нам нужен этот эндпоинт

const COLUMNS =[
    { id: 'backlog', title: 'BACKLOG', icon: CircleDashed, color: '#9CA3AF' },
    { id: 'todo', title: 'TODO', icon: Circle, color: '#D1D5DB' },
    { id: 'progress', title: 'PROGRESS', icon: CircleDot, color: '#FBBF24' },
    { id: 'done', title: 'DONE', icon: CheckCircle2, color: '#10B981' }
];

const KanbanBoard = ({ currentProject }) => {
    const[tasks, setTasks] = useState([]);
    const [employeesMap, setEmployeesMap] = useState({}); // Словарь: { id: { name, avatar } }
    const [isLoading, setIsLoading] = useState(true);

    // Временный стейт для D&D, если используешь простой HTML5 Drag-n-Drop
    const [draggedTaskId, setDraggedTaskId] = useState(null);

    // 1. Загрузка данных (Задачи + Сотрудники)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Запрашиваем параллельно
                const[tasksRes, empRes] = await Promise.all([
                    fetch(TASKS_API),
                    fetch(EMPLOYEES_API)
                ]);

                if (tasksRes.ok && empRes.ok) {
                    const tasksData = await tasksRes.json();
                    const empData = await empRes.json();

                    // Превращаем массив сотрудников в объект для быстрого поиска O(1)
                    // { 1: { name: "Алишия", avatar: "alishia.png" }, 2: { ... } }
                    const empMap = empData.reduce((acc, emp) => {
                        acc[emp.id] = emp;
                        return acc;
                    }, {});

                    setEmployeesMap(empMap);
                    setTasks(tasksData);
                }
            } catch (error) {
                console.error("Ошибка загрузки данных Канбана:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    },[]);

    // 2. Фильтрация по проекту
    const filteredTasks = tasks.filter(task => {
        if (!currentProject || currentProject === 'ALL') return true;
        return task.project?.toLowerCase() === currentProject.toLowerCase();
    });

    // 3. Логика Drag and Drop
    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        // Небольшой хак для Firefox
        e.dataTransfer.setData('text/plain', taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Разрешаем drop
    };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        if (!draggedTaskId) return;

        // Оптимистичное обновление UI
        setTasks(prev => prev.map(t => 
            t.id === draggedTaskId ? { ...t, status: targetStatus } : t
        ));

        // Отправка на сервер (предполагаем, что у тебя есть такой PATCH/PUT эндпоинт)
        try {
            await fetch(`${TASKS_API}/${draggedTaskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: targetStatus })
            });
        } catch (error) {
            console.error("Не удалось обновить статус на сервере");
            // Тут в идеале нужно откатить стейт назад, если сервер упал
        }
        
        setDraggedTaskId(null);
    };


    if (isLoading) return <div className="kanban-loading">Загрузка задач...</div>;

    return (
        <div className="kanban-container">
            {/* Панель инструментов над доской (по макету) */}
            <div className="kanban-toolbar">
                <div className="toolbar-left">
                    <span className="toolbar-title">Текущие Задачи</span>
                    <button className="toolbar-icon-btn"><ArrowDownUp size={18} /></button>
                    <button className="toolbar-icon-btn"><Filter size={18} /></button>
                </div>
                <div className="toolbar-right">
                    <button className="add-task-btn">Добавить Задачу</button>
                    <div className="search-bar">
                        {/* Иконка лупы и инпут */}
                        <input type="text" placeholder="Поиск" className="search-input"/>
                    </div>
                </div>
            </div>

            {/* Сетка колонок */}
            <div className="kanban-board">
                {COLUMNS.map(column => {
                    const columnTasks = filteredTasks.filter(t => t.status?.toLowerCase() === column.id);
                    const Icon = column.icon;

                    return (
                        <div 
                            key={column.id} 
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Шапка колонки */}
                            <div className="column-header">
                                <div className="column-header-left">
                                    <Icon size={16} color={column.color} />
                                    <span className="column-title">{column.title}</span>
                                    <span className="column-count">{columnTasks.length}</span>
                                </div>
                                <div className="column-header-right">
                                    <button className="column-action-btn"><Filter size={16}/></button>
                                    <button className="column-action-btn"><Plus size={16}/></button>
                                </div>
                            </div>

                            {/* Список карточек */}
                            <div className="column-content">
                                {columnTasks.map(task => (
                                    <div 
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        className="draggable-card-wrapper"
                                    >
                                        <TaskCard 
                                            task={task} 
                                            // Передаем весь словарь, карточка сама достанет нужных людей по ID
                                            employeesMap={employeesMap} 
                                        />
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