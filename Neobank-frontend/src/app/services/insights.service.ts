import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrendEntry {
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
}

export interface FinancialInsights {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  trendSummary: TrendEntry[];
}

export interface AnalyticsPoint {
  label: string;
  value: number;
  secondaryValue: number;
}

export interface UserAdvancedAnalytics {
  currentNetWorth: number;
  accountBalance: number;
  outstandingLoans: number;
  rewardBalance: number;
  spendingBreakdown: AnalyticsPoint[];
  budgetVsActual: AnalyticsPoint[];
  netWorthProgression: AnalyticsPoint[];
  rewardGrowth: AnalyticsPoint[];
  loanPayoffForecast: AnalyticsPoint[];
}

export interface SpendingAnalytics {
  categorySpending: AnalyticsPoint[];
}

export interface WealthAnalytics {
  accountBalance: number;
  outstandingLoanPrincipal: number;
  netWorth: number;
  netWorthProgression: AnalyticsPoint[];
  rewardGrowth: AnalyticsPoint[];
}

export interface LoanPayoffForecast {
  monthsRemaining: number;
  projectedPayoffDate: string;
  forecast: AnalyticsPoint[];
}

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private apiUrl = 'http://localhost:8080/api/insights';

  constructor(private http: HttpClient) {}

  getInsights(userId: number): Observable<FinancialInsights> {
    return this.http.get<FinancialInsights>(`${this.apiUrl}/${userId}`);
  }

  getAdvancedInsights(userId: number): Observable<UserAdvancedAnalytics> {
    return this.http.get<UserAdvancedAnalytics>(`${this.apiUrl}/${userId}/advanced`);
  }

  getSpendingAnalytics(userId: number): Observable<SpendingAnalytics> {
    return this.http.get<SpendingAnalytics>(`http://localhost:8080/api/analytics/spending/${userId}`);
  }

  getWealthAnalytics(userId: number): Observable<WealthAnalytics> {
    return this.http.get<WealthAnalytics>(`http://localhost:8080/api/analytics/wealth/${userId}`);
  }

  getLoanPayoffForecast(userId: number): Observable<LoanPayoffForecast> {
    return this.http.get<LoanPayoffForecast>(`http://localhost:8080/api/analytics/loan-payoff/${userId}`);
  }
}
