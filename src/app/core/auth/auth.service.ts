import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthCredentials, AuthRole, CurrentUser } from './auth.model';
import { TokenStorageService } from './token-storage.service';

interface JwtPayload {
  sub?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly currentUserSignal = signal<CurrentUser | null>(this.readCurrentUserFromToken());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  login(credentials: AuthCredentials): Observable<string> {
    return this.http
      .post(`${this.authUrl}/login`, credentials, {
        responseType: 'text',
      })
      .pipe(
        tap((token) => {
          this.tokenStorage.saveToken(token);
          this.currentUserSignal.set(this.decodeCurrentUser(token));
        }),
      );
  }

  register(credentials: AuthCredentials): Observable<string> {
    return this.http.post(`${this.authUrl}/register`, credentials, {
      responseType: 'text',
    });
  }

  logout(): void {
    this.tokenStorage.removeToken();
    this.currentUserSignal.set(null);
  }

  private readCurrentUserFromToken(): CurrentUser | null {
    return this.decodeCurrentUser(this.tokenStorage.getToken());
  }

  private decodeCurrentUser(token: string | null): CurrentUser | null {
    if (!token) {
      return null;
    }

    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        Math.ceil(normalizedPayload.length / 4) * 4,
        '=',
      );
      const decodedPayload = JSON.parse(atob(paddedPayload)) as JwtPayload;

      if (!decodedPayload.sub || !this.isAuthRole(decodedPayload.role)) {
        return null;
      }

      return {
        username: decodedPayload.sub,
        role: decodedPayload.role,
      };
    } catch {
      return null;
    }
  }

  private isAuthRole(role: string | undefined): role is AuthRole {
    return role === 'USER' || role === 'ADMIN';
  }
}
