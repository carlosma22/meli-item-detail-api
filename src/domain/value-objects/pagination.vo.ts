/**
 * Value Object que representa la información de paginación.
 * Es inmutable y se auto-valida para garantizar valores consistentes.
 * 
 * Se utiliza para paginar resultados de búsquedas y listados.
 */
export class Pagination {
  /**
   * Constructor del Value Object Pagination.
   * 
   * @param page - Número de página actual (debe ser >= 1)
   * @param limit - Cantidad de items por página (entre 1 y 100)
   * @param total - Cantidad total de items disponibles
   * 
   * @throws Error si los valores no cumplen las reglas de negocio
   */
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly total: number,
  ) {
    this.validate();
  }

  /**
   * Valida las reglas de negocio del value object.
   * 
   * @throws Error si page < 1, limit no está entre 1-100, o total < 0
   */
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

  /**
   * Calcula el número total de páginas basado en el total de items y el límite.
   * 
   * @returns Número total de páginas (redondeado hacia arriba)
   */
  getTotalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  /**
   * Calcula el offset (desplazamiento) para consultas de base de datos.
   * 
   * @returns Número de items a saltar antes de la página actual
   * @example Para page=2 y limit=10, retorna 10 (saltar los primeros 10 items)
   */
  getOffset(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Determina si existe una página siguiente.
   * 
   * @returns true si la página actual es menor al total de páginas
   */
  hasNextPage(): boolean {
    return this.page < this.getTotalPages();
  }

  /**
   * Determina si existe una página anterior.
   * 
   * @returns true si la página actual es mayor a 1
   */
  hasPreviousPage(): boolean {
    return this.page > 1;
  }

  /**
   * Convierte el value object a un objeto plano para serialización.
   * 
   * @returns Objeto con toda la información de paginación incluyendo valores calculados
   */
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
