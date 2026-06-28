import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../../core/assets/asset.service';
import { AssetRequest } from '../../../core/assets/asset.model';

@Component({
  selector: 'app-asset-form',
  imports: [ReactiveFormsModule],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.scss',
})
export class AssetForm implements OnInit {
  private readonly assetService = inject(AssetService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly loadErrorMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly saveErrorMessage = signal('');

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  private readonly requestedReturnTo = this.route.snapshot.queryParamMap.get('returnTo');

  readonly isEditMode = this.idParam !== null;
  readonly assetId = this.idParam === null ? null : Number(this.idParam);
  readonly returnPath = this.requestedReturnTo === '/admin/assets' ? '/admin/assets' : '/dashboard';

  readonly assetForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    category: ['', [Validators.required, Validators.pattern(/\S/)]],
    status: ['', [Validators.required, Validators.pattern(/\S/)]],
    purchaseDate: ['', Validators.required],
  });

  ngOnInit(): void {
    if (!this.isEditMode) {
      return;
    }

    if (this.assetId === null || !Number.isInteger(this.assetId) || this.assetId <= 0) {
      this.loadErrorMessage.set('Invalid asset ID.');
      return;
    }

    this.isLoading.set(true);

    this.assetService
      .getAsset(this.assetId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (asset) => {
          this.assetForm.patchValue({
            name: asset.name,
            category: asset.category,
            status: asset.status,
            purchaseDate: asset.purchaseDate ?? '',
          });
        },
        error: () => {
          this.loadErrorMessage.set('Unable to load asset.');
        },
      });
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      return;
    }

    if (
      this.isEditMode &&
      (this.assetId === null || !Number.isInteger(this.assetId) || this.assetId <= 0)
    ) {
      this.loadErrorMessage.set('Invalid asset ID.');
      return;
    }

    this.saveErrorMessage.set('');
    this.isSubmitting.set(true);

    const request: AssetRequest = this.assetForm.getRawValue();

    const saveRequest =
      this.isEditMode && this.assetId !== null
        ? this.assetService.updateAsset(this.assetId, request)
        : this.assetService.createAsset(request);

    saveRequest.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        void this.router.navigate([this.returnPath]);
      },
      error: () => {
        this.saveErrorMessage.set(
          this.isEditMode ? 'Unable to update asset.' : 'Unable to create asset.',
        );
      },
    });
  }
}
