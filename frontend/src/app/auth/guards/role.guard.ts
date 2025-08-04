import { Injectable, inject } from '@angular/core';
import {
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';


@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {
        if (!this.authService.isAuthenticated()) {
            return this.router.createUrlTree(['/auth/login']);
        }

        const requiredRoles = route.data['roles'] as string[];

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        if (this.authService.hasAnyRole(requiredRoles)) {
            return true;
        }

        // Rediriger vers une page d'accès refusé ou le dashboard
        return this.router.createUrlTree(['/unauthorized']);
    }
}
