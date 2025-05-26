using Backend.Entities;

namespace Backend.Models
{
    public class AuthenticateResponse
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Token { get; set; }
        public bool IsAdmin { get; set; }
        public List<string> Roles { get; set; } = new List<string>();

        public AuthenticateResponse(User user, string token)
        {
            Id = user.Id.ToString();
            Username = user.Username;
            Token = token;
            IsAdmin = user.IsAdmin;
            Roles = user.RolesUsers?
                .Where(ru => ru.Valeur == true)
                .Select(ru => ru.Role?.Libelle ?? "")
                .Where(role => !string.IsNullOrEmpty(role))
                .ToList() ?? new List<string>();
        }
    }
}