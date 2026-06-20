import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthCredentials } from './auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly tokenStorage = inject(TokenStorageService);

  login(credentials: AuthCredentials): Observable<string> {
    return this.http
      .post(`${this.authUrl}/login`, credentials, {
        responseType: 'text',
      })
      .pipe(tap((token) => this.tokenStorage.saveToken(token)));
  }

  register(credentials: AuthCredentials): Observable<string> {
    return this.http.post(`${this.authUrl}/register`, credentials, {
      responseType: 'text',
    });
  }
}
