// src/app/auth/services/role.service.ts
import { Injectable, inject, computed } from '@angular/core';
import { UserRole } from '../enums/roles.enum';

import {AuthService} from "./auth.service";
import {Permission} from "../enums/permissions.enum";
import {ROLE_PERMISSIONS} from "../enums/role-permissions";

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly authService = inject(AuthService);

    // Signaux computed pour les permissions de l'utilisateur actuel
    public readonly userPermissions = computed(() => {
        const userRoles = this.authService.userRoles();
        if (!userRoles || userRoles.length === 0) {
            return [];
        }

        // Combiner toutes les permissions des rôles de l'utilisateur
        const allPermissions = new Set<Permission>();

        userRoles.forEach(role => {
            const roleEnum = role as UserRole;
            const permissions = ROLE_PERMISSIONS[roleEnum] || [];
            permissions.forEach(permission => allPermissions.add(permission));
        });

        return Array.from(allPermissions);
    });

    public readonly userRolesPriority = computed(() => {
        const userRoles = this.authService.userRoles();
        const rolePriority = {
            [UserRole.SUPER_ADMIN]: 5,
            [UserRole.ADMIN]: 4,
            [UserRole.MANAGER]: 3,
            [UserRole.USER]: 2,
            [UserRole.VIEWER]: 1
        };

        return Math.max(...userRoles.map(role => rolePriority[role as UserRole] || 0));
    });

    public readonly isAdmin = computed(() =>
        this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN])
    );

    public readonly isSuperAdmin = computed(() =>
        this.hasRole(UserRole.SUPER_ADMIN)
    );

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     */
    hasRole(role: UserRole): boolean {
        return this.authService.hasRole(role);
    }

    /**
     * Vérifie si l'utilisateur a au moins un des rôles spécifiés
     */
    hasAnyRole(roles: UserRole[]): boolean {
        return this.authService.hasAnyRole(roles);
    }

    /**
     * Vérifie si l'utilisateur a tous les rôles spécifiés
     */
    hasAllRoles(roles: UserRole[]): boolean {
        return roles.every(role => this.hasRole(role));
    }

    /**
     * Vérifie si l'utilisateur a une permission spécifique
     */
    hasPermission(permission: Permission): boolean {
        return this.userPermissions().includes(permission);
    }

    /**
     * Vérifie si l'utilisateur a au moins une des permissions spécifiées
     */
    hasAnyPermission(permissions: Permission[]): boolean {
        return permissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Vérifie si l'utilisateur a toutes les permissions spécifiées
     */
    hasAllPermissions(permissions: Permission[]): boolean {
        return permissions.every(permission => this.hasPermission(permission));
    }

    /**
     * Obtient les permissions pour un rôle donné
     */
    getPermissionsForRole(role: UserRole): Permission[] {
        return ROLE_PERMISSIONS[role] || [];
    }

    /**
     * Vérifie si l'utilisateur peut effectuer une action sur une ressource
     */
    canPerformAction(resource: string, action: string): boolean {
        const permission = `${resource}.${action}` as Permission;
        return this.hasPermission(permission);
    }

    /**
     * Vérifie si l'utilisateur a un niveau d'autorisation suffisant
     */
    hasMinimumRole(minimumRole: UserRole): boolean {
        const rolePriority = {
            [UserRole.VIEWER]: 1,
            [UserRole.USER]: 2,
            [UserRole.MANAGER]: 3,
            [UserRole.ADMIN]: 4,
            [UserRole.SUPER_ADMIN]: 5
        };

        const requiredPriority = rolePriority[minimumRole];
        const userPriority = this.userRolesPriority();

        return userPriority >= requiredPriority;
    }

    /**
     * Filtre une liste d'éléments basée sur les permissions
     */
    filterByPermissions<T>(
        items: T[],
        getRequiredPermission: (item: T) => Permission | Permission[]
    ): T[] {
        return items.filter(item => {
            const requiredPermissions = getRequiredPermission(item);

            if (Array.isArray(requiredPermissions)) {
                return this.hasAnyPermission(requiredPermissions);
            } else {
                return this.hasPermission(requiredPermissions);
            }
        });
    }

    /**
     * Obtient un libellé lisible pour un rôle
     */
    getRoleLabel(role: UserRole): string {
        const labels = {
            [UserRole.SUPER_ADMIN]: 'Super Administrateur',
            [UserRole.ADMIN]: 'Administrateur',
            [UserRole.MANAGER]: 'Gestionnaire',
            [UserRole.USER]: 'Utilisateur',
            [UserRole.VIEWER]: 'Observateur'
        };

        return labels[role] || role;
    }

    /**
     * Obtient une description pour une permission
     */
    getPermissionDescription(permission: Permission): string {
        const descriptions = {
            [Permission.USERS_CREATE]: 'Créer des utilisateurs',
            [Permission.USERS_READ]: 'Consulter les utilisateurs',
            [Permission.USERS_UPDATE]: 'Modifier les utilisateurs',
            [Permission.USERS_DELETE]: 'Supprimer les utilisateurs',

            [Permission.INVOICES_CREATE]: 'Créer des factures',
            [Permission.INVOICES_READ]: 'Consulter les factures',
            [Permission.INVOICES_UPDATE]: 'Modifier les factures',
            [Permission.INVOICES_DELETE]: 'Supprimer les factures',
            [Permission.INVOICES_APPROVE]: 'Approuver les factures',

            [Permission.COMPANIES_CREATE]: 'Créer des entreprises',
            [Permission.COMPANIES_READ]: 'Consulter les entreprises',
            [Permission.COMPANIES_UPDATE]: 'Modifier les entreprises',
            [Permission.COMPANIES_DELETE]: 'Supprimer les entreprises',

            // Ajoutez les autres descriptions...
        };

        return permission || descriptions[permission];
    }
}
