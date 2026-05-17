import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  mobileMenuOpen = false;

  ngOnInit() {
    // Theme toggle is now handled by the ThemeToggleComponent
  }

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToOpenAccount() {
    this.router.navigate(['/open-account']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const navbarMenu = document.querySelector('.navbar-menu');
    if (navbarMenu) {
      if (this.mobileMenuOpen) {
        navbarMenu.classList.add('mobile-open');
      } else {
        navbarMenu.classList.remove('mobile-open');
      }
    }
  }
}
