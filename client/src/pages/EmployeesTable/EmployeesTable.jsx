import React, { useState, useMemo } from 'react';
import SubHeader from '../../components/SubHeader/SubHeader';
import EmployeeModal from '../../components/EmployeeModal/EmployeeModal';
import './EmployeesTable.css';

const EmployeesTable = ({ employeesMap, onRefetch  }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(null); 
  const[filterValue, setFilterValue] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const[editingEmployee, setEditingEmployee] = useState(null);

  const processedEmployees = useMemo(() => {
    let result = Object.values(employeesMap || {});

    result = result.filter(emp => {
      const eName = (emp.name || emp.Name || '').toLowerCase();
      const eEmail = (emp.email || emp.Email || '').toLowerCase();
      const ePos = (emp.position || emp.Position || '').toLowerCase();
      const eClearance = String(emp.clearanceLevel || emp.ClearanceLevel || '');
      const eContract = (emp.contractType || emp.ContractType || '').toLowerCase();

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!eName.includes(q) && !eEmail.includes(q) && !ePos.includes(q)) return false;
      }

      if (filterValue === '5' && eClearance !== '5') return false;
      if (filterValue === 'bessrochniy' && !eContract.includes('бессрочный')) return false;

      return true;
    });

    // 3. Сортировка
    if (sortBy === 'name') {
      result.sort((a, b) => (a.name || a.Name || '').localeCompare(b.name || b.Name || ''));
    } else if (sortBy === 'id') {
      result.sort((a, b) => (a.id || a.Id) - (b.id || b.Id));
    } else if (sortBy === 'kpi') {
      result.sort((a, b) => (a.kpi || a.Kpi || '').localeCompare(b.kpi || b.Kpi || ''));
    }

    return result;
  },[employeesMap, searchQuery, sortBy, filterValue]);


  const getKpiColor = (kpiValue) => {
    const kpi = (kpiValue || '').toUpperCase();
    if (!kpi) return 'var(--color-text-gray)';
    if (kpi.includes('A')) return 'var(--color-green, #10B981)';
    if (kpi.includes('B')) return 'var(--color-yellow, #FBBF24)';
    if (kpi.includes('C') || kpi.includes('D')) return 'var(--color-red, #FF5656)';
    return 'var(--color-text)';
  };

  const handleCsvUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch("/api/employees/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Успех! Создано: ${result.created}, Обновлено: ${result.updated}`);
        
        if (onRefetch) onRefetch(); 
      } else {
        const error = await res.json();
        alert("Ошибка сервера: " + error.message);
      }
    } catch (error) {
      console.error("Ошибка при импорте:", error);
      alert("Не удалось связаться с сервером. Проверь, запущен ли dotnet.");
    }
  };

  return (
    <div className="employees-page">
      <SubHeader 
        variant="employees"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        
        onAddClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
        
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        
        onCsvUpload={handleCsvUpload}
      />

      <div className="table-container">
        <table className="linear-table">
          <thead>
            <tr>
              <th>СОТРУДНИК</th>
              <th className="cell-center">ID</th>
              <th>E-MAIL</th>
              <th>ДОЛЖНОСТЬ</th>
              <th>СПЕЦИАЛИЗАЦИЯ</th>
              <th>ОТДЕЛЕНИЕ</th>
              <th className="cell-center">УРОВЕНЬ ДОПУСКА</th>
              <th>ТИП КОНТРАКТА</th>
              <th className="cell-center">KPI</th>
            </tr>
          </thead>
          <tbody>
            {processedEmployees.length > 0 ? (
              processedEmployees.map(emp => (
                <tr key={emp.id || emp.Id} onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} style={{cursor: 'pointer'}}>
                  <td className="cell-primary">{emp.name || emp.Name}</td>
                  <td className="cell-id cell-center">{emp.id || emp.Id}</td>
                  <td className="cell-secondary">{emp.email || emp.Email}</td>
                  <td>{emp.position || emp.Position}</td>
                  <td className="cell-truncate">{emp.specialization || emp.Specialization}</td>
                  <td>{emp.department || emp.Department}</td>
                  <td className="cell-center">{emp.clearanceLevel || emp.ClearanceLevel}</td>
                  <td className="cell-secondary">{emp.contractType || emp.ContractType}</td>
                  <td className="cell-center">
                    <span className="kpi-badge" style={{ color: getKpiColor(emp.kpi || emp.Kpi) }}>
                      {(emp.kpi || emp.Kpi) || '-'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" className="cell-empty">Сотрудники не найдены</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        employee={editingEmployee}
        onSave={(data) => { console.log("Сохраняем:", data); setIsModalOpen(false); }}
      />
    </div>
  );
};

export default EmployeesTable;