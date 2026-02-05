export class Item {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly price: number,
    public readonly currencyId: string,
    public readonly availableQuantity: number,
    public readonly condition: string,
    public readonly thumbnail: string,
    public readonly pictures: string[],
    public readonly seller: Seller,
    public readonly attributes: ItemAttribute[],
    public readonly categoryId?: string,
    public readonly permalink?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('Item ID is required');
    }
    if (!this.title || this.title.trim() === '') {
      throw new Error('Item title is required');
    }
    if (this.price < 0) {
      throw new Error('Item price cannot be negative');
    }
    if (this.availableQuantity < 0) {
      throw new Error('Available quantity cannot be negative');
    }
  }

  isNew(): boolean {
    return this.condition === 'new';
  }

  isAvailable(): boolean {
    return this.availableQuantity > 0;
  }

  getFormattedPrice(): string {
    return `${this.currencyId} ${this.price.toFixed(2)}`;
  }
}

export class Seller {
  constructor(
    public readonly id: number,
    public readonly nickname: string,
    public readonly permalink?: string,
  ) {}
}

export class ItemAttribute {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly valueName: string,
  ) {}
}
