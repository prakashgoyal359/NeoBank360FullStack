import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccountOpeningRequest,
  AccountOpeningResponse,
  Account,
  Transaction,
  MoneyTransferRequest,
  MoneyTransferResponse,
  BillPaymentRequest,
  BillPaymentResponse,
  Budget,
  BudgetRequest,
  BudgetResponse,
  BudgetDTO,
  BudgetAnalytics,
  Bill,
  Reward,
  RewardHistory,
  Notification,
} from '../models/banking.model';

@Injectable({
  providedIn: 'root',
})
export class BankingService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Account Opening
  checkAadhaarExists(aadhaarNumber: string): Observable<{ exists: boolean; message: string }> {
    return this.http.get<{ exists: boolean; message: string }>(
      `${this.apiUrl}/accounts/kyc/aadhaar/${aadhaarNumber}/exists`,
    );
  }

  openAccount(
    request: AccountOpeningRequest,
    aadhaarFile: File,
    panFile: File,
    photoFile?: File,
  ): Observable<AccountOpeningResponse> {
    const formData = new FormData();

    // Append request as JSON string
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    formData.append('aadhaarFile', aadhaarFile);
    formData.append('panFile', panFile);
    if (photoFile) {
      formData.append('photoFile', photoFile);
    }

    // Don't set Content-Type header - let the browser set it to multipart/form-data
    return this.http.post<AccountOpeningResponse>(`${this.apiUrl}/accounts/open`, formData);
  }

  // Account Management
  getAccount(accountId: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/user/accounts/${accountId}`);
  }

  getUserAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/user/accounts`);
  }

  // Admin - Update Account
  updateAccount(accountId: number, accountType?: string, isActive?: boolean, balance?: number, userName?: string, email?: string): Observable<Account> {
    const params: string[] = [];
    if (accountType) params.push(`accountType=${encodeURIComponent(accountType)}`);
    if (isActive !== undefined) params.push(`isActive=${isActive}`);
    if (balance !== undefined) params.push(`balance=${balance}`);
    if (userName) params.push(`userName=${encodeURIComponent(userName)}`);
    if (email) params.push(`email=${encodeURIComponent(email)}`);
    const queryString = params.length > 0 ? '?' + params.join('&') : '';
    return this.http.put<Account>(`${this.apiUrl}/admin/accounts/${accountId}${queryString}`, null);
  }

  // Transactions
  getAccountTransactions(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/user/accounts/${accountId}/transactions`);
  }

  // Money Transfer
  transferMoney(request: MoneyTransferRequest): Observable<MoneyTransferResponse> {
    return this.http.post<MoneyTransferResponse>(`${this.apiUrl}/user/transfer`, request);
  }

  // Bill Payment (legacy)
  payBill(request: BillPaymentRequest): Observable<BillPaymentResponse> {
    return this.http.post<BillPaymentResponse>(`${this.apiUrl}/user/bills/pay`, request);
  }

  // Budget Management
  createBudget(request: { category: string; limitAmount: number; budgetMonth: string }): Observable<BudgetDTO> {
    return this.http.post<BudgetDTO>(`${this.apiUrl}/budgets`, request);
  }

  getUserBudgets(): Observable<BudgetDTO[]> {
    return this.http.get<BudgetDTO[]>(`${this.apiUrl}/budgets`);
  }

  getBudgetAnalytics(month: string): Observable<BudgetAnalytics> {
    return this.http.get<BudgetAnalytics>(`${this.apiUrl}/budgets/analytics?month=${month}`);
  }

  updateBudget(budgetId: number, request: { category: string; limitAmount: number; budgetMonth: string }): Observable<BudgetDTO> {
    return this.http.put<BudgetDTO>(`${this.apiUrl}/budgets/${budgetId}`, request);
  }

  deleteBudget(budgetId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/budgets/${budgetId}`);
  }

  // Bill Management
  createBill(request: any): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/bills`, request);
  }

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}/bills`);
  }

  getUpcomingBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}/bills/upcoming`);
  }

  getOverdueBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}/bills/overdue`);
  }

  payBillById(billId: number): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/bills/${billId}/pay`, {});
  }

  // Rewards
  getUserRewards(): Observable<{ id: number; pointsBalance: number }> {
    return this.http.get<{ id: number; pointsBalance: number }>(`${this.apiUrl}/rewards`);
  }

  getRewardHistory(): Observable<RewardHistory[]> {
    return this.http.get<RewardHistory[]>(`${this.apiUrl}/rewards/history`);
  }

  // Notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`);
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/unread`);
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/notifications/read-all`, {});
  }

  // Admin Operations
  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/admin/accounts`);
  }

  getPendingAccountOpenings(): Observable<AccountOpeningResponse[]> {
    return this.http.get<AccountOpeningResponse[]>(`${this.apiUrl}/accounts/pending`);
  }

  getAllAccountOpenings(): Observable<AccountOpeningResponse[]> {
    return this.http.get<AccountOpeningResponse[]>(`${this.apiUrl}/accounts/all`);
  }

  approveAccountOpening(id: number, username: string, password: string): Observable<AccountOpeningResponse> {
    return this.http.post<AccountOpeningResponse>(
      `${this.apiUrl}/accounts/pending/${id}/approve`,
      { username, password },
    );
  }

  rejectAccountOpening(id: number, reason: string): Observable<AccountOpeningResponse> {
    return this.http.post<AccountOpeningResponse>(
      `${this.apiUrl}/accounts/pending/${id}/reject?reason=${encodeURIComponent(reason)}`,
      {},
    );
  }

  // Deposit to account (Admin)
  depositToAccount(accountNumber: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/deposit`, { accountNumber, amount }, { responseType: 'text' });
  }
}
