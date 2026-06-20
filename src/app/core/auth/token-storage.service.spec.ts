import { TestBed } from '@angular/core/testing';

import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    service.removeToken();
  });

  afterEach(() => {
    service.removeToken();
  });

  it('should save and return the token', () => {
    service.saveToken('mock-jwt-token');

    expect(service.getToken()).toBe('mock-jwt-token');
  });

  it('should return null when no token exists', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should remove the token', () => {
    service.saveToken('mock-jwt-token');

    service.removeToken();

    expect(service.getToken()).toBeNull();
  });
});
