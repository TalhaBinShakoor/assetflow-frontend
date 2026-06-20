import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Asset } from './asset.model';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly http = inject(HttpClient);
  private readonly assetsUrl = `${environment.apiUrl}/api/assets`;

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.assetsUrl);
  }
}
