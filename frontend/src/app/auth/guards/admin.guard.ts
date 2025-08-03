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

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
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

        if (!this.roleService.isAdmin()) {
            return this.router.createUrlTree(['/unauthorized'], {
                queryParams: { reason: 'admin_required' }
            });
        }

        return true;
    }
}
