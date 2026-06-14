import { APIRequestContext } from '@playwright/test';

export abstract class BaseAPI {
  constructor(protected request: APIRequestContext, protected baseURL: string) {}

  protected async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.baseURL);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await this.request.get(url.toString());
    if (!res.ok()) throw new Error(`GET ${path} failed: ${res.status()}`);
    return res.json();
  }

  protected async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.request.post(`${this.baseURL}${path}`, { data: body });
    if (!res.ok()) throw new Error(`POST ${path} failed: ${res.status()}`);
    return res.json();
  }

  protected async put<T>(path: string, body: unknown): Promise<T> {
    const res = await this.request.put(`${this.baseURL}${path}`, { data: body });
    if (!res.ok()) throw new Error(`PUT ${path} failed: ${res.status()}`);
    return res.json();
  }

  protected async delete(path: string): Promise<void> {
    const res = await this.request.delete(`${this.baseURL}${path}`);
    if (!res.ok()) throw new Error(`DELETE ${path} failed: ${res.status()}`);
  }
}
