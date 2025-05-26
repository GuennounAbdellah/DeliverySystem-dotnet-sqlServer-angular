using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Security.Claims;

public class RoleOrAdminAttribute : AuthorizeAttribute, IAuthorizationFilter
{
    private readonly string _requiredRole;

    public RoleOrAdminAttribute(string requiredRole)
    {
        _requiredRole = requiredRole;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        if (!user.Identity?.IsAuthenticated ?? false)
        {
            // If the user is not authenticated, return 401 Unauthorized
            context.Result = new UnauthorizedResult();
            return;
        }

        // Check if user is admin via claim
        var isAdminClaim = user.FindFirst("isAdmin")?.Value;
        bool isAdmin = bool.TryParse(isAdminClaim, out bool adminValue) && adminValue;

        if (!isAdmin && !user.IsInRole(_requiredRole))
        {
            // If the user is authenticated but does not have the required role or is not an admin, return 403 Forbidden
            context.Result = new ForbidResult();
        }
    }
}
