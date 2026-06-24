import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AssetService } from '../../../core/assets/asset.service';
import { AdminAssets } from './admin-assets';

describe('AdminAssets', () => {
  let component: AdminAssets;
  let fixture: ComponentFixture<AdminAssets>;

  const assetServiceMock = {
    getAdminAssets: vi.fn(),
  };

  beforeEach(async () => {
    assetServiceMock.getAdminAssets.mockReset();
    assetServiceMock.getAdminAssets.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminAssets],
      providers: [
        {
          provide: AssetService,
          useValue: assetServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAssets);
    component = fixture.componentInstance;
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
        },
      ]),
    );

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(assetServiceMock.getAdminAssets).toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('MacBook Pro');
    expect(rows[0].textContent).toContain('Laptop');
    expect(rows[0].textContent).toContain('Active');
    expect(rows[0].textContent).toContain('2026-06-20');
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
