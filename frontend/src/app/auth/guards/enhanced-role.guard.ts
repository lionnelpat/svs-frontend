
// src/app/auth/guards/enhanced-role.guard.ts
import { Injectable, inject } from '@angular/core';
import {
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree
} from '@angular/router';
import { UserRoleService } from '../services/user-role.service';
import {UserRole} from "../enums/roles.enum";
import {Permission} from "../enums/permissions.enum";
import {AuthService} from "../services/auth.service";

@Injectable({
    providedIn: 'root'
})
export class EnhancedRoleGuard implements CanActivate, CanActivateChild {
    private readonly roleService = inject(UserRoleService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {
        return this.checkAccess(route);
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {
        return this.checkAccess(childRoute);
    }

    private checkAccess(route: ActivatedRouteSnapshot): boolean | UrlTree {
        // Vérifier d'abord l'authentification
        if (!this.authService.isAuthenticated()) {
            return this.router.createUrlTree(['/auth/login']);
        }

        const data = route.data;

        // Vérifier les rôles requis
        const requiredRoles = data['roles'] as UserRole[];
        const requireAllRoles = data['requireAllRoles'] as boolean || false;

        if (requiredRoles && requiredRoles.length > 0) {
            const hasRoleAccess = requireAllRoles
                ? this.roleService.hasAllRoles(requiredRoles)
                : this.roleService.hasAnyRole(requiredRoles);

            if (!hasRoleAccess) {
                return this.router.createUrlTree(['/unauthorized'], {
                    queryParams: { reason: 'insufficient_role' }
                });
            }
        }

        // Vérifier les permissions requises
        const requiredPermissions = data['permissions'] as Permission[];
        const requireAllPermissions = data['requireAllPermissions'] as boolean || false;

        if (requiredPermissions && requiredPermissions.length > 0) {
            const hasPermissionAccess = requireAllPermissions
                ? this.roleService.hasAllPermissions(requiredPermissions)
                : this.roleService.hasAnyPermission(requiredPermissions);

            if (!hasPermissionAccess) {
                return this.router.createUrlTree(['/unauthorized'], {
                    queryParams: { reason: 'insufficient_permission' }
                });
            }
        }

        // Vérifier le rôle minimum
        const minimumRole = data['minimumRole'] as UserRole;
        if (minimumRole && !this.roleService.hasMinimumRole(minimumRole)) {
            return this.router.createUrlTree(['/unauthorized'], {
                queryParams: { reason: 'insufficient_level' }
            });
        }

        return true;
    }
}
