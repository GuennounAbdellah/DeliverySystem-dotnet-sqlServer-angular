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
        Task<User> UpdateUser(Guid id, UserUpdateRequest userReq);
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
            var user = await _context.Users
                .Include(u => u.RolesUsers)
                .ThenInclude(ru => ru.Role)
                .FirstOrDefaultAsync(u => u.Username == model.Username);

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

            // Create claims list
            var claims = new List<Claim>
            {
                new Claim("id", user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User"),
            };

            // Fetch the user with roles if not already included
            if (user.RolesUsers == null || !user.RolesUsers.Any())
            {
                var userWithRoles = _context.Users
                    .Include(u => u.RolesUsers)
                    .ThenInclude(ru => ru.Role)
                    .FirstOrDefault(u => u.Id == user.Id);

                if (userWithRoles?.RolesUsers != null)
                {
                    user = userWithRoles;
                }
            }

            // Add roles to claims
            if (user.RolesUsers != null)
            {
                foreach (var roleUser in user.RolesUsers)
                {
                    if (roleUser.Role != null && roleUser.Valeur)
                    {
                        claims.Add(new Claim("role", roleUser.Role.Libelle));
                    }
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
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
            if (string.IsNullOrWhiteSpace(userReq.Username))
                throw new ArgumentException("Username cannot be empty");
                
            if (string.IsNullOrWhiteSpace(userReq.PasswordHash))
                throw new ArgumentException("Password cannot be empty");
                
            if (await _context.Users.AnyAsync(u => u.Username == userReq.Username))
                throw new ApplicationException("Username already exists");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = userReq.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userReq.PasswordHash),
                IsAdmin = userReq.IsAdmin,
            };
            _context.Users.Add(user);

            // Add roles regardless of admin status if roles are provided
            if (userReq.RolesId != null && userReq.RolesId.Count > 0)
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

            try
            {
                await _context.SaveChangesAsync();
                return await GetUserById(user.Id) ?? throw new ApplicationException("Failed to create user");
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to create user", ex);
            }
        }

        public async Task<User> UpdateUser(Guid id, UserUpdateRequest userReq)
        {
            var user = await _context.Users
                .Include(u => u.RolesUsers)
                .FirstOrDefaultAsync(u => u.Id == id);
                
            if (user == null)
                throw new ApplicationException($"User not found with this id: {id}");
                
            if (userReq.Username != null)
            {
                if (string.IsNullOrWhiteSpace(userReq.Username))
                    throw new ArgumentException("Username cannot be empty");
                    
                // Check if username is taken by another user
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => 
                    u.Username == userReq.Username && u.Id != id);
                    
                if (existingUser != null)
                    throw new ApplicationException("Username is already taken by another user");
                    
                user.Username = userReq.Username;
            }
            
            if (userReq.PasswordHash != null)
            {
                if (string.IsNullOrWhiteSpace(userReq.PasswordHash))
                    throw new ArgumentException("Password cannot be empty");
                    
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userReq.PasswordHash);
            }
            
            user.IsAdmin = userReq.IsAdmin ?? user.IsAdmin;

            // Remove all existing RolesUsers for this user
            if (user.RolesUsers != null && user.RolesUsers.Any())
            {
                _context.RemoveRange(user.RolesUsers);
                user.RolesUsers.Clear();
            }

            // Add new roles if provided
            if (userReq.RolesId != null && userReq.RolesId.Count > 0)
            {
                foreach (var roleId in userReq.RolesId)
                {
                    var role = await _context.Roles.FindAsync(roleId);
                    if (role == null)
                        throw new ApplicationException($"Role with ID {roleId} not found");

                    var newRoleUser = new RolesUser
                    {
                        Id = Guid.NewGuid(),
                        RoleId = role.Id,
                        Role = role,
                        User = user,
                        UserId = user.Id,
                        Valeur = true
                    };
                    user.RolesUsers ??= new List<RolesUser>();
                    user.RolesUsers.Add(newRoleUser);
                }
            }
            
            try
            {
                await _context.SaveChangesAsync();
                return user;
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ApplicationException("The user has been modified by another user. Please refresh and try again.");
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to update user", ex);
            }
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