import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthCredentials } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth`;

  login(credentials: AuthCredentials): Observable<string> {
    return this.http.post(`${this.authUrl}/login`, credentials, {
      responseType: 'text',
    });
  }

  register(credentials: AuthCredentials): Observable<string> {
    return this.http.post(`${this.authUrl}/register`, credentials, {
      responseType: 'text',
    });
  }
}
