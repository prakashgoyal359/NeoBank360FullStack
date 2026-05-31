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

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private apiUrl = 'http://localhost:8080/api/insights';

  constructor(private http: HttpClient) {}

  getInsights(userId: number): Observable<FinancialInsights> {
    return this.http.get<FinancialInsights>(`${this.apiUrl}/${userId}`);
  }
}
