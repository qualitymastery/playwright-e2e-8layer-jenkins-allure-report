import { BaseAPI } from './base.api';

export class AuthAPI extends BaseAPI {
  async login(email: string, password: string): Promise<{ token: string; userId: string }> {
    return this.post('/api/auth/login', { email, password });
  }

  async logout(token: string): Promise<void> {
    return this.post('/api/auth/logout', { token });
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    return this.post('/api/auth/refresh', { token });
  }
}
