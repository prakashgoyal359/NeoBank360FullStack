import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    console.log('Auth Interceptor - Token:', token ? 'Present' : 'Missing');
    console.log('Auth Interceptor - Request URL:', req.url);

    if (token) {
      console.log('Auth Interceptor - Adding Authorization header with token');

      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });

      console.log(
        'Auth Interceptor - Cloned request headers:',
        cloned.headers.get('Authorization'),
      );

      return next.handle(cloned);
    }

    console.log('Auth Interceptor - No token, passing request as-is');

    return next.handle(req);
  }
}
