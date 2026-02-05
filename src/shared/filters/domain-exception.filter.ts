import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  ItemNotFoundException,
  ItemDescriptionNotFoundException,
  InvalidSearchQueryException,
} from '@domain/exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      exception instanceof ItemNotFoundException ||
      exception instanceof ItemDescriptionNotFoundException
    ) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof InvalidSearchQueryException) {
      status = HttpStatus.BAD_REQUEST;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      error: exception.name,
    };

    this.logger.error(`${exception.name}: ${exception.message}`, exception.stack);

    response.status(status).json(errorResponse);
  }
}
