import { Injectable, inject } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly authService = inject(AuthService);
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Ajouter le token d'authentification si disponible
        const authRequest = this.addAuthHeader(request);

        return next.handle(authRequest).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && !this.isRefreshing) {
                    return this.handle401Error(authRequest, next);
                }

                return throwError(() => error);
            })
        );
    }

    private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
        const token = this.authService.getAccessToken();

        if (token && !this.isAuthRequest(request.url)) {
            return request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return request;
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (request.url.includes('/auth/login')) {
            return throwError(() => new HttpErrorResponse({
                error: request,
                status: 401,
                statusText: 'Unauthorized'
            }));
        }

        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((response) => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(response.accessToken);

                    // Réessayer la requête originale avec le nouveau token
                    const newAuthRequest = this.addAuthHeader(request);
                    return next.handle(newAuthRequest);
                }),
                catchError((error) => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    return throwError(() => error);
                })
            );
        }

        // Si un rafraîchissement est déjà en cours, attendre
        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(() => {
                const newAuthRequest = this.addAuthHeader(request);
                return next.handle(newAuthRequest);
            })
        );
    }

    private isAuthRequest(url: string): boolean {
        return url.includes('/auth/login') ||
            url.includes('/auth/refresh') ||
            url.includes('/auth/register');
    }
}
