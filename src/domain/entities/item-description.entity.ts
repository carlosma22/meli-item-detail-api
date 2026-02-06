/**
 * Entidad de dominio que representa la descripción detallada de un producto.
 * Contiene el texto descriptivo y opcionalmente una imagen snapshot.
 */
export class ItemDescription {
  /**
   * Constructor de la entidad ItemDescription.
   * 
   * @param itemId - ID del producto al que pertenece esta descripción
   * @param plainText - Texto plano de la descripción del producto
   * @param snapshot - Imagen snapshot de la descripción (opcional)
   * 
   * @throws Error si las validaciones de dominio fallan
   */
  constructor(
    public readonly itemId: string,
    public readonly plainText: string,
    public readonly snapshot?: ItemDescriptionSnapshot,
  ) {
    this.validate();
  }

  /**
   * Valida las reglas de negocio de la descripción.
   * 
   * @throws Error si el itemId o plainText están vacíos
   */
  private validate(): void {
    if (!this.itemId || this.itemId.trim() === '') {
      throw new Error('Item ID is required');
    }
    if (!this.plainText || this.plainText.trim() === '') {
      throw new Error('Description text is required');
    }
  }

  /**
   * Obtiene una vista previa truncada de la descripción.
   * 
   * @param maxLength - Longitud máxima del preview (default: 200)
   * @returns Texto truncado con "..." si excede maxLength, o texto completo si es menor
   */
  getPreview(maxLength: number = 200): string {
    if (this.plainText.length <= maxLength) {
      return this.plainText;
    }
    return this.plainText.substring(0, maxLength) + '...';
  }

  /**
   * Verifica si la descripción incluye una imagen snapshot.
   * 
   * @returns true si existe snapshot, false en caso contrario
   */
  hasSnapshot(): boolean {
    return this.snapshot !== undefined && this.snapshot !== null;
  }
}

/**
 * Entidad que representa una imagen snapshot de la descripción del producto.
 * Contiene la URL y dimensiones de la imagen.
 */
export class ItemDescriptionSnapshot {
  /**
   * @param url - URL de la imagen snapshot
   * @param width - Ancho de la imagen en píxeles
   * @param height - Alto de la imagen en píxeles
   */
  constructor(
    public readonly url: string,
    public readonly width: number,
    public readonly height: number,
  ) {}
}
