import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from './token-storage.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  const tokenStorageMock = {
    getToken: vi.fn(),
  };

  beforeEach(() => {
    tokenStorageMock.getToken.mockReset();
    tokenStorageMock.getToken.mockReturnValue('mock-jwt-token');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should add the bearer token to protected API requests', () => {
    http.get(`${environment.apiUrl}/assets`).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/assets`);

    expect(request.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');

    request.flush([]);
  });

  it('should not add a header when no token exists', () => {
    tokenStorageMock.getToken.mockReturnValue(null);

    http.get(`${environment.apiUrl}/assets`).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/assets`);

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush([]);
  });

  it('should not add the token to authentication requests', () => {
    http.post(`${environment.apiUrl}/auth/login`, {}, { responseType: 'text' }).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush('mock-jwt-token');
  });

  it('should not add the token to external requests', () => {
    http.get('https://example.com/data').subscribe();

    const request = httpTesting.expectOne('https://example.com/data');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({});
  });
});
