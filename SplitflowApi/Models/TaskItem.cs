namespace SplitflowApi.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string DisplayId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public string Status { get; set; } = "todo";
    public string Priority { get; set; } = "green";
    public string Project { get; set; } = "nasledie";
    
    public DateTime? Deadline { get; set; } 
    
    public int? AssigneeId { get; set; }
    public Employee? Assignee { get; set; }
    
    public int? SupervisorId { get; set; }
    public Employee? Supervisor { get; set; }
}