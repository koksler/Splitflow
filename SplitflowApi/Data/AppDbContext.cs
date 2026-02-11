using Microsoft.EntityFrameworkCore;
using SplitflowApi.Models;

namespace SplitflowApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Employee> Employees { get; set; }
    public DbSet<TaskItem> Tasks { get; set; }
}

