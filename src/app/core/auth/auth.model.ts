export interface AuthCredentials {
  username: string;
  password: string;
}

export type AuthRole = 'USER' | 'ADMIN';

export interface CurrentUser {
  username: string;
  role: AuthRole;
}
