import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HttpClientPort, HttpRequestConfig } from '@domain/ports/outbound/http-client.port';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class AxiosHttpClientAdapter implements HttpClientPort {
  private readonly logger = new Logger(AxiosHttpClientAdapter.name);

  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    try {
      this.logger.debug(`GET request to: ${url}`);
      
      const axiosConfig: AxiosRequestConfig = {
        headers: config?.headers,
        params: config?.params,
        timeout: config?.timeout || 10000,
      };

      const response = await firstValueFrom(
        this.httpService.get<T>(url, axiosConfig),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`HTTP GET error for ${url}: ${error}`);
      throw error;
    }
  }

  async post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    try {
      this.logger.debug(`POST request to: ${url}`);
      
      const axiosConfig: AxiosRequestConfig = {
        headers: config?.headers,
        params: config?.params,
        timeout: config?.timeout || 10000,
      };

      const response = await firstValueFrom(
        this.httpService.post<T>(url, data, axiosConfig),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`HTTP POST error for ${url}: ${error}`);
      throw error;
    }
  }
}
