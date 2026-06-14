import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardStats {
  totalUsers: number;
  totalActiveUsers: number;
  totalLoans: number;
  pendingApprovals: number;
  totalTransactions: number;
  platformSavingsRate: number;
}

export interface AnalyticsPoint {
  label: string;
  value: number;
  secondaryValue: number;
}

export interface TrendEntry {
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
}

export interface AdminAdvancedAnalytics {
  period: '7D' | '30D' | 'YTD';
  transactionVolume: number;
  transactionAmount: number;
  creditAmount: number;
  debitAmount: number;
  totalDisbursed: number;
  outstandingPrincipal: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  auditEvents: number;
  transactionTrend: TrendEntry[];
  transactionCategoryBreakdown: AnalyticsPoint[];
  loanStatusDistribution: AnalyticsPoint[];
}

export interface TransactionAnalytics {
  period: string;
  dailyVolumes: TrendEntry[];
  averageTicketSize: number;
  totalInflow: number;
  totalOutflow: number;
  totalTransactions: number;
}

export interface LoanAnalytics {
  pending: number;
  approved: number;
  rejected: number;
  npaRatio: number;
  loanDistribution: AnalyticsPoint[];
}

export interface SystemAuditLog {
  id: number;
  endpoint: string;
  httpMethod: string;
  responseStatus: number;
  executionTimeMs: number;
  actingUserId?: number;
  actingUsername?: string;
  eventType: string;
  eventTimestamp: string;
  errorMessage?: string;
}

export interface PendingApproval {
  id: number;
  module: string;
  applicantName: string;
  productName: string;
  requestedAmount: number;
  applicationDate: string;
  status: string;
}

export interface SystemHealth {
  databaseStatus: string;
  activeSessionCount: number;
  serverUptime: string;
  applicationHealth: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt?: string;
}

export interface UserActivity {
  transactionId: number;
  accountNumber: string;
  transactionType: string;
  amount: number;
  category: string;
  description: string;
  transactionDate: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getAdvancedAnalytics(period: '7D' | '30D' | 'YTD' = '30D'): Observable<AdminAdvancedAnalytics> {
    const params = new HttpParams().set('period', period);
    return this.http.get<AdminAdvancedAnalytics>(`${this.apiUrl}/analytics/advanced`, { params });
  }

  getTransactionAnalytics(period: '7D' | '30D' | 'YTD' = '30D'): Observable<TransactionAnalytics> {
    const params = new HttpParams().set('period', period);
    return this.http.get<TransactionAnalytics>(`${this.apiUrl}/analytics/transactions`, { params });
  }

  getLoanAnalytics(): Observable<LoanAnalytics> {
    return this.http.get<LoanAnalytics>(`${this.apiUrl}/analytics/loans`);
  }

  getPendingApprovals(module = ''): Observable<PendingApproval[]> {
    const params = module ? new HttpParams().set('module', module) : undefined;
    return this.http.get<PendingApproval[]>(`${this.apiUrl}/pending-approvals`, { params });
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.apiUrl}/system-health`);
  }

  getUsers(page = 0, size = 10, search = ''): Observable<PageResponse<AdminUser>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<PageResponse<AdminUser>>(`${this.apiUrl}/users`, { params });
  }

  setUserStatus(userId: number, active: boolean): Observable<AdminUser> {
    const params = new HttpParams().set('active', active);
    return this.http.patch<AdminUser>(`${this.apiUrl}/users/${userId}/status`, null, { params });
  }

  getUserActivity(userId: number, page = 0, size = 10): Observable<PageResponse<UserActivity>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<UserActivity>>(`${this.apiUrl}/users/${userId}/activity`, { params });
  }

  getSystemLogs(filters: {
    search?: string;
    endpoint?: string;
    username?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }): Observable<PageResponse<SystemAuditLog>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters.endpoint?.trim()) params = params.set('endpoint', filters.endpoint.trim());
    if (filters.username?.trim()) params = params.set('username', filters.username.trim());
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<PageResponse<SystemAuditLog>>(`${this.apiUrl}/system-logs`, { params });
  }
}
