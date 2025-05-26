using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Data;
using Backend.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;

using Backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
//builder.Services.AddScoped<IUserProvider, HttpContextUserProvider>();


// Configure CORS
builder.Services.AddCors(options =>
{
    var allowedOrigin = builder.Configuration["AllowedOrigins:AllowedOrigin"] ?? "http://localhost:4200";
    options.AddPolicy("AllowAngularApp",
        corsBuilder =>
        {
            corsBuilder.WithOrigins(allowedOrigin)
                       .AllowAnyHeader()
                       .AllowAnyMethod();
        });
});

var secret = builder.Configuration["AppSettings:Secret"] ?? throw new InvalidOperationException("JWT secret not configured");
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string not configured");

//Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            ClockSkew = TimeSpan.Zero
        };
    });

//Register services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IFamilleService, FamilleService>();
builder.Services.AddScoped<IUniteService, UniteService>();
builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<ILivraisonService, LivraisonService>();
// Register DbContext for EF Core
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var app  = builder.Build();
app.UseErrorHandling();


app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();