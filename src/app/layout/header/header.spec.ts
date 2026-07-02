import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { CurrentUser } from '../../core/auth/auth.model';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let currentUserSignal: ReturnType<typeof signal<CurrentUser | null>>;

  const authServiceMock = {
    currentUser: vi.fn(),
    isLoggedIn: vi.fn(),
    isAdmin: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(async () => {
    currentUserSignal = signal<CurrentUser | null>(null);

    authServiceMock.currentUser.mockImplementation(() => currentUserSignal());
    authServiceMock.isLoggedIn.mockImplementation(() => currentUserSignal() !== null);
    authServiceMock.isAdmin.mockImplementation(() => currentUserSignal()?.role === 'ADMIN');
    authServiceMock.logout.mockReset();

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show login and register links when logged out', () => {
    fixture.detectChanges();

    const navText = fixture.nativeElement.querySelector('nav').textContent;

    expect(navText).toContain('Login');
    expect(navText).toContain('Register');
    expect(navText).not.toContain('Dashboard');
    expect(navText).not.toContain('Admin');
  });

  it('should show dashboard and profile summary for a regular user', () => {
    currentUserSignal.set({
      username: 'talha',
      role: 'USER',
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const navText = compiled.querySelector('nav')?.textContent ?? '';
    const profileText = compiled.querySelector('.profile-summary')?.textContent ?? '';

    expect(navText).toContain('Dashboard');
    expect(navText).not.toContain('Admin');
    expect(navText).not.toContain('Login');
    expect(navText).not.toContain('Register');
    expect(profileText).toContain('Signed in as');
    expect(profileText).toContain('talha');
    expect(profileText).toContain('USER');
  });

  it('should show the admin link for an admin user', () => {
    currentUserSignal.set({
      username: 'admin',
      role: 'ADMIN',
    });

    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('nav a'),
    ) as HTMLAnchorElement[];

    const adminLink = links.find((link) => link.textContent?.trim() === 'Admin');

    expect(adminLink).toBeTruthy();
    expect(adminLink?.getAttribute('href')).toBe('/admin/assets');
  });

  it('should log out and navigate to login when logout is clicked', () => {
    currentUserSignal.set({
      username: 'talha',
      role: 'USER',
    });

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    const logoutButton = fixture.nativeElement.querySelector(
      '.profile-summary button',
    ) as HTMLButtonElement;

    logoutButton.click();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
