## Диаграмма компонентов (Mermaid)

```mermaid
graph TD
    subgraph Client["Frontend (React)"]
        UI[UI Components]
        State[State Management]
        API_Client[API Client / Fetch]
    end

    subgraph Server["Backend (.NET API)"]
        AuthCtrl[AuthController]
        SetupCtrl[SetupController]
        TaskCtrl[TasksController]
        EmpCtrl[EmployeesController]
        Config[Connection Manager]
        DB_Context[AppDbContext / EF Core]
    end

    subgraph Database[PostgreSQL]
        PG[(Primary DB)]
    end

    UI --> State
    State --> API_Client

    API_Client -- "JSON HTTP" --> AuthCtrl
    API_Client -- "JSON Setup DTO" --> SetupCtrl
    API_Client -- "JSON Task DTO" --> TaskCtrl

    SetupCtrl -- "1. Init Connection" --> Config
    Config -- "2. Build Options" --> DB_Context

    TaskCtrl --> DB_Context
    EmpCtrl --> DB_Context
    AuthCtrl --> DB_Context

    DB_Context -- "SQL Queries" --> PG
```

**Setup Flow:** `SetupController` - это входная точка для инициализации. 
Он взаимодействует с `Connection Manager` (логический компонент), чтобы создать строку подключения и применить её к `AppDbContext` в рантайме.

**Standard Flow:** Остальные контроллеры (`Tasks`, `Employees`) работают через уже настроенный `AppDbContext`.