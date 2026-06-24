import { Component, inject, OnInit, signal } from '@angular/core';

import { Asset } from '../../../core/assets/asset.model';
import { AssetService } from '../../../core/assets/asset.service';

@Component({
  selector: 'app-admin-assets',
  templateUrl: './admin-assets.html',
  styleUrl: './admin-assets.scss',
})
export class AdminAssets implements OnInit {
  private readonly assetService = inject(AssetService);

  readonly assets = signal<Asset[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.assetService.getAdminAssets().subscribe({
      next: (assets) => {
        this.assets.set(assets);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Unable to load admin assets. Please check your access and try again.',
        );
        this.isLoading.set(false);
      },
    });
  }
}
