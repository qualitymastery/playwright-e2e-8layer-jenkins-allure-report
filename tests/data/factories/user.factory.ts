import { randomEmail, randomName, randomPassword } from '../../utils/random';

export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'viewer';
}

export function createUser(overrides: Partial<UserData> = {}): UserData {
  return {
    email: randomEmail(),
    password: randomPassword(),
    firstName: randomName(),
    lastName: randomName(),
    role: 'user',
    ...overrides,
  };
}

export function createAdminUser(overrides: Partial<UserData> = {}): UserData {
  return createUser({ role: 'admin', ...overrides });
}

export function createViewerUser(overrides: Partial<UserData> = {}): UserData {
  return createUser({ role: 'viewer', ...overrides });
}
