/**
 * Entidad de dominio que representa un producto de MercadoLibre.
 * Contiene toda la información relevante del producto y lógica de negocio.
 * 
 * Esta entidad es inmutable (readonly properties) y se auto-valida en el constructor,
 * garantizando que siempre esté en un estado válido.
 */
export class Item {
  /**
   * Constructor de la entidad Item.
   * 
   * @param id - Identificador único del producto (ej: MLA123456789)
   * @param title - Título descriptivo del producto
   * @param price - Precio del producto
   * @param currencyId - Código de moneda (ej: ARS, USD)
   * @param availableQuantity - Cantidad disponible en stock
   * @param condition - Condición del producto (new, used)
   * @param thumbnail - URL de la imagen miniatura
   * @param pictures - Array de URLs de imágenes del producto
   * @param seller - Información del vendedor
   * @param attributes - Atributos técnicos del producto
   * @param categoryId - ID de la categoría (opcional)
   * @param permalink - URL permanente del producto (opcional)
   * 
   * @throws Error si alguna validación de dominio falla
   */
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

  /**
   * Valida las invariantes del dominio para garantizar que la entidad
   * siempre esté en un estado válido.
   * 
   * @throws Error si alguna regla de negocio no se cumple
   */
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

  /**
   * Determina si el producto es nuevo.
   * 
   * @returns true si el producto está en condición 'new', false en caso contrario
   */
  isNew(): boolean {
    return this.condition === 'new';
  }

  /**
   * Verifica si el producto tiene stock disponible.
   * 
   * @returns true si hay al menos una unidad disponible, false en caso contrario
   */
  isAvailable(): boolean {
    return this.availableQuantity > 0;
  }

  /**
   * Formatea el precio con la moneda correspondiente.
   * 
   * @returns Precio formateado con 2 decimales (ej: "ARS 1500.00")
   */
  getFormattedPrice(): string {
    return `${this.currencyId} ${this.price.toFixed(2)}`;
  }
}

/**
 * Entidad que representa al vendedor de un producto.
 * Contiene información básica del vendedor en MercadoLibre.
 */
export class Seller {
  /**
   * @param id - ID numérico del vendedor
   * @param nickname - Nombre de usuario del vendedor
   * @param permalink - URL del perfil del vendedor (opcional)
   */
  constructor(
    public readonly id: number,
    public readonly nickname: string,
    public readonly permalink?: string,
  ) {}
}

/**
 * Entidad que representa un atributo técnico del producto.
 * Los atributos describen características específicas como marca, modelo, color, etc.
 */
export class ItemAttribute {
  /**
   * @param id - Identificador del atributo (ej: "BRAND")
   * @param name - Nombre legible del atributo (ej: "Marca")
   * @param valueName - Valor del atributo (ej: "Samsung")
   */
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly valueName: string,
  ) {}
}
