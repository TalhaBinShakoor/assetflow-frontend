import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Asset } from '../../core/assets/asset.model';
import { AssetService } from '../../core/assets/asset.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly assetService = inject(AssetService);

  readonly assets = signal<Asset[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly deleteErrorMessage = signal('');
  readonly deletingAssetId = signal<number | null>(null);

  ngOnInit(): void {
    this.assetService.getAssets().subscribe({
      next: (assets) => {
        this.assets.set(assets);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load assets. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
  onDeleteAsset(asset: Asset): void {
    if (this.deletingAssetId() !== null) {
      return;
    }

    const confirmed = window.confirm(`Delete "${asset.name}"? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    this.deleteErrorMessage.set('');
    this.deletingAssetId.set(asset.id);

    this.assetService
      .deleteAsset(asset.id)
      .pipe(finalize(() => this.deletingAssetId.set(null)))
      .subscribe({
        next: () => {
          this.assets.update((assets) =>
            assets.filter((currentAsset) => currentAsset.id !== asset.id),
          );
        },
        error: () => {
          this.deleteErrorMessage.set('Unable to delete asset. Please try again.');
        },
      });
  }
}
