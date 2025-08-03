import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
    inject,
    OnInit,
    OnDestroy
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../services/role.service';
import { Permission } from '../enums/permissions.enum';
import {UserRole} from "../enums/roles.enum";


@Directive({
    selector: '[hasPermission]',
    standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
    private readonly templateRef = inject(TemplateRef<any>);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly roleService = inject(RoleService);
    private readonly destroy$ = new Subject<void>();

    private permissions: Permission[] = [];
    private roles: UserRole[] = [];
    // private requireAll: boolean = false;
    private currentlyVisible: boolean = false;

    @Input() set hasPermission(permissions: Permission | Permission[]) {
        this.permissions = Array.isArray(permissions) ? permissions : [permissions];
        this.updateView();
    }

    @Input() set hasRole(roles: UserRole | UserRole[]) {
        this.roles = Array.isArray(roles) ? roles : [roles];
        this.updateView();
    }

    @Input() set requireAll(value: boolean) {
        this.requireAll = value;
        this.updateView();
    }

    ngOnInit() {
        // Écouter les changements d'authentification
        this.roleService.userPermissions()
        // Réagir aux changements de permissions
        // Note: Dans un vrai projet, vous pourriez vouloir un observable pour détecter les changements
        this.updateView();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private updateView(): void {
        const hasAccess = this.checkAccess();

        if (hasAccess && !this.currentlyVisible) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.currentlyVisible = true;
        } else if (!hasAccess && this.currentlyVisible) {
            this.viewContainer.clear();
            this.currentlyVisible = false;
        }
    }

    private checkAccess(): boolean {
        // Vérifier les rôles si spécifiés
        if (this.roles.length > 0) {
            const roleAccess = this.requireAll
                ? this.roleService.hasAllRoles(this.roles)
                : this.roleService.hasAnyRole(this.roles);

            if (!roleAccess) return false;
        }

        // Vérifier les permissions si spécifiées
        if (this.permissions.length > 0) {
            const permissionAccess = this.requireAll
                ? this.roleService.hasAllPermissions(this.permissions)
                : this.roleService.hasAnyPermission(this.permissions);

            return permissionAccess;
        }

        // Si seuls les rôles sont spécifiés
        return this.roles.length > 0;
    }
}
