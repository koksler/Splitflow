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
    public string Deadline { get; set; } = string.Empty;
    
    public int AssigneeId { get; set; }
    public string AssigneeAvatar { get; set; } = "default.jpg"; 
    
    public string SupervisorAvatar { get; set; } = "default.jpg"; // Аватарка того, кто создал
}