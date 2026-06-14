import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../services/banking.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AdminPendingComponent } from './admin-pending/admin-pending.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminLoansComponent } from './admin-loans/admin-loans.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { PendingApprovalsComponent } from './pending-approvals/pending-approvals.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SystemHealthComponent } from './system-health/system-health.component';
import { SystemLogsComponent } from './system-logs/system-logs.component';
import { Account, AccountOpeningResponse } from '../../models/banking.model';
import { LoanService } from '../../services/loan.service';
import { PendingApproval } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ThemeToggleComponent,
    AdminHomeComponent,
    AdminPendingComponent,
    AdminUsersComponent,
    AdminProfileComponent,
    AdminSettingsComponent,
    AdminLoansComponent,
    AdminDashboardComponent,
    PendingApprovalsComponent,
    UserManagementComponent,
    SystemHealthComponent,
    SystemLogsComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  activeSection: string = 'home';
  accounts: Account[] = [];
  pendingApplications: AccountOpeningResponse[] = [];
  allApplications: AccountOpeningResponse[] = [];
  isLoading = false;
  user: any = null;
  isDarkMode = false;
  mobileMenuOpen = false;
  showAdminNotifications = false;
  pendingLoanApplicationsCount = 0;
  loanReviewApplicationId: number | null = null;
  accountNotificationReadCount = 0;
  loanNotificationReadCount = 0;

  // Deposit functionality
  searchQuery = '';
  filteredAccounts: Account[] = [];
  showDepositModal = false;
  selectedAccountForDeposit: Account | null = null;
  depositAmount: number | null = null;
  depositError = '';
  depositSuccess = '';

  constructor(
    private bankingService: BankingService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private loanService: LoanService,
  ) {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadAdminNotificationReadState();
    this.refreshTheme();
    this.loadData();
  }

  refreshTheme(): void {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
    this.cdr.detectChanges();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadAccounts();
    this.loadPendingApplications();
    this.loadAllApplications();
    this.loadPendingLoanApplications();
  }

  get adminNotificationCount(): number {
    return (this.isAccountNotificationUnread() ? this.pendingApplications.length : 0)
      + (this.isLoanNotificationUnread() ? this.pendingLoanApplicationsCount : 0);
  }

  loadAdminNotificationReadState(): void {
    this.accountNotificationReadCount = Number(localStorage.getItem('adminAccountNotificationReadCount') || 0);
    this.loanNotificationReadCount = Number(localStorage.getItem('adminLoanNotificationReadCount') || 0);
  }

  isAccountNotificationUnread(): boolean {
    return this.pendingApplications.length > 0 && this.pendingApplications.length > this.accountNotificationReadCount;
  }

  isLoanNotificationUnread(): boolean {
    return this.pendingLoanApplicationsCount > 0 && this.pendingLoanApplicationsCount > this.loanNotificationReadCount;
  }

  markAdminNotificationAsRead(type: 'accounts' | 'loans'): void {
    if (type === 'accounts') {
      this.accountNotificationReadCount = this.pendingApplications.length;
      localStorage.setItem('adminAccountNotificationReadCount', String(this.accountNotificationReadCount));
    } else {
      this.loanNotificationReadCount = this.pendingLoanApplicationsCount;
      localStorage.setItem('adminLoanNotificationReadCount', String(this.loanNotificationReadCount));
    }
    this.cdr.detectChanges();
  }

  markAllAdminNotificationsAsRead(): void {
    this.accountNotificationReadCount = this.pendingApplications.length;
    this.loanNotificationReadCount = this.pendingLoanApplicationsCount;
    localStorage.setItem('adminAccountNotificationReadCount', String(this.accountNotificationReadCount));
    localStorage.setItem('adminLoanNotificationReadCount', String(this.loanNotificationReadCount));
    this.cdr.detectChanges();
  }

  loadAllApplications(): void {
    this.bankingService.getAllAccountOpenings().subscribe({
      next: (data) => {
        this.allApplications = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading all applications:', error);
        this.cdr.detectChanges();
      },
    });
  }

  // Deposit functionality
  filterUsers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      // Show latest to oldest (sort by id descending)
      this.filteredAccounts = [...this.accounts].sort((a, b) => b.id - a.id);
    } else {
      this.filteredAccounts = this.accounts
        .filter(
          (acc) =>
            (acc.userName && acc.userName.toLowerCase().includes(query)) ||
            (acc.email && acc.email.toLowerCase().includes(query)) ||
            (acc.accountNumber && acc.accountNumber.toLowerCase().includes(query))
        )
        .sort((a, b) => b.id - a.id);
    }
    this.cdr.detectChanges();
  }

  openDepositModal(account: Account): void {
    this.selectedAccountForDeposit = account;
    this.showDepositModal = true;
    this.depositAmount = null;
    this.depositError = '';
    this.depositSuccess = '';
    this.cdr.detectChanges();
  }

  closeDepositModal(): void {
    this.showDepositModal = false;
    this.selectedAccountForDeposit = null;
    this.depositAmount = null;
    this.depositError = '';
    this.depositSuccess = '';
    this.cdr.detectChanges();
  }

  submitDeposit(): void {
    if (!this.selectedAccountForDeposit || !this.depositAmount || this.depositAmount <= 0) {
      this.depositError = 'Please enter a valid amount';
      return;
    }

    this.depositError = '';
    this.depositSuccess = '';

    this.bankingService.depositToAccount(this.selectedAccountForDeposit.accountNumber, this.depositAmount).subscribe({
      next: (response) => {
        this.depositSuccess = `Successfully deposited ₹${this.depositAmount} to account ${this.selectedAccountForDeposit?.accountNumber}`;
        this.loadAccounts(); // Refresh accounts
        setTimeout(() => {
          this.closeDepositModal();
        }, 2000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.depositError = error.error?.message || 'Deposit failed. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  loadAccounts(): void {
    this.bankingService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        // Initialize filtered accounts (latest to oldest)
        this.filteredAccounts = [...this.accounts].sort((a, b) => b.id - a.id);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.cdr.detectChanges();
      },
    });
  }

  loadPendingApplications(): void {
    this.bankingService.getPendingAccountOpenings().subscribe({
      next: (data) => {
        this.pendingApplications = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading pending applications:', error);
        this.cdr.detectChanges();
      },
    });
  }

  loadPendingLoanApplications(): void {
    this.loanService.getPendingApplications().subscribe({
      next: (data) => {
        this.pendingLoanApplicationsCount = data.length;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading pending loan applications:', error),
    });
  }

  onSectionChange(section: string): void {
    this.activeSection = section;
    if (section === 'home') {
      this.loadData();
    }
    this.cdr.detectChanges();
  }

  reviewLoanApproval(approval: PendingApproval): void {
    this.loanReviewApplicationId = approval.id;
    this.activeSection = 'loans';
    this.cdr.detectChanges();
  }

  onApproveApplication(id: number): void {
    this.loadPendingApplications();
    this.loadAllApplications();
  }

  onRejectApplication(id: number): void {
    const reason = prompt('Enter rejection reason:');
    if (reason && reason.trim()) {
      this.bankingService.rejectAccountOpening(id, reason).subscribe({
        next: () => {
          alert('Application rejected successfully!');
          this.loadPendingApplications();
          this.loadAllApplications();
        },
        error: (error) => {
          alert('Failed to reject application: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.cdr.detectChanges();
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.cdr.detectChanges();
  }
}
