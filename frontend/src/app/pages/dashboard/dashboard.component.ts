// dashboard.component.ts - Composant mis à jour pour utiliser le nouveau service

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';
import {
    ChartData,
    DashboardCompleteData,
    DashboardFilter,
    DashboardService,
    DashboardStats,
    PieChartData
} from "../service/dashboard.service";
import {LoggerService} from "../../core/services/logger.service";
import {MessageService, PrimeTemplate} from "primeng/api";
import {Button} from "primeng/button";
import {NgForOf, NgIf} from "@angular/common";
import {Skeleton} from "primeng/skeleton";
import {UIChart} from "primeng/chart";
import {Card} from "primeng/card";
import {ProgressSpinner} from "primeng/progressspinner";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {Message} from "primeng/message";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    imports: [
        Button,
        NgIf,
        Skeleton,
        UIChart,
        Card,
        PrimeTemplate,
        ProgressSpinner,
        NgForOf,
        DropdownModule,
        FormsModule,
        Message
    ],
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    // État du composant
    loading = false;
    error: string | undefined;

    // Filtres
    currentFilter: DashboardFilter = {
        nombreMois: 12,
        limite: 6
    };

    // Données du dashboard
    stats: DashboardStats | null = null;
    evolutionChart: ChartData | null = null;
    repartitionSocietesChart: PieChartData | null = null;
    repartitionPrestationsChart: PieChartData | null = null;
    repartitionDepensesChart: PieChartData | null = null;
    evolutionMontantsChart: ChartData | null = null;


    // Options pour les filtres
    yearOptions: { label: string, value: number | null }[] = [];

    // Options des graphiques
    lineChartOptions: any;
    monetaryChartOptions: any;
    pieChartOptions: any;

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly logger: LoggerService,
        private readonly messageService: MessageService
    ) {
        this.initializeYearOptions();
        this.initializeChartOptions();
    }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Initialise les options d'années pour le filtre
     */
    private initializeYearOptions(): void {
        const currentYear = new Date().getFullYear();
        this.yearOptions = [
            { label: 'Toutes les années', value: null },
            ...Array.from({ length: 5 }, (_, i) => ({
                label: (currentYear - i).toString(),
                value: currentYear - i
            }))
        ];
    }

    /**
     * Initialise les options des graphiques
     */
    private initializeChartOptions(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dee2e6';

        // Options pour les graphiques linéaires/barres (nombre)
        this.lineChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        font: {
                            weight: 500
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: surfaceBorder,
                    borderWidth: 1
                }
            },
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        // Options pour les graphiques monétaires
        this.monetaryChartOptions = {
            ...this.lineChartOptions,
            plugins: {
                ...this.lineChartOptions.plugins,
                tooltip: {
                    ...this.lineChartOptions.plugins.tooltip,
                    callbacks: {
                        label: (context: any) => {
                            return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                ...this.lineChartOptions.scales,
                y: {
                    ...this.lineChartOptions.scales.y,
                    ticks: {
                        ...this.lineChartOptions.scales.y.ticks,
                        callback: (value: any) => {
                            return this.formatCurrency(value);
                        }
                    }
                }
            }
        };

        // Options pour les graphiques en secteurs
        this.pieChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        font: {
                            weight: 500
                        }
                    },
                    position: 'bottom'
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: surfaceBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: (context: any) => {
                            const label = context.label || '';
                            const value = this.formatCurrency(context.parsed);
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            maintainAspectRatio: false,
            responsive: true
        };
    }

    /**
     * Charge toutes les données du dashboard
     * Utilise l'endpoint optimisé pour charger tout en une fois
     */
    loadDashboardData(): void {
        this.loading = true;
        this.error = undefined;

        this.logger.info('Chargement des données du dashboard', this.currentFilter);

        // Option 1: Chargement optimisé avec endpoint complete
        this.dashboardService.getDashboardComplete(this.currentFilter)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading = false)
            )
            .subscribe({
                next: (data: DashboardCompleteData) => {
                    this.handleDashboardData(data);
                    this.logger.info('Données du dashboard chargées avec succès');
                },
                error: (error) => {
                    this.handleError('Erreur lors du chargement des données du dashboard', error);
                    // Fallback: essayer de charger individuellement
                    this.loadDashboardDataIndividually();
                }
            });
    }

    /**
     * Charge les données individuellement (fallback)
     */
    private loadDashboardDataIndividually(): void {
        this.loading = true;

        const requests = {
            stats: this.dashboardService.getDashboardStats(this.currentFilter),
            evolutionChart: this.dashboardService.getEvolutionChart(this.currentFilter),
            evolutionMontantsChart: this.dashboardService.getEvolutionMontantsChart(this.currentFilter),
            repartitionSocietesChart: this.dashboardService.getRepartitionSocietesChart(this.currentFilter),
            repartitionPrestationsChart: this.dashboardService.getRepartitionPrestationsChart(this.currentFilter),
            repartitionDepensesChart: this.dashboardService.getRepartitionDepensesChart(this.currentFilter)
        };

        forkJoin(requests)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading = false)
            )
            .subscribe({
                next: (data) => {
                    this.stats = data.stats;
                    this.evolutionChart = data.evolutionChart;
                    this.evolutionMontantsChart = data.evolutionMontantsChart;
                    this.repartitionSocietesChart = data.repartitionSocietesChart;
                    this.repartitionPrestationsChart = data.repartitionPrestationsChart;
                    this.repartitionDepensesChart = data.repartitionDepensesChart;

                    this.logger.info('Données du dashboard chargées individuellement avec succès');
                },
                error: (error) => {
                    this.handleError('Erreur lors du chargement individuel des données', error);
                }
            });
    }

    /**
     * Traite les données reçues de l'endpoint complet
     */
    private handleDashboardData(data: DashboardCompleteData): void {
        this.stats = data.stats;
        this.evolutionChart = data.evolutionChart;
        this.evolutionMontantsChart = data.evolutionMontantsChart;
        this.repartitionSocietesChart = data.repartitionSocietesChart;
        this.repartitionPrestationsChart = data.repartitionPrestationsChart;
        this.repartitionDepensesChart = data.repartitionDepensesChart;

        if (!this.evolutionMontantsChart && data.evolutionMensuelle) {
            this.generateEvolutionMontantsChart(data.evolutionMensuelle);
        }
    }

    /**
     * Gère les erreurs
     */
    private handleError(message: string, error: any): void {
        this.error = message;
        this.logger.error(message, error);
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: message,
            life: 5000
        });
    }

    /**
     * Gère le changement de filtre d'année
     */
    onYearFilterChange(selectedYear: number ): void {
        this.currentFilter = {
            ...this.currentFilter,
            annee: selectedYear
        };
        this.loadDashboardData();
    }

    /**
     * Recharge les données
     */
    refreshDashboard(): void {
        this.loadDashboardData();
    }

    /**
     * Méthodes utilitaires pour le template
     */
    formatCurrency(amount: number): string {
        return this.dashboardService.formatCurrency(amount);
    }

    formatNumber(num: number): string {
        return this.dashboardService.formatNumber(num);
    }


    /**
     * Calcule le ratio de rentabilité
     */
    calculateRentabilityRatio(): string {
        if (!this.stats || this.stats.montantTotalFactures === 0) {
            return '0.0';
        }

        const benefice = this.stats.montantTotalFactures - this.stats.montantTotalDepenses;
        const ratio = (benefice / this.stats.montantTotalFactures) * 100;

        return ratio.toFixed(1);
    }

    /**
     * Calcule le montant moyen par facture
     */
    calculateAverageInvoiceAmount(): string {
        if (!this.stats || this.stats.totalFactures === 0) {
            return this.formatCurrency(0);
        }

        const average = this.stats.montantTotalFactures / this.stats.totalFactures;
        return this.formatCurrency(average);
    }

    /**
     * Calcule le montant moyen par dépense
     */
    calculateAverageExpenseAmount(): string {
        if (!this.stats || this.stats.totalDepenses === 0) {
            return this.formatCurrency(0);
        }

        const average = this.stats.montantTotalDepenses / this.stats.totalDepenses;
        return this.formatCurrency(average);
    }

    /**
     * Calcule le pourcentage de croissance (exemple)
     */
    calculateGrowthPercentage(current: number, previous: number): number {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    }

    /**
     * Détermine la classe CSS pour le ratio de rentabilité
     */
    getRentabilityClass(): string {
        const ratio = parseFloat(this.calculateRentabilityRatio());
        if (ratio >= 20) return 'text-green-500';
        if (ratio >= 10) return 'text-orange-500';
        return 'text-red-500';
    }

    /**
     * Génère le graphique des montants à partir des données d'évolution
     */
    private generateEvolutionMontantsChart(evolutionData: any[]): void {
        const labels = evolutionData.map(item => item.mois);

        const datasets = [
            {
                label: 'Montant Factures (FCFA)',
                data: evolutionData.map(item => item.montantFactures || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            },
            {
                label: 'Montant Dépenses (FCFA)',
                data: evolutionData.map(item => item.montantDepenses || 0),
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            }
        ];

        this.evolutionMontantsChart = {
            labels,
            datasets
        };
    }

    /**
     * Mise à jour du getter hasDashboardData
     */
    get hasDashboardData(): boolean {
        return !!(this.stats && this.evolutionChart &&
            this.evolutionMontantsChart && // NOUVEAU
            this.repartitionSocietesChart &&
            this.repartitionPrestationsChart &&
            this.repartitionDepensesChart);
    }

    /**
     * Détermine si le dashboard est en cours de chargement
     */
    get isDashboardLoading(): boolean {
        return this.loading;
    }

    /**
     * Détermine si il y a une erreur
     */
    get hasDashboardError(): boolean {
        return !!this.error;
    }

    /**
     * Met à jour les options des graphiques en cas de changement de thème
     */
    updateChartOptions(): void {
        this.initializeChartOptions();
    }

    /**
     * Exporte les données du dashboard (fonctionnalité future)
     */
    exportDashboardData(format: 'pdf' | 'excel' = 'pdf'): void {
        // À implémenter selon vos besoins
        this.messageService.add({
            severity: 'info',
            summary: 'Export',
            detail: `Export ${format.toUpperCase()} en cours de développement`,
            life: 3000
        });
    }

    /**
     * Configure l'auto-refresh (fonctionnalité future)
     */
    toggleAutoRefresh(): void {
        // À implémenter selon vos besoins
        this.messageService.add({
            severity: 'info',
            summary: 'Auto-refresh',
            detail: 'Fonctionnalité en cours de développement',
            life: 3000
        });
    }
}
