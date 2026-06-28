import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  readonly searchTerm = signal('');
  readonly selectedStatus = signal('');
  readonly selectedCategory = signal('');
  readonly hasSearchTerm = computed(() => this.searchTerm().trim() !== '');
  readonly hasActiveFilters = computed(
    () => this.hasSearchTerm() || this.selectedStatus() !== '' || this.selectedCategory() !== '',
  );

  readonly statusOptions = computed(() =>
    Array.from(new Set(this.assets().map((asset) => asset.status))).sort((first, second) =>
      first.localeCompare(second),
    ),
  );

  readonly categoryOptions = computed(() =>
    Array.from(new Set(this.assets().map((asset) => asset.category))).sort((first, second) =>
      first.localeCompare(second),
    ),
  );

  private countAssetsByStatus(status: string): number {
    const normalizedStatus = status.toLowerCase();

    return this.assets().filter((asset) => asset.status.toLowerCase() === normalizedStatus).length;
  }

  readonly totalAssetCount = computed(() => this.assets().length);
  readonly visibleAssetCount = computed(() => this.filteredAssets().length);
  readonly activeAssetCount = computed(() => this.countAssetsByStatus('Active'));
  readonly inRepairAssetCount = computed(() => this.countAssetsByStatus('In Repair'));

  readonly filteredAssets = computed(() => {
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();
    const selectedStatus = this.selectedStatus();
    const selectedCategory = this.selectedCategory();

    return this.assets().filter((asset) => {
      const normalizedName = asset.name.toLowerCase();
      const normalizedOwner = asset.ownerUsername.toLowerCase();

      const matchesSearch =
        normalizedSearchTerm === '' ||
        normalizedName.includes(normalizedSearchTerm) ||
        normalizedOwner.includes(normalizedSearchTerm);

      const matchesStatus = selectedStatus === '' || asset.status === selectedStatus;
      const matchesCategory = selectedCategory === '' || asset.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  });
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

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus.set(status);
  }

  onCategoryFilterChange(category: string): void {
    this.selectedCategory.set(category);
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
