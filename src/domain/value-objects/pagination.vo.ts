export class Pagination {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly total: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.page < 1) {
      throw new Error('Page must be greater than 0');
    }
    if (this.limit < 1 || this.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (this.total < 0) {
      throw new Error('Total cannot be negative');
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  getOffset(): number {
    return (this.page - 1) * this.limit;
  }

  hasNextPage(): boolean {
    return this.page < this.getTotalPages();
  }

  hasPreviousPage(): boolean {
    return this.page > 1;
  }

  toObject() {
    return {
      page: this.page,
      limit: this.limit,
      total: this.total,
      totalPages: this.getTotalPages(),
      hasNextPage: this.hasNextPage(),
      hasPreviousPage: this.hasPreviousPage(),
    };
  }
}
