using Microsoft.EntityFrameworkCore;
using SplitflowApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Подключаем PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Разрешаем CORS (чтобы React мог отправлять запросы)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .AllowAnyOrigin()  // Разрешаем всем (для лабы ок)
            .AllowAnyMethod()  // GET, POST и т.д.
            .AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Включаем Swagger (документация API), чтобы тестить без фронта
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact"); // Включаем CORS
app.UseAuthorization();

// --- Для компиляции ---
app.UseDefaultFiles(); // Ищет index.html
app.UseStaticFiles();  // Раздает css/js/img
// --------------------

app.MapControllers();

app.Run();