import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const user = this.authService.getUser();
    if (this.authService.isLoggedIn() && user && user.role === 'ADMIN') {
      return true;
    }
    this.router.navigate([user?.role === 'USER' ? '/dashboard' : '/login']);
    return false;
  }
}
