export interface AccountOpeningRequest {
  id?: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  aadhaarNumber: string;
  panNumber: string;
  address: string;
  dateOfBirth: string;
  occupation: string;
  annualIncome: number;
  accountType: 'SAVINGS' | 'CURRENT';
  initialDeposit: number;
}

export interface AccountOpeningResponse {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  aadhaarNumber: string;
  panNumber: string;
  address: string;
  accountType: 'SAVINGS' | 'CURRENT';
  gender: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  message: string;
  aadhaarCardPath?: string;
  panCardPath?: string;
  photoPath?: string;
  dateOfBirth?: string;
  occupation?: string;
  annualIncome?: number;
  initialDeposit?: number;
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CURRENT';
  balance: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  userName?: string;
  email?: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'DEBIT' | 'CREDIT';
  description: string;
  category?: string;
  balanceAfter?: number;
  transactionDate: string;
}

export interface MoneyTransferRequest {
  fromAccountId: number;
  receiverAccountNumber: string;
  amount: number;
  description: string;
}

export interface MoneyTransferResponse {
  transactionId: number;
  message: string;
}

export interface BillPaymentRequest {
  accountId: number;
  billerName: string;
  billerAccountNumber: string;
  amount: number;
  billType: string;
}

export interface BillPaymentResponse {
  transactionId: number;
  message: string;
}

export interface BudgetRequest {
  name: string;
  category: string;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface BudgetResponse {
  id: number;
  message: string;
}

export interface Budget {
  id: number;
  userId: number;
  name: string;
  category: string;
  amount: number;
  spent: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: number;
  userId: number;
  rewardType: string;
  points: number;
  description: string;
  earnedDate: string;
}

export interface RewardHistory {
  id: number;
  pointsEarned: number;
  description: string;
  earnedAt: string;
}

// New interfaces for Sprint 2
export interface BudgetDTO {
  id?: number;
  category: string;
  limitAmount: number;
  spent?: number;
  remaining?: number;
  utilizationPercentage?: number;
  budgetMonth: string;
  totalBudget?: number;
  totalSpent?: number;
  budgets?: BudgetDTO[];
}

export interface BudgetAnalytics {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationPercentage: number;
  budgetMonth: string;
  budgets: BudgetDTO[];
}

export interface Bill {
  id?: number;
  billerName: string;
  billerAccountNumber?: string;
  billType?: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  description?: string;
  remindMe?: boolean;
  createdAt?: string;
  paidAt?: string;
}

export interface Notification {
  id?: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
