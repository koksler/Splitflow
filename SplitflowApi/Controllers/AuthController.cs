using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SplitflowApi.Data;
using SplitflowApi.Models;

namespace SplitflowApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // Класс-обертка для данных, которые пришлет React
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Ищем сотрудника в базе
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == request.Email && e.Password == request.Password);

        if (employee == null)
        {
            return Unauthorized(new { message = "Неверная почта или пароль" });
        }

        // Возвращаем успех и данные (пароль там не вернется, т.к. мы поставили JsonIgnore в модели)
        return Ok(new 
        { 
            message = "Успешный вход", 
            user = employee 
        });
    }
}