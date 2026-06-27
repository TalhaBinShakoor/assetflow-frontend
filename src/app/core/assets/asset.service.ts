import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminAsset, Asset, AssetRequest } from './asset.model';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly http = inject(HttpClient);
  private readonly assetsUrl = `${environment.apiUrl}/api/assets`;
  private readonly adminAssetsUrl = `${environment.apiUrl}/api/admin/assets`;

  createAsset(request: AssetRequest): Observable<Asset> {
    return this.http.post<Asset>(this.assetsUrl, request);
  }

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.assetsUrl);
  }

  getAdminAssets(): Observable<AdminAsset[]> {
    return this.http.get<AdminAsset[]>(this.adminAssetsUrl);
  }

  updateAsset(id: number, request: AssetRequest): Observable<Asset> {
    return this.http.put<Asset>(`${this.assetsUrl}/${id}`, request);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.assetsUrl}/${id}`);
  }

  getAsset(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.assetsUrl}/${id}`);
  }
}
