using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class UserCreateRequest
    {
        public required string Username { get; set; }

        [JsonIgnore]
        public string PasswordHash { get; set; } = "";
        public bool IsAdmin { get; set; } = false;
        public List<Guid> RolesId { get; set; } = new List<Guid>();
    }
}