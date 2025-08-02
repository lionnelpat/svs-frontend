// dashboard.service.ts - Service mis à jour pour contacter le backend

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import {environment} from "../../../environments/environment";
import {LoggerService} from "../../core/services/logger.service";
import {ErrorHandlerService} from "../../core/services/error-handler.service";

// Interfaces pour les données du dashboard
export interface DashboardStats {
    totalFactures: number;
    montantTotalFactures: number;
    totalDepenses: number;
    montantTotalDepenses: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    fill: boolean;
    tension: number;
}

export interface PieChartData {
    labels: string[];
    datasets: PieChartDataset[];
}

export interface PieChartDataset {
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
}

export interface EvolutionMensuelleItem {
    mois: string;
    factures: number;
    depenses: number;
    montantFactures?: number;
    montantDepenses?: number;
}

export interface RepartitionItem {
    nom: string;
    montant: number;
    nombre?: number;
}

export interface DashboardFilter {
    annee?: number;
    mois?: number;
    compagnieId?: number;
    nombreMois?: number;
    limite?: number;
}

// Interface pour la réponse API standard
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly baseUrl = `${environment.apiBaseUrl}/dashboard`;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: LoggerService,
        private readonly errorHandler: ErrorHandlerService
    ) {}

    /**
     * Récupère les statistiques générales du dashboard
     */
    getDashboardStats(filter: DashboardFilter = {}): Observable<DashboardStats> {
        let params = new HttpParams();

        if (filter.annee !== undefined) {
            params = params.set('annee', filter.annee.toString());
        }
        if (filter.mois !== undefined) {
            params = params.set('mois', filter.mois.toString());
        }
        if (filter.compagnieId !== undefined) {
            params = params.set('compagnieId', filter.compagnieId.toString());
        }

        return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/stats`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération des statistiques du dashboard'))
            );
    }

    /**
     * Récupère l'évolution mensuelle des factures et dépenses
     */
    getEvolutionMensuelle(filter: DashboardFilter = {}): Observable<EvolutionMensuelleItem[]> {
        let params = new HttpParams();

        if (filter.nombreMois !== undefined) {
            params = params.set('nombreMois', filter.nombreMois.toString());
        }

        return this.http.get<ApiResponse<EvolutionMensuelleItem[]>>(`${this.baseUrl}/evolution-mensuelle`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération de l\'évolution mensuelle'))
            );
    }

    /**
     * Récupère les données de graphique pour l'évolution mensuelle
     */
    getEvolutionChart(filter: DashboardFilter = {}): Observable<ChartData> {
        let params = new HttpParams();

        if (filter.nombreMois !== undefined) {
            params = params.set('nombreMois', filter.nombreMois.toString());
        }

        return this.http.get<ApiResponse<ChartData>>(`${this.baseUrl}/evolution-chart`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération du graphique d\'évolution'))
            );
    }

    getEvolutionChiffreAffaireChart(filter: DashboardFilter = {}): Observable<ChartData> {
        let params = new HttpParams();

        if (filter.nombreMois !== undefined) {
            params = params.set('nombreMois', filter.nombreMois.toString());
        }

        return this.http.get<ApiResponse<ChartData>>(`${this.baseUrl}/evolution-ca-chart`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération du graphique d\'évolution'))
            );
    }

    /**
     * Récupère la répartition par société
     */
    getRepartitionSocietes(filter: DashboardFilter = {}): Observable<RepartitionItem[]> {
        let params = new HttpParams();

        if (filter.annee !== undefined) {
            params = params.set('annee', filter.annee.toString());
        }
        if (filter.limite !== undefined) {
            params = params.set('limite', filter.limite.toString());
        }

        return this.http.get<ApiResponse<RepartitionItem[]>>(`${this.baseUrl}/repartition-societes`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération de la répartition par société'))
            );
    }

    /**
     * Récupère les données de graphique pour la répartition par société
     */
    getRepartitionSocietesChart(filter: DashboardFilter = {}): Observable<PieChartData> {
        let params = new HttpParams();

        if (filter.annee !== undefined) {
            params = params.set('annee', filter.annee.toString());
        }
        if (filter.limite !== undefined) {
            params = params.set('limite', filter.limite.toString());
        }

        return this.http.get<ApiResponse<PieChartData>>(`${this.baseUrl}/repartition-societes-chart`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération du graphique de répartition par société'))
            );
    }

    /**
     * Récupère la répartition par prestations
     */
    getRepartitionPrestations(filter: DashboardFilter = {}): Observable<RepartitionItem[]> {
        let params = new HttpParams();

        if (filter.annee !== undefined) {
            params = params.set('annee', filter.annee.toString());
        }
        if (filter.limite !== undefined) {
            params = params.set('limite', filter.limite.toString());
        }

        return this.http.get<ApiResponse<RepartitionItem[]>>(`${this.baseUrl}/repartition-prestations`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération de la répartition par prestations'))
            );
    }

    /**
     * Récupère les données de graphique pour la répartition par prestations
     */
    getRepartitionPrestationsChart(filter: DashboardFilter = {}): Observable<PieChartData> {
        let params = new HttpParams();

        if (filter.annee !== undefined) {
            params = params.set('annee', filter.annee.toString());
        }
        if (filter.limite !== undefined) {
            params = params.set('limite', filter.limite.toString());
        }

        return this.http.get<ApiResponse<PieChartData>>(`${this.baseUrl}/repartition-prestations-chart`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération du graphique de répartition par prestations'))
            );
    }

    /**
     * Récupère la répartition des dépenses
     */
    getRepartitionDepenses(filter: DashboardFilter = {}): Observable<RepartitionItem[]> {
        let params = new HttpParams();

        if (filter.annee !== undefined) {
            params = params.set('annee', filter.annee.toString());
        }
        if (filter.limite !== undefined) {
            params = params.set('limite', filter.limite.toString());
        }

        return this.http.get<ApiResponse<RepartitionItem[]>>(`${this.baseUrl}/repartition-depenses`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération de la répartition des dépenses'))
            );
    }

    /**
     * Récupère les données de graphique pour la répartition des dépenses
     */
    getRepartitionDepensesChart(filter: DashboardFilter = {}): Observable<PieChartData> {
        let params = new HttpParams();

        if (filter.annee !== undefined) {
            params = params.set('annee', filter.annee.toString());
        }
        if (filter.limite !== undefined) {
            params = params.set('limite', filter.limite.toString());
        }

        return this.http.get<ApiResponse<PieChartData>>(`${this.baseUrl}/repartition-depenses-chart`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération du graphique de répartition des dépenses'))
            );
    }

    /**
     * Récupère toutes les données du dashboard en une seule requête
     * Endpoint optimisé pour charger toutes les données d'un coup
     */
    getDashboardComplete(filter: DashboardFilter = {}): Observable<DashboardCompleteData> {
        // Mise à jour des valeurs par défaut
        const filterWithDefaults = {
            nombreMois: 12,
            limite: 6,
            ...filter
        };

        return this.http.post<ApiResponse<DashboardCompleteData>>(`${this.baseUrl}/complete`, filterWithDefaults)
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération complète des données du dashboard'))
            );
    }

    /**
     * Version alternative: récupération directe depuis le backend
     * (si votre backend a un endpoint spécialisé pour les montants)
     */
    getEvolutionMontantsChart(filter: DashboardFilter = {}): Observable<ChartData> {
        let params = new HttpParams();

        if (filter.nombreMois !== undefined) {
            params = params.set('nombreMois', filter.nombreMois.toString());
        }
        if (filter.annee !== undefined) {
            params = params.set('annee', filter.annee.toString());
        }

        return this.http.get<ApiResponse<ChartData>>(`${this.baseUrl}/evolution-montants-chart`, { params })
            .pipe(
                map(response => response.data),
                catchError(err => this.handleError(err, 'Récupération du graphique d\'évolution des montants'))
            );
    }

    /**
     * Méthode utilitaire pour formater les montants en FCFA
     */
    formatCurrency(amount: number): string {
        if (amount === null || amount === undefined) {
            return '0 FCFA';
        }

        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('XOF', 'FCFA');
    }

    /**
     * Méthode utilitaire pour formater les nombres
     */
    formatNumber(num: number): string {
        if (num === null || num === undefined) {
            return '0';
        }

        return new Intl.NumberFormat('fr-FR').format(num);
    }

    /**
     * Gestion centralisée des erreurs
     */
    private handleError(error: any, context: string): Observable<never> {
        const message = error?.error?.message || error.message || 'Erreur inconnue';
        this.logger.error(`${context} - ${message}`, error);
        this.errorHandler.handleError(error);
        return throwError(() => new Error(message));
    }
}

// Interface pour la réponse complète du dashboard
export interface DashboardCompleteData {
    stats: DashboardStats;
    evolutionMensuelle: EvolutionMensuelleItem[];
    evolutionMontantsChart: ChartData;
    evolutionChart: ChartData;
    repartitionSocietes: RepartitionItem[];
    repartitionSocietesChart: PieChartData;
    repartitionPrestations: RepartitionItem[];
    repartitionPrestationsChart: PieChartData;
    repartitionDepenses: RepartitionItem[];
    repartitionDepensesChart: PieChartData;
    kpis?: any; // KPIs additionnels si nécessaires
}
