export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class ItemNotFoundException extends DomainException {
  constructor(itemId: string) {
    super(`Item with ID ${itemId} not found`);
    this.name = 'ItemNotFoundException';
  }
}

export class ItemDescriptionNotFoundException extends DomainException {
  constructor(itemId: string) {
    super(`Description for item ${itemId} not found`);
    this.name = 'ItemDescriptionNotFoundException';
  }
}

export class InvalidSearchQueryException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSearchQueryException';
  }
}
