## 1 - Domain-модели (Внутренние сущности)

Модели, отражающие структуру базы данных (PostgreSQL) и бизнес-логику приложения. Располагаются в `SplitflowApi/Models`.

### 1.1 - Core Entities

**Employee (Сотрудник)**
Описывает пользователя системы или сотрудника в реестре.

```csharp
public class Employee
{
    public int Id { get; set; }
    public string FullName { get; set; }      // "Алишия Воронцова"
    public string Email { get; set; }         // "admin@splitflow.anc"
    public string Position { get; set; }      // "Глава Отделения"
    public string Department { get; set; }    // "ГОС Ыкавыка"
    public string Specialization { get; set; }// "Административный Контроль"
    public int ClearanceLevel { get; set; }   // Уровень допуска (1-5)
    public string ContractType { get; set; }  // "Бессрочный"
    public string Kpi { get; set; }      // "A+", "B", "C"
    public string Avatar { get; set; }     // Ссылка на изображение
    
    ...
}
```

**TaskItem (Задача)**
Основная единица работы в системе.

```csharp
public class TaskItem
{
    public int Id { get; set; }
	public string DisplayId { get; set; } = string.Empty;
    public string Title { get; set; }         // "Собеседование с магом огня"
    public string Description { get; set; }

	public string Status { get; set; } = "todo";
	public string Priority { get; set; } = "green";
	public string Project { get; set; } = "nasledie";
	public string Deadline { get; set; } = string.Empty;

	public int AssigneeId { get; set; }
	public string AssigneeAvatar { get; set; } = "default.jpg";
	public string SupervisorAvatar { get; set; } = "default.jpg"; // Аватарка того, кто создал
}
```

### 1.2 - Value Objects / Enums

**Enums**
*   `Status`: `Backlog`, `Todo`, `Progress`, `Done`
*   `Priority`: `3` (Critical), `2` (Standard), 1 (Minor)

<!-- [TODO] Сейчас приоритет стоит стрингой, по цвету. Надо будет изменить в коде -->

**DbConnectionConfig (Для инициализации)**
Модель для временного хранения или передачи параметров подключения (не хранится в БД, используется при старте).

```csharp
public class DbConnectionConfig
{
    public string Host { get; set; }
    public int Port { get; set; }
    public string Database { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}
```

---

## 2 - DTO (Форматы внешних данных)

Объекты для передачи данных между React-клиентом и .NET API. Позволяют скрыть внутреннюю структуру БД.

### 2.1 - Task DTOs

**TaskResponseDto** (Отправка на клиент)
```json
{
  "id": 14,
  "title": "Собеседование с магом огня",
  "status": "TODO",
  "projectCode": "ECO-055",
  "deadline": "2026-06-16T00:00:00",
  "assignee": {
    "id": 1,
    "name": "Алишия Воронцова",
    "avatar": "url..."
  }
}
```

**CreateTaskDto** (Получение от клиента)
*   `Title` (string, required)
*   `Priority` (int, от 1 до 3)
*   `Deadline` (DateTime)
*   `AssigneeId` (int, nullable)

**UpdateTaskStatusDto**
*   `Id` (int)
*   `NewStatus` (string)

### 2.2 - Employee DTOs

**EmployeeListDto** (Для таблицы сотрудников)
*   Полный набор полей для отображения в таблице (ID, Name, Email, Dept, KPI...).

**EmployeeShortDto** (Для выпадающих списков и аватарок в задачах)
*   `Id`
*   `FullName`
*   `AvatarUrl`

### 2.3 - System / Setup DTOs

**InitDatabaseDto** (Для экрана Setup)
```json
{
  "host": "localhost",
  "port": 5432,
  "dbName": "splitflow_db",
  "user": "postgres",
  "password": "secure_password"
}
```

**LoginRequestDto**
*   `Email`
*   `Password`

---

## 3 - Инварианты и ограничения данных

Правила валидации, которые должны проверяться на уровне API или Домена.

1.  **Сотрудники:**
    *   `Email`: Должен быть уникальным и соответствовать формату email.
    *   `ClearanceLevel`: Целое число от **1** до **5**.
    *   `KpiGrade`: Допустимые значения: `A+`, `A`, `A-`, `B+`, `B`, `C`.

2.  **Задачи:**
    *   `Deadline`: Не может быть в прошлом при создании задачи (Warning или Error).
    *   `Status`: Переход статуса возможен только по цепочке (желательно), но для MVP допустим произвольный Drag-n-Drop.
    *   `ProjectTag`: Формат `[AAA]-[000]` (3 буквы, дефис, 3 цифры).

3.  **Подключение к БД:**
    *   `Port`: Диапазон 1–65535 (Default: 5432).
    *   `Password`: Не должен быть пустым.

---

## 4 - Таблица “DTO -> Domain” (Маппинг)

Как данные преобразуются при прохождении через контроллеры.

| Сущность | Поле DTO (Input/Output) | Поле Domain Model | Правило преобразования |
| :--- | :--- | :--- | :--- |
| **Task** | `status` (string: "TODO") | `Status` (Enum: Todo=1) | String Enum Parse / ToString |
| **Task** | `assignee` (object) | `Assignee` (Employee) | Извлекаем `Employee` по FK `AssigneeId` и мапим в объект `{id, name, avatar}` |
| **Task** | `projectCode` | `ProjectTag` | Прямой маппинг 1 к 1 |
| **Employee**| `kpi` (string) | `KpiGrade` | Прямой маппинг |
| **Setup** | `InitDatabaseDto` | `ConnectionString` | Сборка строки: `Host={host};Port={port};Database={dbName}...` |
| **Auth** | `LoginRequestDto.Password` | `PasswordHash` | **Внимание:** Пароль из DTO сверяется с хешем в БД, в чистом виде не хранится. |

---

### Примечание по архитектуре

В данном проекте используется подход **Code-First** (EF Core), поэтому Domain-модели (`Models/*.cs`) являются первичными источниками истины для структуры базы данных. DTO служат контрактом для Frontend-части.