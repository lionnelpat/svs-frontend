// components/payment-method-list/payment-method-list.component.ts

import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';

// Interfaces & Services
import {
    PaymentMethod,
    PaymentMethodEvent,
    PaymentMethodFilter,
} from '../../interfaces/payment-method.interface';
import { PaymentMethodService } from '../../service/payment-method.service';
import {Tooltip} from "primeng/tooltip";
import {
    PAYMENT_METHOD_CONSTANTS,
    PAYMENT_METHOD_SORT_OPTIONS,
    PAYMENT_METHOD_STATUS_OPTIONS
} from "../../constants/constants";
import {LoggerService} from "../../../../core/services/logger.service";

@Component({
    selector: 'app-payment-method-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        SkeletonModule,
        MessageModule,
        Tooltip
    ],
    templateUrl: './payment-method-list.component.html',
    styleUrl: './payment-method-list.component.scss'
})
export class PaymentMethodListComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly searchSubject = new Subject<string>();

    @Output() paymentMethodEvent = new EventEmitter<PaymentMethodEvent>();

    // État des données
    paymentMethods: PaymentMethod[] = [];
    totalRecords = 0;
    loading = false;
    errorMessage = '';

    // Filtres et recherche
    searchQuery = '';
    selectedStatus: boolean | undefined;
    filter: PaymentMethodFilter = {
        page: 0,
        size: PAYMENT_METHOD_CONSTANTS.DEFAULT_PAGE_SIZE,
        sort: 'nom',
        direction: 'asc'
    };

    // Options pour les dropdowns
    statusOptions = PAYMENT_METHOD_STATUS_OPTIONS;
    sortOptions = PAYMENT_METHOD_SORT_OPTIONS;

    constructor(
        private readonly paymentMethodService: PaymentMethodService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.setupSearchDebounce();
        this.loadPaymentMethods();
        this.logger.info('PaymentMethodListComponent initialisé');
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Configure le debounce pour la recherche
     */
    private setupSearchDebounce(): void {
        this.searchSubject
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe(query => {
                this.filter.query = query || undefined;
                this.filter.page = 0;
                this.loadPaymentMethods();
            });
    }

    /**
     * Charge les méthodes de paiement
     */
    private loadPaymentMethods(): void {
        this.loading = true;
        this.errorMessage = '';

        this.paymentMethodService.getPaymentMethods(this.filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.paymentMethods = response.data.paymentMethods;
                    this.totalRecords = response.data.totalElements;
                    this.loading = false;
                    this.logger.debug('Méthodes de paiement chargées:', response.data);
                },
                error: (error) => {
                    this.loading = false;
                    this.errorMessage = 'Erreur lors du chargement des méthodes de paiement';
                    this.logger.error('Erreur chargement:', error);
                }
            });
    }

    /**
     * Gère le changement de recherche
     */
    onSearchChange(event: any): void {
        const query = event.target.value;
        this.searchSubject.next(query);
    }

    /**
     * Gère le changement de statut
     */
    onStatusChange(): void {
        this.filter.active = this.selectedStatus;
        this.filter.page = 0;
        this.loadPaymentMethods();
    }

    /**
     * Gère le lazy loading de la table
     */
    onLazyLoad(event: any): void {
        this.filter.page = Math.floor(event.first / event.rows);
        this.filter.size = event.rows;

        if (event.sortField) {
            this.filter.sort = event.sortField;
            this.filter.direction = event.sortOrder === 1 ? 'asc' : 'desc';
        }

        this.loadPaymentMethods();
    }

    /**
     * Calcule le numéro de ligne
     */
    getRowNumber(rowIndex: number): number {
        return (this.filter.page ?? 0) * (this.filter.size ?? 10) + rowIndex + 1;
    }

    /**
     * Édite une méthode de paiement
     */
    editPaymentMethod(paymentMethod: PaymentMethod): void {
        this.paymentMethodEvent.emit({
            type: 'edit',
            paymentMethod
        });
    }

    /**
     * Supprime une méthode de paiement
     */
    deletePaymentMethod(paymentMethod: PaymentMethod): void {
        this.paymentMethodEvent.emit({
            type: 'delete',
            paymentMethod
        });
    }

    /**
     * Message d'état vide
     */
    get emptyMessage(): string {
        if (this.filter.query || this.filter.active !== undefined) {
            return 'Aucune méthode de paiement ne correspond aux critères de recherche';
        }
        return PAYMENT_METHOD_CONSTANTS.TABLE.EMPTY_MESSAGE;
    }
}
