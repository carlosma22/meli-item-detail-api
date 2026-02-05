export class SearchQuery {
  constructor(
    public readonly query: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {
    this.validate();
  }

  private validate(): void {
    // Query puede estar vacío para retornar todos los items
    if (this.query && this.query.trim() !== '' && this.query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }
    if (this.page < 1) {
      throw new Error('Page must be greater than 0');
    }
    if (this.limit < 1 || this.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  getOffset(): number {
    return (this.page - 1) * this.limit;
  }

  toObject() {
    return {
      query: this.query ? this.query.trim() : '',
      page: this.page,
      limit: this.limit,
      offset: this.getOffset(),
    };
  }
}
