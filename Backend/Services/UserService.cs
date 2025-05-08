using Backend.Models;
using Backend.Entities;
using Backend.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;



namespace Backend.Services
{
    public interface IUserService
    {
        Task<AuthenticateResponse> Authenticate(AuthenticateRequest model);
    }


    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        public UserService(AppDbContext context, IConfiguration configuration)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }
        public async Task<AuthenticateResponse> Authenticate(AuthenticateRequest model)
        {  
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == model.Username);
            if (user == null)
                throw new Exception("User not found");
                        bool isValidPassword = BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash);
            
            if (!isValidPassword)
                throw new ApplicationException("Username or password is incorrect");
            
            var token = GenerateJwtToken(user);

            return new AuthenticateResponse(user, token);
            
        }
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["AppSettings:Secret"] ?? 
                throw new InvalidOperationException("JWT secret not configured"));

            var tokenDescriptor = new SecurityTokenDescriptor{
                Subject = new ClaimsIdentity(
                [
                    new Claim("id", user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                ]),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}