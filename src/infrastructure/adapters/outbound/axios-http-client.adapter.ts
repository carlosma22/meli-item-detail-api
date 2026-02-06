import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HttpClientPort, HttpRequestConfig } from '@domain/ports/outbound/http-client.port';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

/**
 * Adaptador de salida (Outbound Adapter) que implementa el puerto HTTP Client.
 * 
 * Proporciona una abstracción sobre Axios para realizar llamadas HTTP.
 * Este adaptador permite cambiar la librería HTTP (ej: a Fetch API)
 * sin afectar el dominio o la lógica de aplicación.
 * 
 * Usado principalmente por el DataSeederService para cargar datos
 * desde la API de MercadoLibre al iniciar la aplicación.
 */
@Injectable()
export class AxiosHttpClientAdapter implements HttpClientPort {
  private readonly logger = new Logger(AxiosHttpClientAdapter.name);

  /**
   * Constructor con inyección del HttpService de NestJS.
   * 
   * @param httpService - Servicio HTTP basado en Axios
   */
  constructor(private readonly httpService: HttpService) {}

  /**
   * Realiza una petición HTTP GET.
   * 
   * Convierte el Observable de Axios a Promise usando firstValueFrom.
   * Incluye timeout por defecto de 10 segundos.
   * 
   * @param url - URL completa del endpoint
   * @param config - Configuración opcional (headers, params, timeout)
   * @returns Datos de la respuesta deserializados
   * @throws Error si la petición falla
   */
  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    try {
      this.logger.debug(`GET request to: ${url}`);

      const axiosConfig: AxiosRequestConfig = {
        headers: config?.headers,
        params: config?.params,
        timeout: config?.timeout || 10000,
      };

      const response = await firstValueFrom(this.httpService.get<T>(url, axiosConfig));

      return response.data;
    } catch (error) {
      this.logger.error(`HTTP GET error for ${url}: ${error}`);
      throw error;
    }
  }

  /**
   * Realiza una petición HTTP POST.
   * 
   * @param url - URL completa del endpoint
   * @param data - Datos a enviar en el body (serializados automáticamente)
   * @param config - Configuración opcional (headers, params, timeout)
   * @returns Datos de la respuesta deserializados
   * @throws Error si la petición falla
   */
  async post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    try {
      this.logger.debug(`POST request to: ${url}`);

      const axiosConfig: AxiosRequestConfig = {
        headers: config?.headers,
        params: config?.params,
        timeout: config?.timeout || 10000,
      };

      const response = await firstValueFrom(this.httpService.post<T>(url, data, axiosConfig));

      return response.data;
    } catch (error) {
      this.logger.error(`HTTP POST error for ${url}: ${error}`);
      throw error;
    }
  }
}
