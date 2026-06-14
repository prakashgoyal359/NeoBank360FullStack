import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = this.resolveMessage(error);

        if (!this.isAuthProbe(req.url, error.status)) {
          this.snackBar.open(message, 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['app-snackbar'],
          });
        }

        return throwError(() => error);
      }),
    );
  }

  private resolveMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Unable to reach NeoBank360 services. Please check the backend server.';
    }

    if (error.status === 401) {
      return 'Your session has expired. Please login again.';
    }

    if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (error.status >= 500) {
      return 'NeoBank360 is having trouble processing this request.';
    }

    return 'Request failed. Please review the details and try again.';
  }

  private isAuthProbe(url: string, status: number): boolean {
    return status === 401 && url.includes('/api/auth/login');
  }
}
