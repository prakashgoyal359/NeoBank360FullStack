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
}
