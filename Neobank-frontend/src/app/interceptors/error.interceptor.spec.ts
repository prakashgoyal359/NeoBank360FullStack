import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  it('shows API error messages through snackbar', () => {
    const snackBar = { open: vi.fn() } as any;
    const interceptor = new ErrorInterceptor(snackBar);
    const request = new HttpRequest('GET', '/api/analytics/spending/1');
    const handler = {
      handle: vi.fn(() =>
        throwError(() => new HttpErrorResponse({
          status: 403,
          error: { message: 'Forbidden analytics access' },
        })),
      ),
    };

    interceptor.intercept(request, handler as any).subscribe({
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith(
          'Forbidden analytics access',
          'Close',
          expect.objectContaining({ duration: 5000 }),
        );
      },
    });
  });

  it('uses a service-unavailable message for network failures', () => {
    const snackBar = { open: vi.fn() } as any;
    const interceptor = new ErrorInterceptor(snackBar);
    const request = new HttpRequest('GET', '/api/admin/dashboard');
    const handler = {
      handle: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 0 }))),
    };

    interceptor.intercept(request, handler as any).subscribe({
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith(
          'Unable to reach NeoBank360 services. Please check the backend server.',
          'Close',
          expect.any(Object),
        );
      },
    });
  });
});
