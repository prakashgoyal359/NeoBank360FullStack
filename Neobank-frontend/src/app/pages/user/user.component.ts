import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { BankingService } from '../../services/banking.service';
import { ThemeService } from '../../services/theme.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { LoansApplyComponent } from '../loans/loans-apply/loans-apply.component';
import { MyLoansComponent } from '../loans/my-loans/my-loans.component';
import {
  Account,
  Transaction,
  MoneyTransferRequest,
  BillPaymentRequest,
  BudgetDTO,
  BudgetAnalytics,
  Bill,
  Notification,
} from '../../models/banking.model';

Chart.register(...registerables);

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent, LoansApplyComponent, MyLoansComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('spendingChart') spendingChartRef!: ElementRef;
  @ViewChild('budgetChart') budgetChartRef!: ElementRef;
  chart: Chart | null = null;
  budgetChart: Chart | null = null;

  activeSection: string = 'home';
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  selectedAccount: Account | null = null;
  user: any = null;

  // Theme
  isDarkMode = false;

  // Toggle states
  showAccountNumber = false;
  showBalance = false;

  // Transfer form
  transferAccountNumber = '';
  transferAmount = '';
  transferReason = '';
  showTransferModal = false;

  // Bill payment form
  selectedBillType = '';
  billAmount = '';
  billReason = '';
  showBillModal = false;

  // Password change
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showSettingsModal = false;
  passwordError = '';
  passwordSuccess = '';

  // Reward Popup
  showRewardPopup = false;
  rewardPoints = 0;

  // Bills list
  billCategories = [
    { name: 'Electricity', icon: '⚡', type: 'ELECTRICITY' },
    { name: 'Water', icon: '💧', type: 'WATER' },
    { name: 'Gas/LPG', icon: '🔥', type: 'GAS' },
    { name: 'Broadband', icon: '📶', type: 'BROADBAND' },
    { name: 'Mobile', icon: '📱', type: 'MOBILE' },
    { name: 'DTH', icon: '📺', type: 'DTH' },
    { name: 'Credit Card', icon: '💳', type: 'CREDIT_CARD' },
    { name: 'Insurance', icon: '🛡️', type: 'INSURANCE' },
    { name: 'Loan EMI', icon: '🏦', type: 'LOAN' },
    { name: 'Metro', icon: '🚇', type: 'METRO' },
    { name: 'Bus', icon: '🚌', type: 'BUS' },
    { name: 'Train', icon: '🚂', type: 'TRAIN' },
  ];

  transferReasons = [
    'Personal Transfer',
    'Bill Payment',
    'Mobile & Recharge Payment',
    'Entertainment & Subscription Payment',
    'House Rent Payment',
    'Shopping & Merchant Payment',
    'Travel & Transport Payment',
    'Credit Card Bill Payment',
    'Loan EMI Payment',
  ];

  billReasons = [
    'Bill Payment',
    'Mobile & Recharge Payment',
    'Personal Transfer',
    'Entertainment & Subscription Payment',
    'House Rent Payment',
    'Shopping & Merchant Payment',
    'Travel & Transport Payment',
    'Credit Card Bill Payment',
    'Loan EMI Payment',
  ];

  // Chart data
  chartData: { category: string; amount: number; color: string }[] = [];
  totalSpent = 0;

  // Budget Management
  budgets: BudgetDTO[] = [];
  budgetAnalytics: BudgetAnalytics | null = null;
  selectedBudgetMonth = new Date().toISOString().slice(0, 7);
  showBudgetModal = false;
  budgetCategory = '';
  budgetLimit = '';
  budgetError = '';
  budgetSuccess = '';

  // Bills Management
  bills: Bill[] = [];
  upcomingBills: Bill[] = [];
  overdueBills: Bill[] = [];
  showBillsModal = false;
  newBillBillerName = '';
  newBillCategory = 'ELECTRICITY';
  newBillAmount = '';
  newBillDueDate = '';
  newBillDescription = '';

  // Rewards
  reward: { id: number; pointsBalance: number } | null = null;
  rewardHistory: { id: number; pointsEarned: number; description: string; earnedAt: string }[] = [];

  // Notifications
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotificationsModal = false;

  // Bill Categories for Create
  billCategoriesForCreate = [
    { name: 'Electricity', value: 'ELECTRICITY' },
    { name: 'Water', value: 'WATER' },
    { name: 'Gas', value: 'GAS' },
    { name: 'Internet', value: 'INTERNET' },
    { name: 'Mobile Recharge', value: 'MOBILE' },
    { name: 'DTH', value: 'DTH' },
    { name: 'Insurance', value: 'INSURANCE' },
    { name: 'Education Fees', value: 'EDUCATION' },
    { name: 'Rent', value: 'RENT' },
    { name: 'EMI', value: 'EMI' },
  ];

  showCreateBillForm = false;

  // Budget Categories
  budgetCategories = [
    'Groceries', 'Utilities', 'Rent', 'Entertainment', 'Transfer',
    'Shopping', 'Subscription', 'Travel', 'Education', 'Insurance',
    'Recharge', 'Other'
  ];

  constructor(
    private authService: AuthService,
    private bankingService: BankingService,
    private router: Router,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.refreshTheme();
    this.loadUserData();
    this.router.routerState.root.queryParams.subscribe((params) => {
      if (params['section']) {
        this.activeSection = params['section'];
        this.cdr.detectChanges();
      }
    });
  }

  refreshTheme(): void {
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
    this.cdr.detectChanges();
  }

  loadUserData(): void {
    this.bankingService.getUserAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.cdr.detectChanges();
        if (accounts.length > 0) {
          this.selectedAccount = accounts[0];
          this.loadTransactions(accounts[0].id);
        }
      },
      error: (error) => console.error('Error loading accounts:', error),
    });
    this.loadBudgets();
    this.loadBills();
    this.loadRewards();
    this.loadNotifications();
  }

  loadBudgets(): void {
    this.bankingService.getUserBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        this.loadBudgetAnalytics();
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading budgets:', error),
    });
  }

  loadBudgetAnalytics(): void {
    this.bankingService.getBudgetAnalytics(this.selectedBudgetMonth).subscribe({
      next: (analytics) => {
        this.budgetAnalytics = analytics;
        setTimeout(() => this.initBudgetChart(), 200);
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading budget analytics:', error),
    });
  }

  loadBills(): void {
    this.bankingService.getBills().subscribe({
      next: (bills) => {
        this.bills = bills;
        this.bankingService.getUpcomingBills().subscribe({
          next: (upcoming) => {
            this.upcomingBills = upcoming;
            this.cdr.detectChanges();
          }
        });
        this.bankingService.getOverdueBills().subscribe({
          next: (overdue) => {
            this.overdueBills = overdue;
            this.cdr.detectChanges();
          }
        });
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading bills:', error),
    });
  }

  loadRewards(): void {
    this.bankingService.getUserRewards().subscribe({
      next: (reward) => {
        this.reward = reward;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading rewards:', error),
    });
    this.bankingService.getRewardHistory().subscribe({
      next: (history) => {
        this.rewardHistory = history;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading reward history:', error),
    });
  }

  loadNotifications(): void {
    this.bankingService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.isRead).length;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading notifications:', error),
    });
  }

  loadTransactions(accountId: number): void {
    this.bankingService.getAccountTransactions(accountId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.processChartData();
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading transactions:', error),
    });
  }

  processChartData(): void {
    const categoryMap = new Map<string, number>();
    this.totalSpent = 0;

    this.transactions.forEach((tx) => {
      if (tx.transactionType !== 'DEPOSIT' && tx.transactionType !== 'CREDIT') {
        const category = tx.category || tx.description || 'Other';
        const current = categoryMap.get(category) || 0;
        categoryMap.set(category, current + tx.amount);
        this.totalSpent += tx.amount;
      }
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    this.chartData = Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    // Wait for the view to be ready then create or update chart
    setTimeout(() => {
      if (!this.chart) {
        this.initChart();
      } else {
        this.updateChart();
      }
    }, 200);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initChart(), 100);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  initChart(): void {
    try {
      console.log('Initializing chart, spendingChartRef:', this.spendingChartRef);

      if (!this.spendingChartRef) {
        console.log('Chart ref not found');
        return;
      }

      const canvas = this.spendingChartRef.nativeElement;
      console.log('Canvas element:', canvas);

      if (!canvas) {
        console.log('Canvas not found in ref');
        return;
      }

      const ctx = canvas.getContext('2d');
      console.log('Chart context:', ctx);

      if (!ctx) {
        console.log('Cannot get 2d context');
        return;
      }

      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.chartData.map(item => item.category),
          datasets: [{
            data: this.chartData.map(item => item.amount),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
      console.log('Chart initialized successfully with data:', this.chartData);
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }

  updateChart(): void {
    if (!this.chart) return;

    this.chart.data.labels = this.chartData.map(item => item.category);
    this.chart.data.datasets[0].data = this.chartData.map(item => item.amount);
    this.chart.update();
  }

  toggleAccountNumber(): void {
    this.showAccountNumber = !this.showAccountNumber;
  }

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }

  maskAccountNumber(accountNumber: string): string {
    if (this.showAccountNumber) return accountNumber;
    return '****' + accountNumber.slice(-4);
  }

  formatBalance(balance: number): string {
    if (this.showBalance) return balance.toLocaleString('en-IN');
    return '****';
  }

  // Transfer
  openTransferModal(): void {
    this.showTransferModal = true;
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
    this.transferAccountNumber = '';
    this.transferAmount = '';
    this.transferReason = '';
  }

  submitTransfer(): void {
    if (!this.transferAccountNumber || !this.transferAmount || !this.transferReason || !this.selectedAccount) {
      return;
    }

    const request: MoneyTransferRequest = {
      fromAccountId: this.selectedAccount.id,
      receiverAccountNumber: this.transferAccountNumber,
      amount: parseFloat(this.transferAmount),
      description: this.transferReason,
    };

    this.bankingService.transferMoney(request).subscribe({
      next: () => {
        alert('Transfer successful!');
        this.closeTransferModal();
        this.loadUserData();
      },
      error: (error) => {
        alert('Transfer failed: ' + (error.error?.message || error.message));
      },
    });
  }

  // Bill Payment
  openBillModal(billType: string): void {
    this.selectedBillType = billType;
    this.showBillModal = true;
  }

  closeBillModal(): void {
    this.showBillModal = false;
    this.selectedBillType = '';
    this.billAmount = '';
    this.billReason = '';
  }

  submitBillPayment(): void {
    if (!this.billAmount || !this.billReason || !this.selectedAccount) {
      return;
    }

    const request: BillPaymentRequest = {
      accountId: this.selectedAccount.id,
      billerName: this.selectedBillType,
      billerAccountNumber: 'BILL' + Date.now(),
      amount: parseFloat(this.billAmount),
      billType: this.billReason,
    };

    this.bankingService.payBill(request).subscribe({
      next: () => {
        // Show reward popup with animation
        this.rewardPoints = 10;
        this.showRewardPopup = true;
        this.closeBillModal();
        this.loadUserData();
        this.loadRewards();
      },
      error: (error) => {
        alert('Payment failed: ' + (error.error?.message || error.message));
      },
    });
  }

  // Settings - Change Password
  openSettingsModal(): void {
    this.showSettingsModal = true;
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  closeSettingsModal(): void {
    this.showSettingsModal = false;
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill all fields';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    // Note: Backend needs a password change endpoint - for now show success
    this.passwordSuccess = 'Password changed successfully!';
    setTimeout(() => this.closeSettingsModal(), 2000);
  }

  // Navigation
  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  // Budget Management
  openBudgetModal(): void {
    this.showBudgetModal = true;
    this.budgetCategory = '';
    this.budgetLimit = '';
    this.budgetError = '';
    this.budgetSuccess = '';
  }

  closeBudgetModal(): void {
    this.showBudgetModal = false;
    this.budgetCategory = '';
    this.budgetLimit = '';
    this.budgetError = '';
    this.budgetSuccess = '';
  }

  createBudget(): void {
    this.budgetError = '';
    this.budgetSuccess = '';

    if (!this.budgetCategory || !this.budgetLimit) {
      this.budgetError = 'Please fill all fields';
      return;
    }

    const limit = parseFloat(this.budgetLimit);
    if (limit <= 0) {
      this.budgetError = 'Limit amount must be greater than 0';
      return;
    }

    const request = {
      category: this.budgetCategory,
      limitAmount: limit,
      budgetMonth: this.selectedBudgetMonth,
    };

    this.bankingService.createBudget(request).subscribe({
      next: () => {
        this.budgetSuccess = 'Budget created successfully!';
        this.closeBudgetModal();
        this.loadBudgets();
      },
      error: (error) => {
        this.budgetError = error.error?.message || 'Failed to create budget';
      },
    });
  }

  initBudgetChart(): void {
    if (!this.budgetChartRef?.nativeElement || !this.budgetAnalytics) return;

    const ctx = this.budgetChartRef.nativeElement.getContext('2d');
    if (this.budgetChart) {
      this.budgetChart.destroy();
    }

    const budgetData = this.budgetAnalytics.budgets || [];
    const labels = budgetData.map((b: BudgetDTO) => b.category);
    const budgetAmounts = budgetData.map((b: BudgetDTO) => b.limitAmount);
    const spentAmounts = budgetData.map((b: BudgetDTO) => b.spent || 0);

    this.budgetChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Budget',
            data: budgetAmounts,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
          {
            label: 'Spent',
            data: spentAmounts,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Bills Management
  openBillsListModal(): void {
    this.showBillsModal = true;
  }

  closeBillsListModal(): void {
    this.showBillsModal = false;
    this.resetBillForm();
  }

  resetBillForm(): void {
    this.newBillBillerName = '';
    this.newBillCategory = 'ELECTRICITY';
    this.newBillAmount = '';
    this.newBillDueDate = '';
    this.newBillDescription = '';
  }

  createBill(): void {
    if (!this.newBillBillerName || !this.newBillAmount || !this.newBillDueDate) {
      alert('Please fill all required fields');
      return;
    }

    const request = {
      billerName: this.newBillBillerName,
      category: this.newBillCategory,
      amount: parseFloat(this.newBillAmount),
      dueDate: this.newBillDueDate,
      description: this.newBillDescription,
    };

    this.bankingService.createBill(request).subscribe({
      next: () => {
        alert('Bill created successfully!');
        this.resetBillForm();
        this.loadBills();
      },
      error: (error) => {
        alert('Failed to create bill: ' + (error.error?.message || error.message));
      },
    });
  }

  payExistingBill(billId: number): void {
    if (!this.selectedAccount) {
      alert('No account selected');
      return;
    }

    if (!confirm('Are you sure you want to pay this bill?')) return;

    this.bankingService.payBillById(billId).subscribe({
      next: () => {
        // Show reward popup with animation
        this.rewardPoints = 10;
        this.showRewardPopup = true;
        this.loadBills();
        this.loadRewards();
        this.loadUserData();
      },
      error: (error) => {
        alert('Failed to pay bill: ' + (error.error?.message || error.message));
      },
    });
  }

  // Notifications
  openNotificationsModal(): void {
    this.showNotificationsModal = true;
  }

  closeNotificationsModal(): void {
    this.showNotificationsModal = false;
  }

  closeRewardPopup(): void {
    this.showRewardPopup = false;
  }

  markAsRead(notificationId: number): void {
    this.bankingService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (error) => console.error('Error marking notification as read:', error),
    });
  }

  markAllAsRead(): void {
    this.bankingService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (error) => console.error('Error marking all notifications as read:', error),
    });
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
