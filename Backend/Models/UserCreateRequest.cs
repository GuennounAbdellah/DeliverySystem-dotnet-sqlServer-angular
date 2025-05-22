using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class UserCreateRequest
    {
        public required string Username { get; set; }

        public required string PasswordHash { get; set; }
        public bool IsAdmin { get; set; } = false;
        public List<Guid> RolesId { get; set; } = new List<Guid>();
    }
    public class UserUpdateRequest
    {
        public  string ? Username { get; set; }
        public bool ? IsAdmin { get; set; } 
        public string ? PasswordHash { get; set; }
        public List<Guid>? RolesId { get; set; } = new List<Guid>();
    }
}