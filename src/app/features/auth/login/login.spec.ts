import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { provideRouter } from '@angular/router';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;

  const authServiceMock = {
    login: vi.fn(),
  };

  beforeEach(async () => {
    authServiceMock.login.mockReset();
    authServiceMock.login.mockReturnValue(of('mock-jwt-token'));
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
      imports: [Login],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid form', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('should show validation errors after empty submission', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(component.loginForm.controls.username.touched).toBe(true);
    expect(component.loginForm.controls.password.touched).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;

    const errors = Array.from(compiled.querySelectorAll<HTMLElement>('.field-error')).map(
      (element: Element) => element.textContent?.trim(),
    );

    expect(errors).toEqual(['Username is required.', 'Password is required.']);
  });

  it('should submit valid credentials through AuthService', () => {
    const credentials = {
      username: 'talha',
      password: 'secret123',
    };

    component.loginForm.setValue(credentials);
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith(credentials);
    expect(component.successMessage()).toBe('Login successful.');
  });
});
