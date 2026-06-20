import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { of, throwError } from 'rxjs';
import { AssetService } from '../../core/assets/asset.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  const assetServiceMock = {
    getAssets: vi.fn(),
  };

  beforeEach(async () => {
    assetServiceMock.getAssets.mockReset();
    assetServiceMock.getAssets.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: AssetService,
          useValue: assetServiceMock,
        },
      ],
      imports: [Dashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
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
});
