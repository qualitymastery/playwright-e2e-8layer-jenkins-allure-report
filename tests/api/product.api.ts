import { BaseAPI } from './base.api';
import { ProductData } from '../data/factories/product.factory';

export class ProductAPI extends BaseAPI {
  async createProduct(data: Omit<ProductData, 'id'>): Promise<ProductData> {
    return this.post('/api/products', data);
  }

  async getProduct(id: string): Promise<ProductData> {
    return this.get(`/api/products/${id}`);
  }

  async listProducts(): Promise<ProductData[]> {
    return this.get('/api/products');
  }

  async deleteProduct(id: string): Promise<void> {
    return this.delete(`/api/products/${id}`);
  }
}
