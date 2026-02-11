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

    // GET: api/employees
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        // Возвращаем всех, сортируем по ID
        return await _context.Employees.OrderBy(e => e.Id).ToListAsync();
    }
}