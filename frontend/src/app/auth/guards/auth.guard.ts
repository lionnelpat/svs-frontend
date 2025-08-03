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
export class AuthGuard implements CanActivate, CanActivateChild {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.checkAuthentication(state.url);
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.checkAuthentication(state.url);
    }

    private checkAuthentication(url: string): boolean | UrlTree {
        if (this.authService.isAuthenticated()) {
            return true;
        }

        // Rediriger vers la page de connexion avec l'URL de retour
        return this.router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: url }
        });
    }
}
