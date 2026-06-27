import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AdminAsset, Asset, AssetRequest } from './asset.model';
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

  it('should fetch all assets for an admin user', () => {
    const assets: AdminAsset[] = [
      {
        id: 1,
        name: 'MacBook Pro',
        category: 'Laptop',
        status: 'Active',
        purchaseDate: '2026-06-20',
        ownerUsername: 'talha',
      },
    ];

    service.getAdminAssets().subscribe((response) => {
      expect(response).toEqual(assets);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/admin/assets`);

    expect(request.request.method).toBe('GET');

    request.flush(assets);
  });

  it('should create an asset', () => {
    const assetRequest: AssetRequest = {
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
    };

    const createdAsset: Asset = {
      id: 1,
      ...assetRequest,
    };

    service.createAsset(assetRequest).subscribe((response) => {
      expect(response).toEqual(createdAsset);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/assets`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(assetRequest);

    request.flush(createdAsset, {
      status: 201,
      statusText: 'Created',
    });
  });

  it('should update an existing asset', () => {
    const assetId = 1;

    const assetRequest: AssetRequest = {
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'In Repair',
      purchaseDate: '2026-06-20',
    };

    const updatedAsset: Asset = {
      id: assetId,
      ...assetRequest,
    };

    service.updateAsset(assetId, assetRequest).subscribe((response) => {
      expect(response).toEqual(updatedAsset);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/assets/${assetId}`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(assetRequest);

    request.flush(updatedAsset);
  });

  it('should delete an existing asset', () => {
    const assetId = 1;

    service.deleteAsset(assetId).subscribe((response) => {
      expect(response).toBeNull();
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/assets/${assetId}`);

    expect(request.request.method).toBe('DELETE');

    request.flush(null, {
      status: 204,
      statusText: 'No Content',
    });
  });

  it('should fetch an asset by ID', () => {
    const assetId = 1;

    const asset: Asset = {
      id: assetId,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
    };

    service.getAsset(assetId).subscribe((response) => {
      expect(response).toEqual(asset);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/assets/${assetId}`);

    expect(request.request.method).toBe('GET');

    request.flush(asset);
  });
});
