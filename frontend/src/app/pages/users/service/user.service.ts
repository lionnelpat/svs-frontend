// src/app/pages/users/service/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, EMPTY } from 'rxjs';
import { catchError, tap, map, finalize } from 'rxjs/operators';
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    UserPageResponse,
    UserSummary,
    UserSearchFilter,
    ChangePasswordRequest,
    RoleAssignmentRequest,
    BulkUserAction,
    UserExportRequest,
    UserStats,
    UserActivity,
    UserEvent,
    UserEventType
} from '../interfaces/user.interface';
import { USER_API_ENDPOINTS, DEFAULT_PAGINATION } from '../constants/constants';
import { MessageService } from 'primeng/api';
import {environment} from "../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly messageService = inject(MessageService);

    private readonly apiUrl = `${environment.apiBaseUrl}${USER_API_ENDPOINTS.BASE}`;

    // États réactifs
    private readonly _loading = new BehaviorSubject<boolean>(false);
    private readonly _users = new BehaviorSubject<User[]>([]);
    private readonly _selectedUsers = new BehaviorSubject<User[]>([]);
    private readonly _userStats = new BehaviorSubject<UserStats | null>(null);
    private readonly _userEvents = new BehaviorSubject<UserEvent[]>([]);

    // Observables publics
    public readonly loading$ = this._loading.asObservable();
    public readonly users$ = this._users.asObservable();
    public readonly selectedUsers$ = this._selectedUsers.asObservable();
    public readonly userStats$ = this._userStats.asObservable();
    public readonly userEvents$ = this._userEvents.asObservable();

    /**
     * Récupère tous les utilisateurs avec pagination
     */
    getAllUsers(
        page: number = DEFAULT_PAGINATION.PAGE,
        size: number = DEFAULT_PAGINATION.SIZE,
        sortBy: string = DEFAULT_PAGINATION.SORT_BY,
        sortDir: string = DEFAULT_PAGINATION.SORT_DIR
    ): Observable<UserPageResponse> {
        this._loading.next(true);

        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', sortBy)
            .set('sortDir', sortDir);

        return this.http.get<UserPageResponse>(this.apiUrl, { params }).pipe(
            tap(response => {
                this._users.next(response.users);
            }),
            catchError(this.handleError('récupération des utilisateurs')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Récupère les utilisateurs actifs (pour les sélecteurs)
     */
    getActiveUsers(): Observable<UserSummary[]> {
        return this.http.get<UserSummary[]>(`${this.apiUrl}${USER_API_ENDPOINTS.ACTIVE}`).pipe(
            catchError(this.handleError('récupération des utilisateurs actifs'))
        );
    }

    /**
     * Recherche des utilisateurs avec filtres
     */
    searchUsers(
        filter: UserSearchFilter = {},
        page: number = DEFAULT_PAGINATION.PAGE,
        size: number = DEFAULT_PAGINATION.SIZE,
        sortBy: string = DEFAULT_PAGINATION.SORT_BY,
        sortDir: string = DEFAULT_PAGINATION.SORT_DIR
    ): Observable<UserPageResponse> {
        this._loading.next(true);

        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', sortBy)
            .set('sortDir', sortDir);

        return this.http.post<UserPageResponse>(`${this.apiUrl}${USER_API_ENDPOINTS.SEARCH}`, filter, { params }).pipe(
            tap(response => {
                this._users.next(response.users);
            }),
            catchError(this.handleError('recherche d\'utilisateurs')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Récupère un utilisateur par ID
     */
    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}${USER_API_ENDPOINTS.BY_ID(id)}`).pipe(
            catchError(this.handleError(`récupération de l'utilisateur ${id}`))
        );
    }

    /**
     * Crée un nouvel utilisateur
     */
    createUser(request: CreateUserRequest): Observable<User> {
        this._loading.next(true);

        return this.http.post<User>(this.apiUrl, request).pipe(
            tap(user => {
                this.showSuccess('Utilisateur créé avec succès');
                this.emitUserEvent('user_created', user.id, user.username);
                this.refreshUserList();
            }),
            catchError(this.handleError('création de l\'utilisateur')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Met à jour un utilisateur
     */
    updateUser(id: number, request: UpdateUserRequest): Observable<User> {
        this._loading.next(true);

        return this.http.put<User>(`${this.apiUrl}${USER_API_ENDPOINTS.UPDATE(id)}`, request).pipe(
            tap(user => {
                this.showSuccess('Utilisateur mis à jour avec succès');
                this.emitUserEvent('user_updated', user.id, user.username);
                this.refreshUserList();
            }),
            catchError(this.handleError('mise à jour de l\'utilisateur')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Active un utilisateur
     */
    activateUser(id: number): Observable<User> {
        this._loading.next(true);

        return this.http.patch<User>(`${this.apiUrl}${USER_API_ENDPOINTS.ACTIVATE(id)}`, {}).pipe(
            tap(user => {
                this.showSuccess('Utilisateur activé avec succès');
                this.emitUserEvent('user_activated', user.id, user.username);
                this.refreshUserList();
            }),
            catchError(this.handleError('activation de l\'utilisateur')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Désactive un utilisateur
     */
    deactivateUser(id: number): Observable<User> {
        this._loading.next(true);

        return this.http.patch<User>(`${this.apiUrl}${USER_API_ENDPOINTS.DEACTIVATE(id)}`, {}).pipe(
            tap(user => {
                this.showSuccess('Utilisateur désactivé avec succès');
                this.emitUserEvent('user_deactivated', user.id, user.username);
                this.refreshUserList();
            }),
            catchError(this.handleError('désactivation de l\'utilisateur')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Déverrouille un utilisateur
     */
    unlockUser(id: number): Observable<User> {
        this._loading.next(true);

        return this.http.patch<User>(`${this.apiUrl}${USER_API_ENDPOINTS.UNLOCK(id)}`, {}).pipe(
            tap(user => {
                this.showSuccess('Compte utilisateur déverrouillé avec succès');
                this.emitUserEvent('user_unlocked', user.id, user.username);
                this.refreshUserList();
            }),
            catchError(this.handleError('déverrouillage de l\'utilisateur')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Supprime un utilisateur
     */
    deleteUser(id: number): Observable<{ message: string }> {
        this._loading.next(true);

        return this.http.delete<{ message: string }>(`${this.apiUrl}${USER_API_ENDPOINTS.DELETE(id)}`).pipe(
            tap(response => {
                this.showSuccess('Utilisateur supprimé avec succès');
                this.emitUserEvent('user_deleted', id, 'Utilisateur supprimé');
                this.refreshUserList();
            }),
            catchError(this.handleError('suppression de l\'utilisateur')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Vérifie si un utilisateur peut être supprimé
     */
    canDeleteUser(id: number): Observable<{ canDelete: boolean }> {
        return this.http.get<{ canDelete: boolean }>(`${this.apiUrl}${USER_API_ENDPOINTS.CAN_DELETE(id)}`).pipe(
            catchError(this.handleError('vérification de suppression'))
        );
    }

    /**
     * Change le mot de passe d'un utilisateur
     */
    changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
        this._loading.next(true);

        return this.http.post<{ message: string }>(`${this.apiUrl}${USER_API_ENDPOINTS.CHANGE_PASSWORD}`, request).pipe(
            tap(response => {
                this.showSuccess('Mot de passe modifié avec succès');
                this.emitUserEvent('password_changed', request.userId, 'Mot de passe modifié');
            }),
            catchError(this.handleError('changement de mot de passe')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Assigne des rôles à un utilisateur
     */
    assignRoles(request: RoleAssignmentRequest): Observable<User> {
        this._loading.next(true);

        return this.http.post<User>(`${this.apiUrl}${USER_API_ENDPOINTS.ASSIGN_ROLES}`, request).pipe(
            tap(user => {
                this.showSuccess('Rôles assignés avec succès');
                this.emitUserEvent('roles_assigned', user.id, user.username, { roleIds: request.roleIds });
                this.refreshUserList();
            }),
            catchError(this.handleError('assignation de rôles')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Exécute des actions en lot sur plusieurs utilisateurs
     */
    executeBulkAction(action: BulkUserAction): Observable<{ message: string; processedCount: number }> {
        this._loading.next(true);

        return this.http.post<{ message: string; processedCount: number }>(
            `${this.apiUrl}${USER_API_ENDPOINTS.BULK_ACTIONS}`,
            action
        ).pipe(
            tap(response => {
                this.showSuccess(`Action effectuée sur ${response.processedCount} utilisateur(s) avec succès`);
                this.refreshUserList();
            }),
            catchError(this.handleError('exécution d\'actions en lot')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Exporte les données utilisateurs
     */
    exportUsers(request: UserExportRequest): Observable<Blob> {
        this._loading.next(true);

        return this.http.post(`${this.apiUrl}${USER_API_ENDPOINTS.EXPORT}`, request, {
            responseType: 'blob'
        }).pipe(
            tap(() => {
                this.showSuccess('Données exportées avec succès');
            }),
            catchError(this.handleError('export des données')),
            finalize(() => this._loading.next(false))
        );
    }

    /**
     * Récupère les statistiques des utilisateurs
     */
    getUserStats(): Observable<UserStats> {
        return this.http.get<UserStats>(`${this.apiUrl}${USER_API_ENDPOINTS.STATS}`).pipe(
            tap(stats => {
                this._userStats.next(stats);
            }),
            catchError(this.handleError('récupération des statistiques'))
        );
    }

    /**
     * Récupère les activités des utilisateurs
     */
    getUserActivities(
        page: number = 0,
        size: number = 20,
        userId?: number
    ): Observable<{ content: UserActivity[]; totalElements: number }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (userId) {
            params = params.set('userId', userId.toString());
        }

        return this.http.get<{ content: UserActivity[]; totalElements: number }>(
            `${this.apiUrl}${USER_API_ENDPOINTS.ACTIVITIES}`,
            { params }
        ).pipe(
            catchError(this.handleError('récupération des activités'))
        );
    }

    /**
     * Télécharge un fichier d'export
     */
    downloadExportFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Génère un nom de fichier pour l'export
     */
    generateExportFilename(format: string, includeTimestamp: boolean = true): string {
        const timestamp = includeTimestamp ? new Date().toISOString().slice(0, 19).replace(/:/g, '-') : '';
        const suffix = includeTimestamp ? `_${timestamp}` : '';
        return `utilisateurs${suffix}.${format}`;
    }

    /**
     * Valide les données d'un utilisateur
     */
    validateUserData(userData: Partial<CreateUserRequest | UpdateUserRequest>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validation du nom d'utilisateur
        if ('username' in userData) {
            if (!userData.username || userData.username.trim().length < 3) {
                errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
            }
            if (userData.username && userData.username.length > 50) {
                errors.push('Le nom d\'utilisateur ne peut pas dépasser 50 caractères');
            }
        }

        // Validation de l'email
        if (!userData.email || !this.isValidEmail(userData.email)) {
            errors.push('Un email valide est requis');
        }

        // Validation du prénom et nom
        if (!userData.firstName || userData.firstName.trim().length < 2) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        if (!userData.lastName || userData.lastName.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }

        // Validation du téléphone (si fourni)
        if (userData.phone && !this.isValidSenegalPhone(userData.phone)) {
            errors.push('Format de téléphone sénégalais invalide');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Vérifie si un email est valide
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Vérifie si un numéro de téléphone sénégalais est valide
     */
    private isValidSenegalPhone(phone: string): boolean {
        const phoneRegex = /^(\+221|00221)?\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Filtre les utilisateurs selon les critères
     */
    filterUsers(users: User[], filter: UserSearchFilter): User[] {
        return users.filter(user => {
            // Filtrage par texte de recherche
            if (filter.search) {
                const searchTerm = filter.search.toLowerCase();
                const matchesSearch =
                    user.username.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm) ||
                    user.fullName.toLowerCase().includes(searchTerm);

                if (!matchesSearch) return false;
            }

            // Filtrage par statut actif
            if (filter.isActive !== undefined && user.isActive !== filter.isActive) {
                return false;
            }

            // Filtrage par vérification email
            if (filter.isEmailVerified !== undefined && user.isEmailVerified !== filter.isEmailVerified) {
                return false;
            }

            // Filtrage par rôles
            if (filter.roleIds && filter.roleIds.length > 0) {
                const userRoleIds = user.roles.map(role => role.id);
                const hasMatchingRole = filter.roleIds.some(roleId => userRoleIds.includes(roleId));
                if (!hasMatchingRole) return false;
            }

            return true;
        });
    }

    /**
     * Trie les utilisateurs
     */
    sortUsers(users: User[], sortBy: string, sortDir: 'asc' | 'desc'): User[] {
        return [...users].sort((a, b) => {
            let aValue: any = this.getNestedProperty(a, sortBy);
            let bValue: any = this.getNestedProperty(b, sortBy);

            // Gestion des valeurs nulles/undefined
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortDir === 'asc' ? 1 : -1;
            if (bValue == null) return sortDir === 'asc' ? -1 : 1;

            // Conversion en string pour la comparaison
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            let comparison = 0;
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;

            return sortDir === 'desc' ? comparison * -1 : comparison;
        });
    }

    /**
     * Récupère une propriété imbriquée d'un objet
     */
    private getNestedProperty(obj: any, path: string): any {
        return path.split('.').reduce((current, prop) => current?.[prop], obj);
    }

    /**
     * Met à jour la sélection d'utilisateurs
     */
    updateSelectedUsers(users: User[]): void {
        this._selectedUsers.next(users);
    }

    /**
     * Efface la sélection d'utilisateurs
     */
    clearSelection(): void {
        this._selectedUsers.next([]);
    }

    /**
     * Rafraîchit la liste des utilisateurs
     */
    private refreshUserList(): void {
        // Cette méthode peut être appelée pour rafraîchir la liste
        // Elle sera implémentée selon les besoins du composant
    }

    /**
     * Émet un événement utilisateur
     */
    private emitUserEvent(type: UserEventType, userId: number, username: string, data?: any): void {
        const event: UserEvent = {
            type,
            userId,
            username,
            data,
            timestamp: new Date().toISOString()
        };

        const currentEvents = this._userEvents.getValue();
        this._userEvents.next([event, ...currentEvents.slice(0, 49)]); // Garder les 50 derniers événements
    }

    /**
     * Affiche un message de succès
     */
    private showSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: message,
            life: 5000
        });
    }

    /**
     * Affiche un message d'erreur
     */
    private showError(message: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: message,
            life: 5000
        });
    }

    /**
     * Gestion centralisée des erreurs
     */
    private handleError(operation: string) {
        return (error: HttpErrorResponse): Observable<never> => {
            console.error(`Erreur lors de ${operation}:`, error);

            let errorMessage = 'Une erreur est survenue';

            if (error.error?.message) {
                errorMessage = error.error.message;
            } else if (error.status === 0) {
                errorMessage = 'Impossible de se connecter au serveur';
            } else if (error.status === 401) {
                errorMessage = 'Non autorisé - Veuillez vous reconnecter';
            } else if (error.status === 403) {
                errorMessage = 'Accès refusé - Permissions insuffisantes';
            } else if (error.status === 404) {
                errorMessage = 'Ressource non trouvée';
            } else if (error.status >= 500) {
                errorMessage = 'Erreur serveur - Veuillez réessayer plus tard';
            }

            this.showError(errorMessage);
            return throwError(() => error);
        };
    }

    /**
     * Nettoie les ressources du service
     */
    ngOnDestroy(): void {
        this._loading.complete();
        this._users.complete();
        this._selectedUsers.complete();
        this._userStats.complete();
        this._userEvents.complete();
    }
}
