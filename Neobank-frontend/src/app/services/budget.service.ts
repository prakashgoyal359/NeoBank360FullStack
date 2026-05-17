import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Budget {
  id?: number;
  category: string;
  limitAmount: number;
  spent?: number;
  remaining?: number;
  utilizationPercentage?: number;
  budgetMonth: string;
}

export interface BudgetAnalytics {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationPercentage: number;
  budgetMonth: string;
  budgets: Budget[];
}

export interface BudgetRequest {
  category: string;
  limitAmount: number;
  budgetMonth: string;
}

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private apiUrl = 'http://localhost:8080/api/budgets';

  constructor(private http: HttpClient) {}

  createBudget(request: BudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, request);
  }

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  getBudgetAnalytics(month: string): Observable<BudgetAnalytics> {
    return this.http.get<BudgetAnalytics>(`${this.apiUrl}/analytics?month=${month}`);
  }

  getBudget(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}