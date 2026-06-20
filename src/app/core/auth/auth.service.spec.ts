import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should send login credentials to the backend', () => {
    const credentials = {
      username: 'talha',
      password: 'secret123',
    };

    service.login(credentials).subscribe((token) => {
      expect(token).toBe('mock-jwt-token');
    });

    const request = httpTesting.expectOne('http://localhost:8080/auth/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    expect(request.request.responseType).toBe('text');

    request.flush('mock-jwt-token');
  });

  it('should send registration credentials to the backend', () => {
    const credentials = {
      username: 'new-user',
      password: 'secret123',
    };

    service.register(credentials).subscribe((message) => {
      expect(message).toBe('User registered successfully');
    });

    const request = httpTesting.expectOne('http://localhost:8080/auth/register');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    expect(request.request.responseType).toBe('text');

    request.flush('User registered successfully');
  });
});
