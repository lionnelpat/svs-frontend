import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
    inject,
    OnInit
} from '@angular/core';
import { RoleService } from '../services/role.service';
import { UserRole } from '../enums/roles.enum';

@Directive({
    selector: '[hasRole]',
    standalone: true
})
export class HasRoleDirective implements OnInit {
    private readonly templateRef = inject(TemplateRef<any>);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly roleService = inject(RoleService);

    private roles: UserRole[] = [];
    // private requireAll: boolean = false;
    private currentlyVisible: boolean = false;

    @Input() set hasRole(roles: UserRole | UserRole[]) {
        this.roles = Array.isArray(roles) ? roles : [roles];
        this.updateView();
    }

    @Input() set requireAll(value: boolean) {
        this.requireAll = value;
        this.updateView();
    }

    ngOnInit() {
        this.updateView();
    }

    private updateView(): void {
        const hasAccess = this.requireAll
            ? this.roleService.hasAllRoles(this.roles)
            : this.roleService.hasAnyRole(this.roles);

        if (hasAccess && !this.currentlyVisible) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.currentlyVisible = true;
        } else if (!hasAccess && this.currentlyVisible) {
            this.viewContainer.clear();
            this.currentlyVisible = false;
        }
    }
}
