using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SplitflowApi.Data;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace SplitflowApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SetupController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public SetupController(IConfiguration config, IWebHostEnvironment env)
    {
        _config = config;
        _env = env;
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var connString = _config.GetConnectionString("DefaultConnection");
        bool isConfigured = !string.IsNullOrEmpty(connString) && connString != "Empty";
        return Ok(new { isConfigured });
    }

    public class InitDatabaseDto
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("init")]
    public async Task<IActionResult> InitDatabase([FromBody] InitDatabaseDto request)
    {
        try
        {
            string fullConnectionString = $"{request.ConnectionString};Password={request.Password}";

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(fullConnectionString);

            using (var tempContext = new AppDbContext(optionsBuilder.Options))
            {
                await tempContext.Database.MigrateAsync();
            }

            var appSettingsPath = Path.Combine(_env.ContentRootPath, "appsettings.json");
            var jsonText = await System.IO.File.ReadAllTextAsync(appSettingsPath);

            var jsonObj = JsonNode.Parse(jsonText);
            
            if (jsonObj["ConnectionStrings"] == null)
            {
                jsonObj["ConnectionStrings"] = new JsonObject();
            }

            jsonObj["ConnectionStrings"]["DefaultConnection"] = fullConnectionString;

            var options = new JsonSerializerOptions { WriteIndented = true };
            await System.IO.File.WriteAllTextAsync(appSettingsPath, jsonObj.ToJsonString(options));

            var devSettingsPath = Path.Combine(_env.ContentRootPath, "appsettings.Development.json");
            if (System.IO.File.Exists(devSettingsPath))
            {
                var devJsonText = await System.IO.File.ReadAllTextAsync(devSettingsPath);
                var devJsonObj = JsonNode.Parse(devJsonText);
                if (devJsonObj["ConnectionStrings"] != null)
                {
                    devJsonObj["ConnectionStrings"]["DefaultConnection"] = fullConnectionString;
                    await System.IO.File.WriteAllTextAsync(devSettingsPath, devJsonObj.ToJsonString(options));
                }
            }

            return Ok(new { message = "База данных успешно инициализирована" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Ошибка подключения: {ex.Message}" });
        }
    }
}