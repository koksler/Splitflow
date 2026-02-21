Построено так, чтобы контролеры не зависили от реализации БД

## 1 - Ядро

**IAuthService**  
Отвечает за вход в систему и генерацию токенов.
```C#
public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(string email, string password);
    Task<Employee> GetCurrentUserAsync(int userId);
}
```

**ITaskService**  
Управление задачами (Канбан).
```C#
public interface ITaskService
{
    Task<List<TaskResponseDto>> GetAllTasksAsync(int? projectId = null);
    Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto dto, int creatorId);
    Task UpdateTaskStatusAsync(int taskId, TaskStatus newStatus);
    Task AssignTaskAsync(int taskId, int employeeId);
    Task DeleteTaskAsync(int taskId);
}
```

**IDatabaseInitializer** 
Отвечает за проверку и первоначальную настройку БД.

```C#
public interface IDatabaseInitializer
{
    bool IsConfigured(); 
    Task<bool> TestConnectionAsync(DbConnectionDto config);
    Task InitializeDatabaseAsync(DbConnectionDto config);
}
```

## 2 - Ошибки

Специфические ошибки приложения для обработки в middleware.

- **DatabaseSetupException**: "Не удалось подключиться к хосту X"
- **ConfigurationMissingException**: "Система не настроена. Требуется редирект на /setup"
- **TaskNotFoundException**: "Задача с ID X не найдена"
- **ForbiddenActionException**: "У вас нет прав для этого действия"