import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { of, throwError } from 'rxjs';
import { AssetService } from '../../core/assets/asset.service';
import { provideRouter } from '@angular/router';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  const assetServiceMock = {
    getAssets: vi.fn(),
    deleteAsset: vi.fn(),
  };

  beforeEach(async () => {
    assetServiceMock.getAssets.mockReset();
    assetServiceMock.deleteAsset.mockReset();
    assetServiceMock.getAssets.mockReturnValue(of([]));
    assetServiceMock.deleteAsset.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: AssetService,
          useValue: assetServiceMock,
        },
        provideRouter([]),
      ],
      imports: [Dashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an asset row when assets are available', () => {
    component.assets.set([
      {
        id: 1,
        name: 'MacBook Pro',
        category: 'Laptop',
        status: 'Active',
        purchaseDate: '2026-06-20',
      },
    ]);
    component.isLoading.set(false);

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('MacBook Pro');
    expect(rows[0].textContent).toContain('Laptop');
    expect(rows[0].textContent).toContain('Active');
    expect(rows[0].textContent).toContain('2026-06-20');
  });

  it('should display an error when loading assets fails', () => {
    assetServiceMock.getAssets.mockReturnValue(throwError(() => new Error('Network error')));

    component.ngOnInit();
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Unable to load assets. Please try again.');
    expect(alert.textContent).toContain('Unable to load assets. Please try again.');
  });

  it('should render create and edit asset links', () => {
    component.assets.set([
      {
        id: 1,
        name: 'MacBook Pro',
        category: 'Laptop',
        status: 'Active',
        purchaseDate: '2026-06-20',
      },
    ]);
    component.isLoading.set(false);

    fixture.detectChanges();

    const createLink = fixture.nativeElement.querySelector('.primary-action');

    const editLink = fixture.nativeElement.querySelector('.edit-action');

    expect(createLink.getAttribute('href')).toBe('/assets/new');
    expect(editLink.getAttribute('href')).toBe('/assets/1/edit');
  });

  it('should not delete an asset when confirmation is cancelled', () => {
    const asset = {
      id: 1,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
    };

    component.assets.set([asset]);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.onDeleteAsset(asset);

    expect(confirmSpy).toHaveBeenCalledWith('Delete "MacBook Pro"? This action cannot be undone.');
    expect(assetServiceMock.deleteAsset).not.toHaveBeenCalled();
    expect(component.assets()).toEqual([asset]);
  });

  it('should delete an asset after confirmation succeeds', () => {
    const asset = {
      id: 1,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
    };

    component.assets.set([asset]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.onDeleteAsset(asset);

    expect(assetServiceMock.deleteAsset).toHaveBeenCalledWith(1);
    expect(component.assets()).toEqual([]);
    expect(component.deletingAssetId()).toBeNull();
  });

  it('should display an error when deleting an asset fails', () => {
    const asset = {
      id: 1,
      name: 'MacBook Pro',
      category: 'Laptop',
      status: 'Active',
      purchaseDate: '2026-06-20',
    };

    assetServiceMock.deleteAsset.mockReturnValue(throwError(() => new Error('Network error')));
    component.assets.set([asset]);
    component.isLoading.set(false);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.onDeleteAsset(asset);
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');

    expect(assetServiceMock.deleteAsset).toHaveBeenCalledWith(1);
    expect(component.assets()).toEqual([asset]);
    expect(component.deleteErrorMessage()).toBe('Unable to delete asset. Please try again.');
    expect(component.deletingAssetId()).toBeNull();
    expect(alert.textContent).toContain('Unable to delete asset. Please try again.');
  });
});
