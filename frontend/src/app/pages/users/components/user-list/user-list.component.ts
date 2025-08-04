// src/app/pages/users/components/user-list/user-list.component.ts
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

import { UserService } from '../../service/user.service';
import {
    User,
    UserPageResponse,
    UserSearchFilter,
    BulkUserAction,
    UserExportRequest,
    UserTableColumn
} from '../../interfaces/user.interface';
import {
    DEFAULT_PAGINATION,
    USER_TABLE_COLUMNS,
    USER_STATUS_CONFIG,
    BULK_ACTIONS,
    EXPORT_FORMATS,
    CONFIRMATION_MESSAGES,
    TOOLTIPS
} from '../../constants/constants';
import {AuthService} from "../../../../auth/services/auth.service";
import {TableModule} from "primeng/table";
import {NgIf} from "@angular/common";
import {SplitButton} from "primeng/splitbutton";
import {ButtonDirective} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {Avatar} from "primeng/avatar";
import {Tooltip} from "primeng/tooltip";
import {Tag} from "primeng/tag";
import {ProgressSpinner} from "primeng/progressspinner";
import {ContextMenu} from "primeng/contextmenu";
import {Calendar} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import {InputText} from "primeng/inputtext";
import {logger} from "html2canvas/dist/types/core/__mocks__/logger";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";

interface TableLazyLoadEvent {
    first: number;
    rows: number;
    sortField?: string;
    sortOrder?: number;
    filters?: any;
    globalFilter?: any;
}

@Component({
    selector: 'app-user-list',
    standalone: true,
    templateUrl: './user-list.component.html',
    imports: [
        TableModule,
        NgIf,
        SplitButton,
        ButtonDirective,
        Ripple,
        Avatar,
        Tooltip,
        Tag,
        ProgressSpinner,
        ContextMenu,
        Calendar,
        ReactiveFormsModule,
        DropdownModule,
        InputText
    ],
    styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
    protected readonly userService = inject(UserService);
    private readonly authService = inject(AuthService);

    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);
    private readonly fb = inject(FormBuilder);
    private readonly destroy$ = new Subject<void>();

    // Inputs
    @Input() canEdit = false;
    @Input() canDelete = false;
    @Input() canManageRoles = false;
    @Input() isAdmin = false;
    @Input() isSuperAdmin = false;

    // Outputs
    @Output() userEdit = new EventEmitter<User>();
    @Output() userDeleted = new EventEmitter<number>();
    @Output() userSelected = new EventEmitter<User>();

    // Données de la table
    users: User[] = [];
    totalRecords = 0;
    selectedUsers: User[] = [];
    loading = false;

    // Configuration de la table
    columns: UserTableColumn[] = USER_TABLE_COLUMNS;
    first = 0;
    rows: number = DEFAULT_PAGINATION.SIZE;
    rowsPerPageOptions = [...DEFAULT_PAGINATION.SIZE_OPTIONS];

    // Filtres et recherche
    searchForm: FormGroup = this.fb.group({});
    globalFilterValue = '';
    showAdvancedFilters = false;
    currentFilter: UserSearchFilter = {};

    // Actions en lot
    bulkActions: MenuItem[] = [];
    showBulkActions = false;

    // Export
    exportFormats = EXPORT_FORMATS;
    exportOptions: MenuItem[] = [];

    // Configuration des statuts
    userStatusConfig = USER_STATUS_CONFIG;
    tooltips = TOOLTIPS;

    // Menu contextuel
    contextMenuItems: MenuItem[] = [];
    selectedContextUser: User | null = null;

    constructor() {
        this.initializeSearchForm();
        this.setupBulkActions();
        this.setupExportOptions();
    }

    ngOnInit() {
        this.loadUsers();
        this.setupSearchSubscription();
        this.subscribeToUserSelection();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Initialise le formulaire de recherche
     */
    private initializeSearchForm(): void {
        this.searchForm = this.fb.group({
            search: [''],
            isActive: [null],
            isEmailVerified: [null],
            roleIds: [[]],
            createdFrom: [null],
            createdTo: [null]
        });
    }

    /**
     * Configure les actions en lot
     */
    private setupBulkActions(): void {
        this.bulkActions = BULK_ACTIONS
            .filter(action => {
                // Filtrer selon les permissions
                switch (action.value) {
                    case 'delete':
                        return this.canDelete;
                    case 'assign_roles':
                        return this.canManageRoles;
                    default:
                        return this.canEdit;
                }
            })
            .map(action => ({
                label: action.label,
                icon: action.icon,
                command: () => this.executeBulkAction(action.value as any)
            }));
    }

    /**
     * Configure les options d'export
     */
    private setupExportOptions(): void {
        this.exportOptions = EXPORT_FORMATS.map(format => ({
            label: format.label,
            icon: format.icon,
            command: () => this.exportUsers(format.value as any)
        }));
    }

    /**
     * Configure l'abonnement à la recherche
     */
    private setupSearchSubscription(): void {
        this.searchForm.valueChanges
            .pipe(
                takeUntil(this.destroy$),
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(formValue => {
                this.currentFilter = {
                    ...formValue,
                    roleIds: formValue.roleIds?.length > 0 ? formValue.roleIds : undefined
                };
                this.loadUsers(true);
            });
    }

    /**
     * S'abonne aux changements de sélection
     */
    private subscribeToUserSelection(): void {
        this.userService.selectedUsers$
            .pipe(takeUntil(this.destroy$))
            .subscribe(users => {
                this.selectedUsers = users;
                this.showBulkActions = users.length > 0;
            });
    }

    /**
     * Charge les utilisateurs
     */
    loadUsers(resetPagination = false): void {
        if (resetPagination) {
            this.first = 0;
        }

        this.loading = true;

        const page = Math.floor(this.first / this.rows);
        const sortBy = 'id'; // Peut être dynamique
        const sortDir = 'desc';

        this.userService.searchUsers(this.currentFilter, page, this.rows, sortBy, sortDir)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: UserPageResponse) => {
                    this.users = response.users;
                    this.totalRecords = response.totalElements;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des utilisateurs:', error);
                    this.loading = false;
                }
            });
    }

    /**
     * Gère le chargement lazy de la table
     */
    onLazyLoad(event: TableLazyLoadEvent): void {
        this.first = event.first;
        this.rows = event.rows;
        this.loadUsers();
    }

    /**
     * Gère le filtrage global
     */
    onGlobalFilter(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.globalFilterValue = target.value;
        this.currentFilter.search = target.value || undefined;
        this.loadUsers(true);
    }

    /**
     * Efface les filtres
     */
    clearFilters(): void {
        this.searchForm.reset();
        this.globalFilterValue = '';
        this.currentFilter = {};
        this.loadUsers(true);
    }

    /**
     * Bascule l'affichage des filtres avancés
     */
    toggleAdvancedFilters(): void {
        this.showAdvancedFilters = !this.showAdvancedFilters;
    }

    /**
     * Sélectionne un utilisateur
     */
    onUserSelect(user: User): void {
        this.userSelected.emit(user);
    }

    /**
     * Gère la sélection multiple
     */
    onSelectionChange(users: User[]): void {
        this.userService.updateSelectedUsers(users);
    }

    /**
     * Ouvre le menu contextuel
     */
    onContextMenu(event: any, user: User): void {
        this.selectedContextUser = user;
        this.contextMenuItems = this.buildContextMenu(user);
        // Le menu contextuel sera géré par PrimeNG
    }

    /**
     * Construit le menu contextuel
     */
    private buildContextMenu(user: User): MenuItem[] {
        const items: MenuItem[] = [];

        // Voir les détails
        items.push({
            label: 'Voir les détails',
            icon: 'pi pi-eye',
            command: () => this.onUserSelect(user)
        });

        if (this.canEdit) {
            items.push({ separator: true });

            // Modifier
            items.push({
                label: 'Modifier',
                icon: 'pi pi-pencil',
                command: () => this.userEdit.emit(user)
            });

            // Activer/Désactiver
            if (user.isActive) {
                items.push({
                    label: 'Désactiver',
                    icon: 'pi pi-times-circle',
                    command: () => this.deactivateUser(user)
                });
            } else {
                items.push({
                    label: 'Activer',
                    icon: 'pi pi-check-circle',
                    command: () => this.activateUser(user)
                });
            }

            // Déverrouiller si nécessaire
            if (user.accountLockedUntil) {
                items.push({
                    label: 'Déverrouiller',
                    icon: 'pi pi-unlock',
                    command: () => this.unlockUser(user)
                });
            }
        }

        if (this.canDelete && this.canDeleteSpecificUser(user)) {
            items.push({ separator: true });
            items.push({
                label: 'Supprimer',
                icon: 'pi pi-trash',
                styleClass: 'p-menuitem-danger',
                command: () => this.confirmDeleteUser(user)
            });
        }

        return items;
    }

    /**
     * Vérifie si un utilisateur spécifique peut être supprimé
     */
    protected canDeleteSpecificUser(user: User): boolean {
        // Ne peut pas se supprimer soi-même
        const currentUser = this.authService.currentUser();
        if (currentUser && currentUser.id === user.id) {
            return false;
        }

        // Seul un super admin peut supprimer un admin
        const isTargetAdmin = user.roles.some(role =>
            role.name === 'ROLE_ADMIN' || role.name === 'ROLE_SUPER_ADMIN'
        );

        if (isTargetAdmin && !this.isSuperAdmin) {
            return false;
        }

        return true;
    }

    /**
     * Active un utilisateur
     */
    activateUser(user: User): void {
        this.userService.activateUser(user.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadUsers();
                }
            });
    }

    /**
     * Désactive un utilisateur
     */
    deactivateUser(user: User): void {
        this.confirmationService.confirm({
            message: CONFIRMATION_MESSAGES.DEACTIVATE_USER,
            header: 'Confirmer la désactivation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userService.deactivateUser(user.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadUsers();
                        }
                    });
            }
        });
    }

    /**
     * Déverrouille un utilisateur
     */
    unlockUser(user: User): void {
        this.confirmationService.confirm({
            message: CONFIRMATION_MESSAGES.UNLOCK_USER,
            header: 'Confirmer le déverrouillage',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userService.unlockUser(user.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadUsers();
                        }
                    });
            }
        });
    }

    /**
     * Confirme la suppression d'un utilisateur
     */
    confirmDeleteUser(user: User): void {
        this.confirmationService.confirm({
            message: CONFIRMATION_MESSAGES.DELETE_USER,
            header: 'Confirmer la suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteUser(user);
            }
        });
    }

    /**
     * Supprime un utilisateur
     */
    private deleteUser(user: User): void {
        this.userService.deleteUser(user.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.userDeleted.emit(user.id);
                    this.loadUsers();
                }
            });
    }

    /**
     * Exécute une action en lot
     */
    executeBulkAction(action: string): void {
        if (this.selectedUsers.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner au moins un utilisateur'
            });
            return;
        }

        const userIds = this.selectedUsers.map(user => user.id);
        const bulkAction: BulkUserAction = {
            userIds,
            action: action as any
        };

        const confirmMessage = CONFIRMATION_MESSAGES.BULK_ACTION(action, userIds.length);

        this.confirmationService.confirm({
            message: confirmMessage,
            header: 'Confirmer l\'action',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: action === 'delete' ? 'p-button-danger' : '',
            accept: () => {
                this.userService.executeBulkAction(bulkAction)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.userService.clearSelection();
                            this.loadUsers();
                        }
                    });
            }
        });
    }

    /**
     * Exporte les utilisateurs
     */
    exportUsers(format: string): void {
        const exportRequest: UserExportRequest = {
            format: format as any,
            filter: this.currentFilter,
            includeRoles: true,
            includeStats: this.isAdmin
        };

        this.userService.exportUsers(exportRequest)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const filename = this.userService.generateExportFilename(format);
                    this.userService.downloadExportFile(blob, filename);
                }
            });
    }

    /**
     * Actualise la liste
     */
    refresh(): void {
        this.loadUsers();
    }

    /**
     * Calcule le pourcentage
     */
    getPercentage(value: number, total: number): number {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    }

    /**
     * Formate la date de dernière connexion
     */
    formatLastLogin(lastLogin: string | null): string {
        if (!lastLogin) return 'Jamais connecté';

        const date = new Date(lastLogin);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return 'Aujourd\'hui';
        } else if (diffInDays === 1) {
            return 'Hier';
        } else if (diffInDays < 7) {
            return `Il y a ${diffInDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    /**
     * Obtient la sévérité du statut utilisateur
     */
    getUserStatusSeverity(user: User): string {
        if (!user.isActive) return 'secondary';
        if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) return 'danger';
        if (!user.isEmailVerified) return 'warning';
        return 'success';
    }

    /**
     * Obtient le libellé du statut utilisateur
     */
    getUserStatusLabel(user: User): string {
        if (!user.isActive) return 'Inactif';
        if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) return 'Verrouillé';
        if (!user.isEmailVerified) return 'Non vérifié';
        return 'Actif';
    }

    /**
     * Obtient l'icône du statut utilisateur
     */
    getUserStatusIcon(user: User): string {
        if (!user.isActive) return 'pi pi-times-circle';
        if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) return 'pi pi-lock';
        if (!user.isEmailVerified) return 'pi pi-exclamation-triangle';
        return 'pi pi-check-circle';
    }

    /**
     * Formate les rôles pour l'affichage
     */
    formatUserRoles(user: User): string {
        if (!user.roles || user.roles.length === 0) return 'Aucun rôle';

        return user.roles
            .map(role => role.name.replace('ROLE_', ''))
            .join(', ');
    }

    /**
     * Obtient la couleur des rôles
     */
    getRolesSeverity(user: User): string {
        if (!user.roles || user.roles.length === 0) return 'secondary';

        const hasAdminRole = user.roles.some(role =>
            role.name === 'ROLE_SUPER_ADMIN' || role.name === 'ROLE_ADMIN'
        );

        if (hasAdminRole) return 'danger';

        const hasManagerRole = user.roles.some(role => role.name === 'ROLE_MANAGER');
        if (hasManagerRole) return 'warning';

        return 'info';
    }

    /**
     * Génère les initiales pour l'avatar
     */
    getUserInitials(user: User): string {
        const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
        const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
        return firstInitial + lastInitial || user.username.charAt(0).toUpperCase();
    }

    /**
     * Vérifie si l'utilisateur est récent (créé dans les 7 derniers jours)
     */
    isRecentUser(user: User): boolean {
        const createdDate = new Date(user.createdAt);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffInDays <= 7;
    }

    /**
     * Gère le tri de la table
     */
    onSort(event: any): void {
        // Cette méthode sera appelée lors du tri de la table
        this.loadUsers();
    }

    /**
     * Gère la sélection de tous les utilisateurs
     */
    onSelectAll(event: any): void {
        if (event.checked) {
            this.selectedUsers = [...this.users];
        } else {
            this.selectedUsers = [];
        }
        this.userService.updateSelectedUsers(this.selectedUsers);
    }
}
