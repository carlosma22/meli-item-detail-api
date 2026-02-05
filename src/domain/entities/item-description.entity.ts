export class ItemDescription {
  constructor(
    public readonly itemId: string,
    public readonly plainText: string,
    public readonly snapshot?: ItemDescriptionSnapshot,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.itemId || this.itemId.trim() === '') {
      throw new Error('Item ID is required');
    }
    if (!this.plainText || this.plainText.trim() === '') {
      throw new Error('Description text is required');
    }
  }

  getPreview(maxLength: number = 200): string {
    if (this.plainText.length <= maxLength) {
      return this.plainText;
    }
    return this.plainText.substring(0, maxLength) + '...';
  }

  hasSnapshot(): boolean {
    return this.snapshot !== undefined && this.snapshot !== null;
  }
}

export class ItemDescriptionSnapshot {
  constructor(
    public readonly url: string,
    public readonly width: number,
    public readonly height: number,
  ) {}
}
