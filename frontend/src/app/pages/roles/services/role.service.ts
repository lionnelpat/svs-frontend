// services/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
    Role,
    CreateRoleRequest,
    UpdateRoleRequest,
    RoleSearchParams,
    RoleResponse
} from '../interfaces/role.interface';

import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly apiBaseUrl = `${environment.apiBaseUrl}/admin/roles`;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {}

    /**
     * Récupérer tous les rôles avec pagination et recherche
     */
    getRoles(filter: RoleSearchParams = {}): Observable<RoleResponse> {
        this.logger.info('Appel API - Liste des rôles', filter);

        let params = new HttpParams()
            .set('page', filter.page?.toString() || '0')
            .set('size', filter.size?.toString() || '10')
            .set('sortBy', filter.sortBy || 'name')
            .set('sortDirection', filter.sortDirection || 'asc');

        if (filter.search) {
            params = params.set('search', filter.search);
        }
        if (filter.isActive !== undefined) {
            params = params.set('isActive', filter.isActive.toString());
        }

        return this.http.get<RoleResponse>(this.apiBaseUrl, { params }).pipe(
            catchError(err => this.handleError(err, 'Chargement des rôles'))
        );
    }

    /**
     * Récupérer tous les rôles actifs (pour dropdown)
     */
    getActiveRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.apiBaseUrl}/active`).pipe(
            catchError(err => this.handleError(err, 'Chargement des rôles actifs'))
        );
    }

    /**
     * Récupérer un rôle par ID
     */
    getRoleById(id: number): Observable<Role> {
        return this.http.get<Role>(`${this.apiBaseUrl}/${id}`).pipe(
            catchError(err => this.handleError(err, `Chargement rôle ID: ${id}`))
        );
    }

    /**
     * Créer un rôle
     */
    createRole(request: CreateRoleRequest): Observable<Role> {
        return this.http.post<Role>(this.apiBaseUrl, request).pipe(
            catchError(err => this.handleError(err, 'Création rôle'))
        );
    }

    /**
     * Mettre à jour un rôle
     */
    updateRole(id: number, request: UpdateRoleRequest): Observable<Role> {
        return this.http.put<Role>(`${this.apiBaseUrl}/${id}`, request).pipe(
            catchError(err => this.handleError(err, `Mise à jour rôle ID: ${id}`))
        );
    }

    /**
     * Supprimer un rôle
     */
    deleteRole(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBaseUrl}/${id}`).pipe(
            catchError(err => this.handleError(err, `Suppression rôle ID: ${id}`))
        );
    }

    /**
     * Activer / Désactiver un rôle
     */
    toggleRoleStatus(id: number, isActive: boolean): Observable<Role> {
        const action = isActive ? 'deactivate': 'activate';
        return this.http.patch<Role>(`${this.apiBaseUrl}/${id}/${action}`, {}).pipe(
            catchError(err => this.handleError(err, `Changement statut rôle ID: ${id}`))
        );
    }

    /**
     * Vérifier la disponibilité du nom de rôle
     */
    checkRoleNameAvailability(name: string, excludeId?: number): Observable<{ available: boolean }> {
        let params = new HttpParams().set('name', name);
        if (excludeId) {
            params = params.set('excludeId', excludeId.toString());
        }

        return this.http.get<{ available: boolean }>(`${this.apiBaseUrl}/check-name`, { params }).pipe(
            catchError(err => this.handleError(err, `Vérification disponibilité nom: ${name}`))
        );
    }

    /**
     * Gestion d’erreur centralisée
     */
    private handleError(error: any, context: string) {
        this.logger.error(`${context} - Erreur`, error);
        this.errorHandler.handleError(error);
        return throwError(() => error);
    }

    searchRoles(filter: RoleSearchParams) {
        this.logger.info('Appel API - Recherche des rôles', filter);

        const params = new HttpParams()
            .set('page', filter.page?.toString() || '0')
            .set('size', filter.size?.toString() || '10')
            .set('sortBy', filter.sortBy || 'name')
            .set('sortDirection', filter.sortDirection || 'asc');

        // Créer le corps avec les filtres uniquement (pas la pagination ici)
        const body = {
            search: filter.search,
            isActive: filter.isActive
        };

        return this.http.post<RoleResponse>(`${this.apiBaseUrl}/search`, body, { params }).pipe(
            catchError(err => this.handleError(err, 'Chargement des rôles'))
        );
    }

}
