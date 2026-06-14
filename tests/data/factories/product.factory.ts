import { randomId } from '../../utils/random';

export interface ProductData {
  id: string;
  name: string;
  price: number;
  sku: string;
  category: string;
  inStock: boolean;
}

export function createProduct(overrides: Partial<ProductData> = {}): ProductData {
  const id = randomId();
  return {
    id,
    name: `Product-${id}`,
    price: parseFloat((Math.random() * 100 + 1).toFixed(2)),
    sku: `SKU-${id.toUpperCase()}`,
    category: 'general',
    inStock: true,
    ...overrides,
  };
}

export function createOutOfStockProduct(overrides: Partial<ProductData> = {}): ProductData {
  return createProduct({ inStock: false, ...overrides });
}
