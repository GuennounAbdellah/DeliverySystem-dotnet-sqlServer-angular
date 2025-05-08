using System.Net;
using System.Text.Json;

namespace Backend.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            _logger.LogError(exception, "An unhandled exception occurred.");

            var code = HttpStatusCode.InternalServerError; // 500 if unexpected
            var result = string.Empty;

            switch (exception)
            {
                case KeyNotFoundException:
                    code = HttpStatusCode.NotFound;
                    break;
                case UnauthorizedAccessException:
                    code = HttpStatusCode.Unauthorized;
                    break;
                case ArgumentException:
                    code = HttpStatusCode.BadRequest;
                    break;
                // Add other exception types as needed
            }

            var response = new 
            {
                error = new
                {
                    message = exception.Message,
                    statusCode = (int)code
                }
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;

            result = JsonSerializer.Serialize(response);

            return context.Response.WriteAsync(result);
        }
    }

    // Extension method for startup configuration
    public static class ErrorHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ErrorHandlingMiddleware>();
        }
    }
}