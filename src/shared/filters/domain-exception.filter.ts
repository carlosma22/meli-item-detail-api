import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  ItemNotFoundException,
  ItemDescriptionNotFoundException,
  InvalidSearchQueryException,
} from '@domain/exceptions/domain.exception';

/**
 * Filtro global de excepciones para manejar errores de dominio.
 * 
 * Este filtro intercepta todas las excepciones que heredan de DomainException
 * y las convierte en respuestas HTTP apropiadas.
 * 
 * Mapeo de excepciones:
 * - ItemNotFoundException → 404 Not Found
 * - ItemDescriptionNotFoundException → 404 Not Found
 * - InvalidSearchQueryException → 400 Bad Request
 * - Otras DomainException → 500 Internal Server Error
 * 
 * Implementa el patrón de manejo centralizado de errores.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  /**
   * Método que intercepta y maneja las excepciones de dominio.
   * 
   * @param exception - Excepción de dominio lanzada
   * @param host - Contexto de ejecución de NestJS
   */
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Determinar el código HTTP según el tipo de excepción
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      exception instanceof ItemNotFoundException ||
      exception instanceof ItemDescriptionNotFoundException
    ) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof InvalidSearchQueryException) {
      status = HttpStatus.BAD_REQUEST;
    }

    // Construir respuesta de error estandarizada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      error: exception.name,
    };

    // Registrar el error con stack trace
    this.logger.error(`${exception.name}: ${exception.message}`, exception.stack);

    // Enviar respuesta HTTP
    response.status(status).json(errorResponse);
  }
}
