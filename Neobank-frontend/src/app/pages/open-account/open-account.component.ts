import { Component, ChangeDetectorRef } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';

import { BankingService } from '../../services/banking.service';

import { AccountOpeningRequest } from '../../models/banking.model';

import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-open-account',

  standalone: true,

  imports: [ReactiveFormsModule, CommonModule, RouterLink, ThemeToggleComponent],

  templateUrl: './open-account.component.html',

  styleUrls: ['./open-account.component.css'],
})
export class OpenAccountComponent {
  accountForm: FormGroup;

  kycForm: FormGroup;

  otpForm: FormGroup;

  successMessage: string = '';

  errorMessage: string = '';

  isKycVerified: boolean = false;

  showOtpForm: boolean = false;

  generatedOtp: string = '';

  verifiedAadhaarNumber: string = '';

  verifiedFirstName: string = '';

  verifiedMiddleName: string = '';

  verifiedLastName: string = '';

  aadhaarFile: File | null = null;

  panFile: File | null = null;

  photoFile: File | null = null;

  constructor(
    private fb: FormBuilder,

    private bankingService: BankingService,

    private router: Router,

    private cdr: ChangeDetectorRef,
  ) {
    // KYC Form - Aadhaar verification

    this.kycForm = this.fb.group({
      aadhaarNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],

      firstName: ['', [Validators.required]],

      middleName: [''],

      lastName: ['', [Validators.required]],
    });

    // OTP Verification Form

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    // Main Account Form

    this.accountForm = this.fb.group({
      fullName: ['', [Validators.required]],

      email: ['', [Validators.required, Validators.email]],

      mobileNumber: ['', [Validators.required]],

      aadhaarNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],

      panNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],

      address: ['', [Validators.required]],

      dateOfBirth: ['', [Validators.required]],

      occupation: ['', [Validators.required]],

      annualIncome: ['', [Validators.required, Validators.min(0)]],

      accountType: ['SAVINGS', [Validators.required]],

      initialDeposit: ['', [Validators.required, Validators.min(1000)]],
    });
  }

  // Verify Aadhaar and send OTP

  verifyAadhaar(): void {
    if (this.kycForm.get('aadhaarNumber')?.valid) {
      this.verifiedAadhaarNumber = this.kycForm.get('aadhaarNumber')?.value;

      this.bankingService.checkAadhaarExists(this.verifiedAadhaarNumber).subscribe({
        next: (result) => {
          if (result.exists) {
            this.errorMessage = result.message || 'This Aadhaar number user already exists';

            this.successMessage = '';

            return;
          }

          this.verifiedFirstName = this.kycForm.get('firstName')?.value;

          this.verifiedMiddleName = this.kycForm.get('middleName')?.value || '';

          this.verifiedLastName = this.kycForm.get('lastName')?.value;

          this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

          console.log('=== KYC Verification ===');

          console.log(`Aadhaar Number: ${this.verifiedAadhaarNumber}`);

          console.log(
            `Name: ${this.verifiedFirstName} ${this.verifiedMiddleName} ${this.verifiedLastName}`,
          );

          console.log(`Generated OTP: ${this.generatedOtp}`);

          console.log('========================');

          this.showOtpForm = true;

          this.errorMessage = '';

          this.cdr.detectChanges();
        },

        error: (error) => {
          this.errorMessage = error.error?.message || 'Unable to verify Aadhaar right now';
        },
      });
    } else {
      this.errorMessage = 'Please enter a valid 12-digit Aadhaar number';
    }
  }

  // Verify OTP

  verifyOtp(): void {
    if (this.otpForm.valid) {
      const enteredOtp = this.otpForm.get('otp')?.value;

      if (enteredOtp === this.generatedOtp) {
        this.isKycVerified = true;

        this.showOtpForm = false;

        this.errorMessage = '';

        this.successMessage = 'Aadhaar verified successfully!';

        // Auto-fill the account form with verified data

        const fullName =
          `${this.verifiedFirstName} ${this.verifiedMiddleName} ${this.verifiedLastName}`.trim();

        this.accountForm.patchValue({
          fullName: fullName,

          aadhaarNumber: this.verifiedAadhaarNumber,
        });

        // Scroll to account form

        setTimeout(() => {
          const accountFormElement = document.getElementById('account-form');

          if (accountFormElement) {
            accountFormElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      } else {
        this.errorMessage = 'Invalid OTP. Please try again.';

        this.successMessage = '';
      }
    }
  }

  // Go back from OTP to Aadhaar form

  goBackToAadhaar(): void {
    this.showOtpForm = false;

    this.otpForm.reset();
  }

  // Handle file uploads

  onAadhaarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.aadhaarFile = input.files[0];
    }
  }

  onPanFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.panFile = input.files[0];
    }
  }

  onPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.photoFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (
      this.accountForm.valid &&
      this.isKycVerified &&
      this.aadhaarFile &&
      this.panFile &&
      this.photoFile
    ) {
      console.log('=== Account Opening ===');

      console.log('Account Form Data:', this.accountForm.value);

      console.log('Aadhaar File:', this.aadhaarFile?.name);

      console.log('PAN File:', this.panFile?.name);

      console.log('Photo File:', this.photoFile?.name);

      console.log('========================');

      const request: AccountOpeningRequest = this.accountForm.value;

      this.bankingService

        .openAccount(request, this.aadhaarFile, this.panFile, this.photoFile)

        .subscribe({
          next: (response) => {
            this.successMessage = response.message;

            this.errorMessage = '';

            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          },

          error: (error) => {
            this.errorMessage = error.error.message || 'Account opening failed';

            this.successMessage = '';
          },
        });
    } else if (!this.isKycVerified) {
      this.errorMessage = 'Please complete KYC verification first';
    } else if (!this.aadhaarFile || !this.panFile || !this.photoFile) {
      this.errorMessage = 'Please upload Aadhaar, PAN card, and photo documents';
    } else {
      this.errorMessage = 'Please fill all required fields';
    }
  }
}
