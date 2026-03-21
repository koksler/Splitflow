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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        return await _context.Tasks.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItem task)
    {
        string prefix = task.Project?.ToUpper() switch
        {
            "ECONOMY" => "ECO",
            "DEFENSE" => "DEF",
            "KORONA" => "KOR",
            "BUDGET" => "BUD",
            "NAPADENIE" => "NAP",
            "ZASHITA" => "ZAS",
            _ => "LEG"
        };

        task.DisplayId = $"{prefix}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTasks), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, TaskItem task)
    {
        if (id != task.Id) return BadRequest();
        _context.Entry(task).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    public class UpdateStatusDto { public string Status { get; set; } = string.Empty; }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateStatusDto request)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        task.Status = request.Status.ToLower();
        await _context.SaveChangesAsync();
        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("upload-csv")]
    public async Task<IActionResult> UploadCsv(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("Файл не выбран");

        using var reader = new StreamReader(file.OpenReadStream());
        var tasks = new List<TaskItem>();

        await reader.ReadLineAsync();

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(line)) continue;

            var values = line.Split(',');

            var project = values.Length > 2 ? values[2] : "nasledie";

            tasks.Add(new TaskItem
            {
                Title = values[0],
                Description = values.Length > 1 ? values[1] : "",
                Project = project,
                Priority = values.Length > 3 ? values[3] : "green",
                Status = "todo",
                DisplayId = $"CSV-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}"
            });
        }

        _context.Tasks.AddRange(tasks);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Загружено задач: {tasks.Count}" });
    }
}