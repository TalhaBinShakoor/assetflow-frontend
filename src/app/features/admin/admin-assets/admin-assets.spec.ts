import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { AssetService } from '../../../core/assets/asset.service';
import { AdminAssets } from './admin-assets';

describe('AdminAssets', () => {
  let component: AdminAssets;
  let fixture: ComponentFixture<AdminAssets>;

  const assetServiceMock = {
    getAdminAssets: vi.fn(),
    deleteAdminAsset: vi.fn(),
  };

  beforeEach(async () => {
    assetServiceMock.getAdminAssets.mockReset();
    assetServiceMock.deleteAdminAsset.mockReset();
    assetServiceMock.deleteAdminAsset.mockReturnValue(of(undefined));
    assetServiceMock.getAdminAssets.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminAssets],
      providers: [
        {
          provide: AssetService,
          useValue: assetServiceMock,
        },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAssets);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render all admin assets when loading succeeds', () => {
    assetServiceMock.getAdminAssets.mockReturnValue(
      of([
        {
          id: 1,
          name: 'MacBook Pro',
          category: 'Laptop',
          status: 'Active',
          purchaseDate: '2026-06-20',
          ownerUsername: 'talha',
        },
      ]),
    );

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(assetServiceMock.getAdminAssets).toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('MacBook Pro');
    expect(rows[0].textContent).toContain('talha');
    expect(rows[0].textContent).toContain('Laptop');
    expect(rows[0].textContent).toContain('Active');
    expect(rows[0].textContent).toContain('2026-06-20');
  });

  it('should render admin edit and delete actions for each asset', () => {
    assetServiceMock.getAdminAssets.mockReturnValue(
      of([
        {
          id: 1,
          name: 'MacBook Pro',
          category: 'Laptop',
          status: 'Active',
          purchaseDate: '2026-06-20',
          ownerUsername: 'talha',
        },
      ]),
    );

    fixture.detectChanges();

    const editLink = fixture.nativeElement.querySelector('.edit-action');
    const deleteButton = fixture.nativeElement.querySelector('.delete-action');

    expect(editLink.getAttribute('href')).toContain('/assets/1/edit');
    expect(editLink.getAttribute('href')).toContain('returnTo=%2Fadmin%2Fassets');
    expect(deleteButton.textContent).toContain('Delete');
  });

  it('should not delete an admin asset when confirmation is cancelled', () => {
    const asset = {
      id: 1,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
      ownerUsername: 'talha',
    };

    component.assets.set([asset]);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.onDeleteAdminAsset(asset);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Delete "MacBook Pro" owned by talha? This admin action cannot be undone.',
    );
    expect(assetServiceMock.deleteAdminAsset).not.toHaveBeenCalled();
    expect(component.assets()).toEqual([asset]);
  });

  it('should delete an admin asset after confirmation succeeds', () => {
    const asset = {
      id: 1,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
      ownerUsername: 'talha',
    };

    component.assets.set([asset]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.onDeleteAdminAsset(asset);

    expect(assetServiceMock.deleteAdminAsset).toHaveBeenCalledWith(1);
    expect(component.assets()).toEqual([]);
    expect(component.deletingAssetId()).toBeNull();
  });

  it('should display an error when deleting an admin asset fails', () => {
    const asset = {
      id: 1,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
      ownerUsername: 'talha',
    };

    assetServiceMock.getAdminAssets.mockReturnValue(of([asset]));
    assetServiceMock.deleteAdminAsset.mockReturnValue(throwError(() => new Error('Network error')));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    fixture.detectChanges();
    component.onDeleteAdminAsset(asset);
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');

    expect(assetServiceMock.deleteAdminAsset).toHaveBeenCalledWith(1);
    expect(component.assets()).toEqual([asset]);
    expect(component.deleteErrorMessage()).toBe('Unable to delete admin asset. Please try again.');
    expect(component.deletingAssetId()).toBeNull();
    expect(alert.textContent).toContain('Unable to delete admin asset. Please try again.');
  });

  it('should render an empty state when no admin assets exist', () => {
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('No assets found');
    expect(fixture.nativeElement.textContent).toContain(
      'Assets from all users will appear here after they are created.',
    );
  });

  it('should render an error when admin assets cannot be loaded', () => {
    assetServiceMock.getAdminAssets.mockReturnValue(throwError(() => new Error('Forbidden')));

    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe(
      'Unable to load admin assets. Please check your access and try again.',
    );
    expect(alert.textContent).toContain(
      'Unable to load admin assets. Please check your access and try again.',
    );
  });
});
