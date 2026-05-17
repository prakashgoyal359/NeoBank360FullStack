import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountOpeningResponse } from '../../../models/banking.model';
import { BankingService } from '../../../services/banking.service';

@Component({
  selector: 'app-admin-pending',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pending.component.html',
  styleUrls: ['./admin-pending.component.css'],
})
export class AdminPendingComponent {
  @Input() pendingApplications: AccountOpeningResponse[] = [];
  @Output() approve = new EventEmitter<number>();
  @Output() reject = new EventEmitter<number>();

  selectedApp: AccountOpeningResponse | null = null;
  showViewModal = false;
  showApproveModal = false;
  isLoading = false;

  // Credentials form
  username = '';
  password = '';
  confirmPassword = '';

  constructor(private bankingService: BankingService) {}

  openViewModal(app: AccountOpeningResponse): void {
    this.selectedApp = app;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
  }

  openApproveModal(app: AccountOpeningResponse): void {
    this.selectedApp = app;
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.showApproveModal = true;
    this.showViewModal = false;
  }

  openApproveFromView(): void {
    this.showViewModal = false;
    this.openApproveModal(this.selectedApp!);
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
  }

  isFormValid(): boolean {
    return this.username.trim().length >= 3 &&
           this.password.length >= 6 &&
           this.password === this.confirmPassword;
  }

  onApprove(): void {
    if (!this.selectedApp || !this.isFormValid()) return;

    this.isLoading = true;
    this.bankingService.approveAccountOpening(this.selectedApp.id, this.username, this.password).subscribe({
      next: (response) => {
        console.log('Application approved:', response);
        alert(`Application approved successfully!\n\nUsername: ${this.username}\nPassword: ${this.password}`);
        this.approve.emit(this.selectedApp!.id);
        this.closeApproveModal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error approving application:', error);
        alert('Failed to approve application: ' + (error.error?.message || error.message));
        this.isLoading = false;
      }
    });
  }

  onReject(id: number): void {
    const reason = prompt('Enter rejection reason:');
    if (reason && reason.trim()) {
      this.reject.emit(id);
    }
  }

  // Document utilities
  getDocumentUrl(path: string | undefined | null): string {
    if (!path) return '';
    // Use encodeURIComponent to handle file paths with spaces
    return `http://localhost:8080/api/documents/view?path=${encodeURIComponent(path)}`;
  }

  isImage(path: string | undefined | null): boolean {
    if (!path) return false;
    const ext = path.toLowerCase();
    return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || ext.endsWith('.gif');
  }

  isPdf(path: string | undefined | null): boolean {
    if (!path) return false;
    return path.toLowerCase().endsWith('.pdf');
  }
}