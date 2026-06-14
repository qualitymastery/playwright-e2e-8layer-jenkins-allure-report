import { BaseAPI } from './base.api';
import { UserData } from '../data/factories/user.factory';

export class UserAPI extends BaseAPI {
  async createUser(data: UserData): Promise<{ id: string } & UserData> {
    return this.post('/api/users', data);
  }

  async getUser(id: string): Promise<{ id: string } & UserData> {
    return this.get(`/api/users/${id}`);
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete(`/api/users/${id}`);
  }

  async getToken(email: string, password: string): Promise<string> {
    const res = await this.post<{ token: string }>('/api/auth/token', { email, password });
    return res.token;
  }
}
