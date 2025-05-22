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
        Task<User?> GetUserById(Guid id);
        Task<IEnumerable<User>> GetAllUsers();
        Task<User> CreateUser(UserCreateRequest userReq);
        Task DeleteUser(Guid id);
        Task<List<Role>> GetAllRoles();
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

            var tokenDescriptor = new SecurityTokenDescriptor
            {
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
        public async Task<User?> GetUserById(Guid id)
        {
            var user = await _context.Users
                .Include(u => u.RolesUsers)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                throw new Exception("User not found");
            return user;
        }
        public async Task<IEnumerable<User>> GetAllUsers()
        {
            return await _context.Users.Include(u => u.RolesUsers)
                .ToListAsync();
        }
        public async Task<User> CreateUser(UserCreateRequest userReq)
        {
            if (await _context.Users.AnyAsync(u => u.Username == userReq.Username))
                throw new Exception("Username already exists");

            userReq.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userReq.PasswordHash);
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = userReq.Username,
                PasswordHash = userReq.PasswordHash,
                IsAdmin = userReq.IsAdmin,
            };
            _context.Users.Add(user);

            if (userReq.IsAdmin == false && userReq.RolesId.Count > 0)
            {
                foreach (var roleId in userReq.RolesId)
                {
                    var role = await _context.Roles.FindAsync(roleId);
                    if (role == null)
                        throw new ApplicationException($"Role with ID {roleId} not found");
                    var roleUser = new RolesUser
                    {
                        Id = Guid.NewGuid(),
                        RoleId = role.Id,
                        Role = role,
                        User = user,
                        UserId = user.Id,
                        Valeur = true
                    };
                    user.RolesUsers.Add(roleUser);
                }
            }

            await _context.SaveChangesAsync();
            return await GetUserById(user.Id)
                ?? throw new Exception("User not found after creation so cration failed");
        }


        public async Task DeleteUser(Guid id)
        {
            var user = await _context.Users
                .Include(u => u.RolesUsers)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                throw new Exception("User not found");

            _context.RemoveRange(user.RolesUsers);
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Role>> GetAllRoles()
        {
            return await _context.Roles.ToListAsync();
        }
    }
    

}