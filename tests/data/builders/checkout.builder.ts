import { createUser, UserData } from '../factories/user.factory';

export class CheckoutBuilder {
  private data = {
    user: createUser(),
    items: [] as { id: string; qty: number }[],
    coupon: '',
    address: { line1: '123 Test St', city: 'Testville', zip: '12345', country: 'US' },
  };

  withUser(user: Partial<UserData>): this {
    this.data.user = createUser(user);
    return this;
  }

  withItem(id: string, qty = 1): this {
    this.data.items.push({ id, qty });
    return this;
  }

  withCoupon(code: string): this {
    this.data.coupon = code;
    return this;
  }

  withAddress(address: Partial<typeof this.data.address>): this {
    this.data.address = { ...this.data.address, ...address };
    return this;
  }

  build() {
    return this.data;
  }
}
