using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SplitflowApi.Data;
using SplitflowApi.Models;

namespace SplitflowApi.Controllers;

[Route("api/[controller]")][ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Email == request.Email);

        if (employee == null)
        {
            return Unauthorized(new { message = "Неверная почта или пароль" });
        }

        // Проверяем пароль через BCrypt (сравниваем введенный пароль с хешем из БД)

        bool isPasswordValid = request.Password == "12345"; // Временное решение чтобы заходить

        // bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, employee.PasswordHash);

        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Неверная почта или пароль" });
        }

        return Ok(new 
        { 
            message = "Успешный вход", 
            user = employee 
        });
    }
}