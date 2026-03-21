import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import Button from '../Buttons/Button';
import Input from '../Inputs/Inputs';
import '../TaskModal/TaskModal.css';

const EmployeeModal = ({ isOpen, onClose, onSave, onDelete, employee }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', position: '', specialization: '', 
    department: '', clearanceLevel: '3', contractType: 'Бессрочный', kpi: 'B'
  });

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setFormData({
          name: employee.name || employee.Name || '',
          email: employee.email || employee.Email || '',
          position: employee.position || employee.Position || '',
          specialization: employee.specialization || employee.Specialization || '',
          department: employee.department || employee.Department || '',
          clearanceLevel: String(employee.clearanceLevel || employee.ClearanceLevel || '3'),
          contractType: employee.contractType || employee.ContractType || 'Бессрочный',
          kpi: employee.kpi || employee.Kpi || 'B'
        });
      } else {
        setFormData({ name: '', email: '', position: '', specialization: '', department: '', clearanceLevel: '3', contractType: 'Бессрочный', kpi: 'B' });
      }
    }
  }, [isOpen, employee]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!formData.name || !formData.email) { alert("Имя и Email обязательны"); return; }
    onSave({ ...formData, clearanceLevel: parseInt(formData.clearanceLevel) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2 className="modal-title">{employee ? `Сотрудник ID-${employee.id || employee.Id}` : 'Новый сотрудник'}</h2>
          <Button variant = "icon" className="modal-close-btn" onClick={onClose}><X size={24} /></Button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            
            <div className="form-group full-width">
              <label>ФИО *</label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Иванов Иван..." autoFocus />
            </div>

            <div className="form-group">
              <label>Корпоративный E-mail *</label>
              <Input name="email" value={formData.email} onChange={handleChange} placeholder="email@splitflow.anc" />
            </div>

            <div className="form-group">
              <label>Должность</label>
              <Input name="position" value={formData.position} onChange={handleChange} placeholder="Специалист" />
            </div>

            <div className="form-group">
              <label>Специализация</label>
              <Input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Анализ данных" />
            </div>

            <div className="form-group">
              <label>Отделение (Проект)</label>
              <Input name="department" value={formData.department} onChange={handleChange} placeholder="ГОС Ыкавыка" />
            </div>

            <div className="form-group">
              <label>Уровень допуска</label>
              <select className="modal-select" name="clearanceLevel" value={formData.clearanceLevel} onChange={handleChange}>
                <option value="1">1 (Минимальный)</option>
                <option value="2">2 (Базовый)</option>
                <option value="3">3 (Стандартный)</option>
                <option value="4">4 (Высокий)</option>
                <option value="5">5 (Максимальный)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Тип контракта</label>
              <select className="modal-select" name="contractType" value={formData.contractType} onChange={handleChange}>
                <option value="Бессрочный">Бессрочный</option>
                <option value="Срочный">Срочный</option>
                <option value="Проектный">Проектный</option>
              </select>
            </div>

            <div className="form-group">
              <label>Текущий KPI</label>
              <select className="modal-select" name="kpi" value={formData.kpi} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

          </div>
        </div>

        <div className="modal-footer">
          {employee ? (
            <Button variant="icon" onClick={() => onDelete && onDelete(employee.id || employee.Id)} title="Удалить" style={{ color: 'var(--color-red)' }}>
              <Trash2 size={24} />
            </Button>
          ) : <div />}
          <div className="modal-actions-right">
            <Button variant="full-unfocused" onClick={onClose}>Отмена</Button>
            <Button variant="full" onClick={handleSubmit}>{employee ? 'Сохранить' : 'Добавить'}</Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeModal;