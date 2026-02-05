export interface HttpClientPort {
  get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;
}

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;
}

export const HTTP_CLIENT_PORT = Symbol('HTTP_CLIENT_PORT');
