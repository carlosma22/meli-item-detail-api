/**
 * Value Object que encapsula los parámetros de búsqueda.
 * Es inmutable y se auto-valida para garantizar consultas válidas.
 * 
 * Permite búsquedas vacías (query='') para retornar todos los items.
 */
export class SearchQuery {
  /**
   * Constructor del Value Object SearchQuery.
   * 
   * @param query - Término de búsqueda (puede estar vacío para retornar todos los items)
   * @param page - Número de página (default: 1)
   * @param limit - Cantidad de resultados por página (default: 10, max: 100)
   * 
   * @throws Error si los parámetros no cumplen las reglas de negocio
   */
  constructor(
    public readonly query: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {
    this.validate();
  }

  /**
   * Valida las reglas de negocio de la búsqueda.
   * - Query puede estar vacío (retorna todos los items)
   * - Si query tiene contenido, debe tener al menos 2 caracteres
   * - Page debe ser >= 1
   * - Limit debe estar entre 1 y 100
   * 
   * @throws Error si alguna validación falla
   */
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

  /**
   * Calcula el offset para paginación.
   * 
   * @returns Número de items a saltar (skip) en la consulta
   */
  getOffset(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Convierte el value object a un objeto plano.
   * Útil para logging y serialización.
   * 
   * @returns Objeto con los parámetros de búsqueda incluyendo offset calculado
   */
  toObject() {
    return {
      query: this.query ? this.query.trim() : '',
      page: this.page,
      limit: this.limit,
      offset: this.getOffset(),
    };
  }
}
