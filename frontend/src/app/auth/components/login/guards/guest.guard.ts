import { Injectable, inject } from '@angular/core';
import {
    CanActivate,
    Router,
    UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class GuestGuard implements CanActivate {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    canActivate(): boolean | UrlTree {
        if (!this.authService.isAuthenticated()) {
            return true;
        }

        // Si déjà connecté, rediriger vers le dashboard
        return this.router.createUrlTree(['/dashboard']);
    }
}
