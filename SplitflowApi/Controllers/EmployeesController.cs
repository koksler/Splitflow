using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SplitflowApi.Data;
using SplitflowApi.Models;

namespace SplitflowApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        return await _context.Employees.OrderBy(e => e.Id).ToListAsync();
    }

    [HttpPost("upload-csv")]
    public async Task<IActionResult> UploadCsv(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("Файл не выбран");

        using var reader = new StreamReader(file.OpenReadStream());

        var existingEmployees = await _context.Employees.ToDictionaryAsync(e => e.Email.ToLower());

        var newEmployees = new List<Employee>();
        var updatedCount = 0;

        await reader.ReadLineAsync();

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(line)) continue;

            var values = line.Split(',');
            if (values.Length < 2) continue;

            string email = values[1].Trim().ToLower();
            string name = values[0].Trim();

            if (existingEmployees.TryGetValue(email, out var existing))
            {
                existing.Name = name;
                existing.Position = values.Length > 2 ? values[2] : existing.Position;
                existing.Specialization = values.Length > 3 ? values[3] : existing.Specialization;
                existing.Department = values.Length > 4 ? values[4] : existing.Department;
                existing.ClearanceLevel = values.Length > 5 && int.TryParse(values[5], out int cl) ? cl : existing.ClearanceLevel;
                existing.ContractType = values.Length > 6 ? values[6] : existing.ContractType;
                existing.Kpi = values.Length > 7 ? values[7] : existing.Kpi;
                existing.Avatar = values.Length > 8 && !string.IsNullOrWhiteSpace(values[8]) ? values[8] : existing.Avatar;

                if (values.Length > 9 && !string.IsNullOrWhiteSpace(values[9]))
                {
                    existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(values[9]);
                }

                updatedCount++;
            }
            else
            {
                var newEmp = new Employee
                {
                    Name = name,
                    Email = email,
                    Position = values.Length > 2 ? values[2] : "",
                    Specialization = values.Length > 3 ? values[3] : "",
                    Department = values.Length > 4 ? values[4] : "",
                    ClearanceLevel = values.Length > 5 && int.TryParse(values[5], out int cl) ? cl : 3,
                    ContractType = values.Length > 6 ? values[6] : "Бессрочный",
                    Kpi = values.Length > 7 ? values[7] : "B",
                    Avatar = values.Length > 8 && !string.IsNullOrWhiteSpace(values[8]) ? values[8] : "default.jpg",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(values.Length > 9 ? values[9] : "12345")
                };
                newEmployees.Add(newEmp);

                existingEmployees[email] = newEmp;
            }
        }

        if (newEmployees.Any()) _context.Employees.AddRange(newEmployees);
        await _context.SaveChangesAsync();

        return Ok(new {
            message = "Импорт завершен",
            created = newEmployees.Count,
            updated = updatedCount
        });
    }
}