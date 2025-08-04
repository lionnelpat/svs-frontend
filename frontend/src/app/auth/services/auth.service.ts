import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import {Observable, throwError, EMPTY, timer, BehaviorSubject} from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, ErrorResponse, LoginRequest, User } from '../interfaces/auth.interface';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../constants/constants';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly errorHanlder = inject(ErrorHandlerService);

    // Configuration de l'API
    private readonly API_BASE_URL = `${environment.apiBaseUrl}`;
    private readonly LOGIN_ENDPOINT = `${this.API_BASE_URL}/auth/login`;
    private readonly REFRESH_ENDPOINT = `${this.API_BASE_URL}/auth/refresh`;
    private readonly LOGOUT_ENDPOINT = `${this.API_BASE_URL}/auth/logout`;

    // Signaux pour la gestion d'état réactive
    private readonly _isAuthenticated = signal<boolean>(this.hasValidToken());
    private readonly _currentUser = signal<User | null>(this.getStoredUser());
    private readonly _isLoading = signal<boolean>(false);

    // Signaux publics (readonly)
    public readonly isAuthenticated = this._isAuthenticated.asReadonly();
    public readonly currentUser = this._currentUser.asReadonly();
    public readonly isLoading = this._isLoading.asReadonly();

    private inactivityTimeout: any;
    private readonly maxInactivityTime =  60 * 1000; // 1 minute en millisecondes
    private readonly sessionExpiredSubject = new BehaviorSubject<boolean>(false);

    sessionExpired$ = this.sessionExpiredSubject.asObservable();

    // Propriétés calculées
    public readonly userFullName = computed(() =>
        this.currentUser()?.fullName ?? 'Utilisateur'
    );

    public readonly userRoles = computed(() =>
        this.currentUser()?.roles || []
    );

    constructor(private readonly route: Router) {
        this.initializeAuthState();
        this.startTokenRefreshTimer();
        this.initInactivityTracking();
    }

    private initInactivityTracking() {
        // Suivre l’activité de l’utilisateur
        window.addEventListener('mousemove', () => this.resetInactivityTimeout());
        window.addEventListener('keydown', () => this.resetInactivityTimeout());

        this.resetInactivityTimeout();
    }

    /**
     * Connexion de l'utilisateur
     */
    login(credentials: LoginRequest): Observable<AuthResponse> {
        this._isLoading.set(true);

        return this.http.post<AuthResponse>(this.LOGIN_ENDPOINT, credentials).pipe(
            tap(response => {
                if (response.success) {
                    this.handleAuthSuccess(response);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                this._isLoading.set(false);
                const backendError: ErrorResponse = error.error;

                // ✅ Appelle le handler avec le vrai objet d’erreur
                this.errorHanlder.handleError(backendError);

                // ✅ Propagation du vrai message d'erreur au composant
                return throwError(() => backendError);

            }),
            tap(() => this._isLoading.set(false))
        );
    }

    /**
     * Déconnexion de l'utilisateur
     */
    logout(): Observable<any> {
        const accessToken = this.getAccessToken();

        // Nettoyer immédiatement l'état local
        this.clearAuthData();

        if (accessToken) {
            const headers = new HttpHeaders({
                Authorization: `Bearer ${accessToken}`
            });

            return this.http.post(this.LOGOUT_ENDPOINT, {}, { headers }).pipe(
                catchError(() => EMPTY), // Ignorer les erreurs de déconnexion
                tap(() => this.router.navigate(['/auth/login']))
            );
        } else {
            this.router.navigate(['/auth/login']);
            return EMPTY;
        }
    }


    /**
     * Rafraîchissement du token
     */
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            this.logout();
            return throwError(() => new Error('Aucun refresh token disponible'));
        }

        return this.http.post<AuthResponse>(this.REFRESH_ENDPOINT, { refreshToken }).pipe(
            tap(response => {
                if (response.success) {
                    this.handleAuthSuccess(response);
                }
            }),
            catchError(error => {
                this.logout();
                return throwError(() => error);
            })
        );
    }

    /**
     * Vérification si l'utilisateur a un rôle spécifique
     */
    hasRole(role: string): boolean {
        return this.userRoles().includes(role);
    }

    /**
     * Vérification si l'utilisateur a au moins un des rôles spécifiés
     */
    hasAnyRole(roles: string[]): boolean {
        return roles.some(role => this.hasRole(role));
    }

    /**
     * Obtenir le token d'accès
     */
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    /**
     * Obtenir le refresh token
     */
    private getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    /**
     * Vérifier si l'utilisateur a un token valide
     */
    private hasValidToken(): boolean {
        const token = this.getAccessToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            return !isExpired;
        } catch {
            return false;
        }
    }

    /**
     * Obtenir l'utilisateur stocké
     */
    private getStoredUser(): User | null {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    /**
     * Initialiser l'état d'authentification
     */
    private initializeAuthState(): void {
        const isAuth = this.hasValidToken();
        const user = this.getStoredUser();

        this._isAuthenticated.set(isAuth);
        this._currentUser.set(user);

        // Si pas authentifié, nettoyer les données
        if (!isAuth) {
            this.clearAuthData();
        }
    }

    /**
     * Gérer le succès de l'authentification
     */
    private handleAuthSuccess(response: AuthResponse): void {
        // Stocker les tokens et les données utilisateur
        localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        // Mettre à jour l'état
        this._isAuthenticated.set(true);
        this._currentUser.set(response.user);

        // Rediriger vers le dashboard
        this.router.navigate(['/dashboard']);
    }

    /**
     * Gérer les erreurs d'authentification
     */
    private handleAuthError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Une erreur est survenue lors de la connexion';

        if (error.error && error.error.message) {
            errorMessage = error.error.message;
        } else if (error.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur';
        }

        return throwError(() => ({ message: errorMessage, error }));
    }

    /**
     * Nettoyer les données d'authentification
     */
    private clearAuthData(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        this._isAuthenticated.set(false);
        this._currentUser.set(null);
    }

    /**
     * Démarrer le timer de rafraîchissement automatique du token
     */
    private startTokenRefreshTimer(): void {
        // Vérifier toutes les minutes si le token doit être rafraîchi
        timer(60000, 60000).pipe(
            switchMap(() => {
                if (!this.isAuthenticated()) return EMPTY;

                const token = this.getAccessToken();
                if (!token) return EMPTY;

                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const expirationTime = payload.exp * 1000;
                    const currentTime = Date.now();
                    const timeUntilExpiry = expirationTime - currentTime;

                    // Rafraîchir si le token expire dans moins de 5 minutes
                    if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
                        return this.refreshToken();
                    }
                } catch {
                    // Token invalide, déconnecter
                    this.logout();
                }

                return EMPTY;
            })
        ).subscribe();
    }

    private resetInactivityTimeout() {
        // Réinitialiser le timeout pour chaque interaction
        clearTimeout(this.inactivityTimeout);

        // Démarrer un nouveau timer d'inactivité
        this.inactivityTimeout = setTimeout(() => this.checkSessionStatus(), this.maxInactivityTime);
    }

    getExpirationTimeFromToken(token: string | null): number {
        if (!token) {
            return 0;
        }
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            return 0;
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        return payload?.exp ? payload.exp * 1000 : 0;
    }

    private async checkSessionStatus() {
        if (this.route.url === '/auth/login') {
            return;
        }

        const token = localStorage.getItem('access_token');
        // Vérifiez si le token est valide et, s'il est expiré, déconnectez l'utilisateur
        const currentTime = Math.floor(Date.now());
        const isTokenExpired = this.getExpirationTimeFromToken(token) <= currentTime;

        if (isTokenExpired) {
            this.sessionExpiredSubject.next(true);
        } else {
            this.resetInactivityTimeout();
        }
    }
}
