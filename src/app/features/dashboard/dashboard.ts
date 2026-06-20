import { Component, inject, OnInit, signal } from '@angular/core';

import { Asset } from '../../core/assets/asset.model';
import { AssetService } from '../../core/assets/asset.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly assetService = inject(AssetService);

  readonly assets = signal<Asset[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

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
}
