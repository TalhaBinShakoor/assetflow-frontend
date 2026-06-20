import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Asset } from './asset.model';
import { AssetService } from './asset.service';

describe('AssetService', () => {
  let service: AssetService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AssetService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch the authenticated user assets', () => {
    const assets: Asset[] = [
      {
        id: 1,
        name: 'MacBook Pro',
        category: 'Laptop',
        status: 'Active',
        purchaseDate: '2026-06-20',
      },
    ];

    service.getAssets().subscribe((response) => {
      expect(response).toEqual(assets);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/assets`);

    expect(request.request.method).toBe('GET');

    request.flush(assets);
  });
});
