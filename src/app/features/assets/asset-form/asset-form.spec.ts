import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetForm } from './asset-form';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AssetService } from '../../../core/assets/asset.service';
import { Asset, AssetRequest } from '../../../core/assets/asset.model';
import { RouterTestingHarness } from '@angular/router/testing';

describe('AssetForm', () => {
  let component: AssetForm;
  let fixture: ComponentFixture<AssetForm>;
  let router: Router;

  const assetServiceMock = {
    getAsset: vi.fn(),
    createAsset: vi.fn(),
    updateAsset: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AssetForm],
      providers: [
        {
          provide: AssetService,
          useValue: assetServiceMock,
        },
        provideRouter([
          {
            path: 'assets/:id/edit',
            component: AssetForm,
          },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(AssetForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reveal validation errors when an invalid form is submitted', () => {
    component.onSubmit();
    fixture.detectChanges();

    const allControlsTouched = Object.values(component.assetForm.controls).every(
      (control) => control.touched,
    );

    const validationMessages = fixture.nativeElement.querySelectorAll('.field-error');

    expect(component.assetForm.invalid).toBe(true);
    expect(allControlsTouched).toBe(true);
    expect(validationMessages).toHaveLength(4);
  });

  it('should create an asset and navigate to the dashboard', () => {
    const request: AssetRequest = {
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
    };

    const createdAsset: Asset = {
      id: 1,
      ...request,
    };

    assetServiceMock.createAsset.mockReturnValue(of(createdAsset));
    component.assetForm.setValue(request);

    component.onSubmit();

    expect(assetServiceMock.createAsset).toHaveBeenCalledWith(request);
    expect(assetServiceMock.updateAsset).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isSubmitting()).toBe(false);
  });

  it('should load an existing asset into the edit form', async () => {
    const asset: Asset = {
      id: 1,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
    };

    assetServiceMock.getAsset.mockReturnValue(of(asset));

    const harness = await RouterTestingHarness.create();

    const routedComponent = await harness.navigateByUrl('/assets/1/edit', AssetForm);

    expect(assetServiceMock.getAsset).toHaveBeenCalledWith(1);
    expect(routedComponent.isEditMode).toBe(true);
    expect(routedComponent.assetId).toBe(1);
    expect(routedComponent.assetForm.getRawValue()).toEqual({
      name: asset.name,
      category: asset.category,
      status: asset.status,
      purchaseDate: asset.purchaseDate,
    });
    expect(routedComponent.isLoading()).toBe(false);
  });

  it('should update an existing asset and navigate to the dashboard', async () => {
    const existingAsset: Asset = {
      id: 1,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
    };

    const updateRequest: AssetRequest = {
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'In Repair',
      purchaseDate: '2026-06-20',
    };

    const updatedAsset: Asset = {
      id: existingAsset.id,
      ...updateRequest,
    };

    assetServiceMock.getAsset.mockReturnValue(of(existingAsset));
    assetServiceMock.updateAsset.mockReturnValue(of(updatedAsset));

    const harness = await RouterTestingHarness.create();

    const routedComponent = await harness.navigateByUrl('/assets/1/edit', AssetForm);

    routedComponent.assetForm.setValue(updateRequest);
    routedComponent.onSubmit();

    expect(assetServiceMock.updateAsset).toHaveBeenCalledWith(existingAsset.id, updateRequest);
    expect(assetServiceMock.createAsset).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(routedComponent.isSubmitting()).toBe(false);
  });
});
