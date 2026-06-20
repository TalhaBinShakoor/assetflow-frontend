import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register } from './register';

import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { provideRouter } from '@angular/router';

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  let component: Register;

  const authServiceMock = {
    register: vi.fn(),
  };

  beforeEach(async () => {
    authServiceMock.register.mockReset();
    authServiceMock.register.mockReturnValue(of('User registered successfully'));

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show required errors after empty submission', () => {
    component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errors = Array.from(compiled.querySelectorAll<HTMLElement>('.field-error')).map(
      (element) => element.textContent?.trim(),
    );

    expect(errors).toEqual(['Username is required.', 'Password is required.']);
  });

  it('should reject a password shorter than six characters', () => {
    component.registerForm.setValue({
      username: 'talha',
      password: '12345',
    });

    component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(component.registerForm.invalid).toBe(true);
    expect(compiled.querySelector('.field-error')?.textContent?.trim()).toBe(
      'Password must be at least 6 characters.',
    );
  });

  it('should accept valid registration data', () => {
    component.registerForm.setValue({
      username: 'talha',
      password: '123456',
    });

    expect(component.registerForm.valid).toBe(true);
  });

  it('should submit valid data through AuthService', () => {
    const credentials = {
      username: 'new-user',
      password: 'secret123',
    };

    component.registerForm.setValue(credentials);
    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith(credentials);
    expect(component.successMessage()).toBe('User registered successfully');
  });

  it('should show an error when the username already exists', () => {
    authServiceMock.register.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );

    component.registerForm.setValue({
      username: 'existing-user',
      password: 'secret123',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Username already exists.');
  });
});
