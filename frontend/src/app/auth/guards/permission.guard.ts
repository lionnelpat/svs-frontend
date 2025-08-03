import { Injectable, inject } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree
} from '@angular/router';
import { RoleService } from '../services/role.service';
import {AuthService} from "../services/auth.service";
import {Permission} from "../enums/permissions.enum";

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
    private readonly roleService = inject(RoleService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {
        if (!this.authService.isAuthenticated()) {
            return this.router.createUrlTree(['/auth/login']);
        }

        const requiredPermissions = route.data['permissions'] as Permission[];

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const requireAll = route.data['requireAllPermissions'] as boolean || false;
        const hasAccess = requireAll
            ? this.roleService.hasAllPermissions(requiredPermissions)
            : this.roleService.hasAnyPermission(requiredPermissions);

        if (!hasAccess) {
            return this.router.createUrlTree(['/unauthorized'], {
                queryParams: {
                    reason: 'missing_permission',
                    required: requiredPermissions.join(',')
                }
            });
        }

        return true;
    }
}
