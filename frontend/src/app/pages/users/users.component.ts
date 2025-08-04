// src/app/pages/users/users.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../../auth/services/role.service';
import { UserService } from './service/user.service';
import { User, UserStats } from './interfaces/user.interface';
import { UserRole} from "../../auth/enums/roles.enum";
import {Permission} from "../../auth/enums/permissions.enum";
import {Dialog} from "primeng/dialog";
import {Tooltip} from "primeng/tooltip";
import {Button } from "primeng/button";
import {NgIf} from "@angular/common";
import {UserListComponent} from "./components/user-list/user-list.component";
import {UserFormComponent} from "./components/user-form/user-form.component";

@Component({
    selector: 'app-users',
    standalone: true,
    templateUrl: './users.component.html',
    imports: [
        Dialog,
        Tooltip,
        NgIf,
        UserListComponent,
        Button,
        UserFormComponent
    ],
    styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, OnDestroy {
    private readonly roleService = inject(RoleService);
    private readonly userService = inject(UserService);
    private readonly destroy$ = new Subject<void>();

    // Exposer les enums pour le template
    readonly UserRole = UserRole;
    readonly Permission = Permission;

    // États du composant
    selectedUser: User | null = null;
    showUserForm = false;
    isEditMode = false;
    userStats: UserStats | null = null;

    // Permissions calculées
    get canCreateUser(): boolean {
        return this.roleService.hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
    }

    get canEditUser(): boolean {
        return this.roleService.hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
    }

    get canDeleteUser(): boolean {
        return this.roleService.hasRole(UserRole.SUPER_ADMIN);
    }

    get canManageRoles(): boolean {
        return this.roleService.hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
    }

    get isAdmin(): boolean {
        return this.roleService.isAdmin();
    }

    get isSuperAdmin(): boolean {
        return this.roleService.isSuperAdmin();
    }

    ngOnInit() {
        // this.loadUserStats();
        this.subscribeToUserEvents();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Charge les statistiques des utilisateurs
     */
    private loadUserStats(): void {
        this.userService.getUserStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.userStats = stats;
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des statistiques:', error);
                }
            });
    }

    /**
     * S'abonne aux événements utilisateur
     */
    private subscribeToUserEvents(): void {
        this.userService.userEvents$
            .pipe(takeUntil(this.destroy$))
            .subscribe(events => {
                // Rafraîchir les stats si nécessaire
                if (events.length > 0 && events[0].type === 'user_created') {
                    this.loadUserStats();
                }
            });
    }

    /**
     * Ouvre le formulaire pour créer un nouvel utilisateur
     */
    onCreateUser(): void {
        if (!this.canCreateUser) {
            console.warn('Permissions insuffisantes pour créer un utilisateur');
            return;
        }

        this.selectedUser = null;
        this.isEditMode = false;
        this.showUserForm = true;
    }

    /**
     * Ouvre le formulaire pour modifier un utilisateur
     */
    onEditUser(user: User): void {
        if (!this.canEditUser) {
            console.warn('Permissions insuffisantes pour modifier un utilisateur');
            return;
        }

        this.selectedUser = user;
        this.isEditMode = true;
        this.showUserForm = true;
    }

    /**
     * Ferme le formulaire utilisateur
     */
    onCloseUserForm(): void {
        this.showUserForm = false;
        this.selectedUser = null;
        this.isEditMode = false;
    }

    /**
     * Gère la sauvegarde d'un utilisateur
     */
    onUserSaved(user: User): void {
        console.log('Utilisateur sauvegardé:', user);
        this.onCloseUserForm();
        // La liste sera automatiquement rafraîchie via le service
    }

    /**
     * Gère la suppression d'un utilisateur
     */
    onUserDeleted(userId: number): void {
        console.log('Utilisateur supprimé:', userId);
        this.loadUserStats(); // Rafraîchir les statistiques
    }

    /**
     * Gère la sélection d'un utilisateur pour voir les détails
     */
    onUserSelected(user: User): void {
        this.selectedUser = user;
    }

    /**
     * Rafraîchit les données
     */
    onRefresh(): void {
        this.loadUserStats();
    }

    getPercentage(value: number, total: number): number {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    }
}
