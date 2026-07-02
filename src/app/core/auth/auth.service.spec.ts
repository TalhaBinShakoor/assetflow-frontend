import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const tokenStorageMock = {
    saveToken: vi.fn(),
    getToken: vi.fn(),
    removeToken: vi.fn(),
  };

  const createMockToken = (payload: object): string => {
    const encodedHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.signature`;
  };

  beforeEach(() => {
    tokenStorageMock.saveToken.mockReset();
    tokenStorageMock.getToken.mockReset();
    tokenStorageMock.removeToken.mockReset();
    tokenStorageMock.getToken.mockReturnValue(null);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
        AuthService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should send login credentials to the backend and save the token', () => {
    const credentials = {
      username: 'talha',
      password: 'secret123',
    };

    const token = createMockToken({
      sub: 'talha',
      role: 'USER',
    });

    service = TestBed.inject(AuthService);
    service.login(credentials).subscribe((loginToken) => {
      expect(loginToken).toBe(token);
    });

    const request = httpTesting.expectOne('http://localhost:8080/auth/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    expect(request.request.responseType).toBe('text');

    request.flush(token);

    expect(tokenStorageMock.saveToken).toHaveBeenCalledWith(token);
    expect(service.currentUser()).toEqual({
      username: 'talha',
      role: 'USER',
    });
    expect(service.isLoggedIn()).toBe(true);
    expect(service.isAdmin()).toBe(false);
  });

  it('should restore the current user from an existing token', () => {
    const token = createMockToken({
      sub: 'admin',
      role: 'ADMIN',
    });

    tokenStorageMock.getToken.mockReturnValue(token);

    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.currentUser()).toEqual({
      username: 'admin',
      role: 'ADMIN',
    });
    expect(restoredService.isLoggedIn()).toBe(true);
    expect(restoredService.isAdmin()).toBe(true);
  });

  it('should clear the current user on logout', () => {
    const token = createMockToken({
      sub: 'talha',
      role: 'USER',
    });

    tokenStorageMock.getToken.mockReturnValue(token);
    const restoredService = TestBed.inject(AuthService);

    restoredService.logout();

    expect(tokenStorageMock.removeToken).toHaveBeenCalled();
    expect(restoredService.currentUser()).toBeNull();
    expect(restoredService.isLoggedIn()).toBe(false);
    expect(restoredService.isAdmin()).toBe(false);
  });

  it('should send registration credentials to the backend', () => {
    const credentials = {
      username: 'new-user',
      password: 'secret123',
    };

    service = TestBed.inject(AuthService);
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
