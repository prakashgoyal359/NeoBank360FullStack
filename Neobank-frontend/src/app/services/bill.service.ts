import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Bill {
  id?: number;
  billerName: string;
  billerAccountNumber?: string;
  billType?: string;
  category: string;
  amount: number;
  dueDate: string;
  status: string;
  description?: string;
  remindMe?: boolean;
  createdAt?: string;
  paidAt?: string;
}

export interface BillRequest {
  billerName: string;
  category: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface BillPaymentRequest {
  accountId: number;
  billerName: string;
  billerAccountNumber?: string;
  billType?: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class BillService {
  private apiUrl = 'http://localhost:8080/api/bills';

  constructor(private http: HttpClient) {}

  createBill(request: BillRequest): Observable<Bill> {
    return this.http.post<Bill>(this.apiUrl, request);
  }

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.apiUrl);
  }

  getUpcomingBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}/upcoming`);
  }

  getOverdueBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}/overdue`);
  }

  getBill(id: number): Observable<Bill> {
    return this.http.get<Bill>(`${this.apiUrl}/${id}`);
  }

  payBill(id: number): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/${id}/pay`, {});
  }

  createAndPayBill(request: BillPaymentRequest): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/pay`, request);
  }

  updateBillStatus(id: number, status: string): Observable<Bill> {
    return this.http.patch<Bill>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }
}