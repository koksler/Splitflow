using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace SplitflowApi.Controllers
{[ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly IConfiguration _config;

        public SetupController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            // Читаем строку из appsettings.json или secrets.json
            var connString = _config.GetConnectionString("DefaultConnection");
            
            // Логика: если строка пустая, или мы специально вписали туда слово "Empty" для тестов,
            // значит БД не настроена.
            bool isConfigured = !string.IsNullOrEmpty(connString) && connString != "Empty";

            return Ok(new { isConfigured });
        }
    }
}