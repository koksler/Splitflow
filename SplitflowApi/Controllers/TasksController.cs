using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SplitflowApi.Data;
using SplitflowApi.Models;

namespace SplitflowApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        return await _context.Tasks.ToListAsync();
    }

    // POST: api/tasks
[HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItem task)
    {
        // 1. Генерация ID (оставляем как было)
        var random = new Random();
        string prefix = task.Project.ToUpper() switch
        {
            "ECONOMY" => "ECO",
            "DEFENSE" => "DEF",
            _ => "LEG"
        };
        task.DisplayId = $"{prefix}-{random.Next(1000, 9999)}";

        // 2. ПОИСК ИСПОЛНИТЕЛЯ ПО ID
        // Если ID передан (> 0), ищем сотрудника в базе
        if (task.AssigneeId > 0)
        {
            var assignee = await _context.Employees.FindAsync(task.AssigneeId);
            if (assignee != null && !string.IsNullOrEmpty(assignee.Avatar))
            {
                task.AssigneeAvatar = assignee.Avatar;
            }
            else
            {
                task.AssigneeAvatar = "default.jpg"; // Если сотрудника с таким ID нет
            }
        }
        else
        {
            task.AssigneeAvatar = "default.jpg";
        }

        // 3. СУПЕРВАЙЗЕР
        // Аватарка супервайзера приходит с фронта (это текущий юзер).
        // Если вдруг пустая - ставим дефолт.
        if (string.IsNullOrEmpty(task.SupervisorAvatar)) 
        {
            task.SupervisorAvatar = "default.jpg";
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTasks), new { id = task.Id }, task);
    }
    // PUT: api/tasks/5 (Обновление статуса)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, TaskItem task)
    {
        if (id != task.Id) return BadRequest();

        _context.Entry(task).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/tasks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}