using System.Text.Json.Serialization;

namespace SplitflowApi.Models;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int ClearanceLevel { get; set; }
    public string ContractType { get; set; } = string.Empty;
    public string Kpi { get; set; } = string.Empty;
    public string? Avatar { get; set; } 

    [JsonIgnore] 
    public string Password { get; set; } = string.Empty; 
}