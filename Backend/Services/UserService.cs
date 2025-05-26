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
                new Claim("isAdmin", user.IsAdmin.ToString())
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
                        claims.Add(new Claim(ClaimTypes.Role, roleUser.Role.Libelle));
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var user = await _context.Users
                    .Include(u => u.RolesUsers)
                    .FirstOrDefaultAsync(u => u.Id == id);
                    
                if (user == null)
                    throw new ApplicationException($"User not found with this id: {id}");
                    
                // Update username if provided
                if (userReq.Username != null)
                {
                    if (string.IsNullOrWhiteSpace(userReq.Username))
                        throw new ArgumentException("Username cannot be empty");
                        
                    var existingUser = await _context.Users.FirstOrDefaultAsync(u => 
                        u.Username == userReq.Username && u.Id != id);
                        
                    if (existingUser != null)
                        throw new ApplicationException("Username is already taken by another user");
                        
                    user.Username = userReq.Username;
                }
                
                // Update password if provided
                if (userReq.PasswordHash != null)
                {
                    if (string.IsNullOrWhiteSpace(userReq.PasswordHash))
                        throw new ArgumentException("Password cannot be empty");
                        
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userReq.PasswordHash);
                }
                
                // Update IsAdmin
                user.IsAdmin = userReq.IsAdmin ?? user.IsAdmin;
                
                // Save user changes first
                await _context.SaveChangesAsync();

                // Handle roles update separately
                if (userReq.RolesId != null)
                {
                    // Get current role IDs fresh from database
                    var currentRoleUsers = await _context.RolesUsers
                        .Where(ru => ru.UserId == user.Id)
                        .ToListAsync();
                    
                    var currentRoleIds = currentRoleUsers.Select(ru => ru.RoleId).ToList();
                    var newRoleIds = userReq.RolesId;

                    // Find roles to remove
                    var rolesToRemove = currentRoleUsers.Where(ru => !newRoleIds.Contains(ru.RoleId)).ToList();
                    if (rolesToRemove.Any())
                    {
                        _context.RolesUsers.RemoveRange(rolesToRemove);
                    }

                    // Find roles to add
                    var rolesToAdd = newRoleIds.Where(roleId => !currentRoleIds.Contains(roleId)).ToList();
                    
                    // Validate all roles exist before adding any
                    foreach (var roleId in rolesToAdd)
                    {
                        var roleExists = await _context.Roles.AnyAsync(r => r.Id == roleId);
                        if (!roleExists)
                            throw new ApplicationException($"Role with ID {roleId} not found");
                    }
                    
                    // Add new roles
                    foreach (var roleId in rolesToAdd)
                    {
                        var newRoleUser = new RolesUser
                        {
                            Id = Guid.NewGuid(),
                            RoleId = roleId,
                            UserId = user.Id,
                            Valeur = true
                        };
                        _context.RolesUsers.Add(newRoleUser);
                    }
                    
                    // Save all role changes at once
                    await _context.SaveChangesAsync();
                }
                await transaction.CommitAsync();
                
                // Return fresh user data
                return await GetUserById(user.Id) ?? throw new ApplicationException("Failed to update user");
            }
            catch (ArgumentException)
            {
                await transaction.RollbackAsync();
                throw; // Re-throw ArgumentException with original message
            }
            catch (ApplicationException)
            {
                await transaction.RollbackAsync();
                throw; // Re-throw ApplicationException with original message
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
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