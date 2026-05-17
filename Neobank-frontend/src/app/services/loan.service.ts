import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoanProduct {
  id: number;
  productName: string;
  loanType: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  allowedTenures: string;
  minTenure: number;
  maxTenure: number;
  processingFee: number;
  isActive: boolean;
}

export interface LoanProductRequest {
  productName: string;
  loanType: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  allowedTenures: string;
  minTenure: number;
  maxTenure: number;
  processingFee?: number;
}

export interface LoanApplication {
  id: number;
  applicationNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  loanProductId: number;
  productName: string;
  loanType: string;
  requestedAmount: number;
  requestedTenure: number;
  status: string;
  appliedAt: string;
  processedAt: string;
  processedBy: number;
  processedByName: string;
  adminRemarks: string;
  rejectionReason: string;
  income: number;
  employerName: string;
  designation: string;
  monthlyIncome: number;
  existingEmis: number;
}

export interface LoanApplicationRequest {
  loanProductId: number;
  requestedAmount: number;
  requestedTenure: number;
  income?: number;
  employerName?: string;
  designation?: string;
  monthlyIncome?: number;
  existingEmis?: number;
}

export interface LoanDecisionRequest {
  decision: 'APPROVED' | 'REJECTED';
  remarks?: string;
  rejectionReason?: string;
}

export interface LoanAccount {
  id: number;
  loanAccountNumber: string;
  userId: number;
  userName: string;
  productName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  totalInterest: number;
  totalAmount: number;
  disbursedAmount: number;
  disbursedDate: string;
  firstEmiDate: string;
  lastEmiDate: string;
  remainingPrincipal: number;
  status: string;
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
}

export interface LoanRepayment {
  id: number;
  loanAccountId: number;
  loanAccountNumber: string;
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  remainingPrincipal: number;
  status: string;
  paidAmount: number;
  paidDate: string;
  paymentReference: string;
  penaltyAmount: number;
  isOverdue: boolean;
}

export interface LoanDashboard {
  totalProducts: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  activeLoans: number;
  closedLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalEmiReceivable: number;
  totalEmiPaid: number;
  overdueRepayments: number;
  overdueAmount: number;
}

export interface EmiCalculation {
  emi: number;
  totalInterest: number;
  totalAmount: number;
  monthlyRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:8080/api/loans';

  constructor(private http: HttpClient) {}

  // Loan Products
  getAllProducts(): Observable<LoanProduct[]> {
    return this.http.get<LoanProduct[]>(`${this.apiUrl}/products`);
  }

  getActiveProducts(): Observable<LoanProduct[]> {
    return this.http.get<LoanProduct[]>(`${this.apiUrl}/products/active`);
  }

  getProductById(id: number): Observable<LoanProduct> {
    return this.http.get<LoanProduct>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(request: LoanProductRequest): Observable<LoanProduct> {
    return this.http.post<LoanProduct>(`${this.apiUrl}/products`, request);
  }

  updateProduct(id: number, request: LoanProductRequest): Observable<LoanProduct> {
    return this.http.put<LoanProduct>(`${this.apiUrl}/products/${id}`, request);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  // Loan Applications
  applyForLoan(request: LoanApplicationRequest): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.apiUrl}/apply`, request);
  }

  getMyApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/my-applications`);
  }

  getApplicationById(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.apiUrl}/applications/${id}`);
  }

  // Admin Loan Management
  getAllApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/admin/applications`);
  }

  getPendingApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/admin/applications/pending`);
  }

  getApprovedApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/admin/applications/approved`);
  }

  getRejectedApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/admin/applications/rejected`);
  }

  processApplication(id: number, decision: LoanDecisionRequest): Observable<LoanApplication> {
    return this.http.put<LoanApplication>(`${this.apiUrl}/admin/applications/${id}/decision`, decision);
  }

  getAdminDashboard(): Observable<LoanDashboard> {
    return this.http.get<LoanDashboard>(`${this.apiUrl}/admin/dashboard`);
  }

  // Loan Accounts
  getMyAccounts(): Observable<LoanAccount[]> {
    return this.http.get<LoanAccount[]>(`${this.apiUrl}/my-accounts`);
  }

  getAccountById(id: number): Observable<LoanAccount> {
    return this.http.get<LoanAccount>(`${this.apiUrl}/accounts/${id}`);
  }

  // Repayments
  getRepayments(loanAccountId: number): Observable<LoanRepayment[]> {
    return this.http.get<LoanRepayment[]>(`${this.apiUrl}/${loanAccountId}/repayments`);
  }

  getMyRepayments(): Observable<LoanRepayment[]> {
    return this.http.get<LoanRepayment[]>(`${this.apiUrl}/my-repayments`);
  }

  payRepayment(loanAccountId: number, repaymentId: number): Observable<LoanRepayment> {
    return this.http.patch<LoanRepayment>(`${this.apiUrl}/${loanAccountId}/repayments/${repaymentId}/pay`, {});
  }

  getUserDashboard(): Observable<LoanDashboard> {
    return this.http.get<LoanDashboard>(`${this.apiUrl}/dashboard`);
  }

  // EMI Calculator
  calculateEmi(principal: number, annualRate: number, tenureMonths: number): EmiCalculation {
    const monthlyRate = annualRate / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const totalAmount = emi * tenureMonths;
    const totalInterest = totalAmount - principal;

    return {
      emi: Math.round(emi * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      monthlyRate: monthlyRate
    };
  }

  getTenureOptions(product: LoanProduct): number[] {
    if (!product.allowedTenures) return [];
    return product.allowedTenures.split(',').map(t => parseInt(t.trim()));
  }
}