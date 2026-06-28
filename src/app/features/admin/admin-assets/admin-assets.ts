import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';

import { AdminAsset } from '../../../core/assets/asset.model';
import { AssetService } from '../../../core/assets/asset.service';

@Component({
  selector: 'app-admin-assets',
  imports: [RouterLink],
  templateUrl: './admin-assets.html',
  styleUrl: './admin-assets.scss',
})
export class AdminAssets implements OnInit {
  private readonly assetService = inject(AssetService);

  readonly assets = signal<AdminAsset[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly deleteErrorMessage = signal('');
  readonly deletingAssetId = signal<number | null>(null);

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

  onDeleteAdminAsset(asset: AdminAsset): void {
    if (this.deletingAssetId() !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${asset.name}" owned by ${asset.ownerUsername}? This admin action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    this.deleteErrorMessage.set('');
    this.deletingAssetId.set(asset.id);

    this.assetService
      .deleteAdminAsset(asset.id)
      .pipe(finalize(() => this.deletingAssetId.set(null)))
      .subscribe({
        next: () => {
          this.assets.update((assets) =>
            assets.filter((currentAsset) => currentAsset.id !== asset.id),
          );
        },
        error: () => {
          this.deleteErrorMessage.set('Unable to delete admin asset. Please try again.');
        },
      });
  }
}
