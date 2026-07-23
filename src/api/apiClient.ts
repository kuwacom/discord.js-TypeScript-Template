import { createApiResultError, isApiResultError } from '@lib/apiError';
import logger from '@/services/logger';
import type { paths } from '@/types/generated/openapi';
import createClient from 'openapi-fetch';

interface APIClientConfig {
  baseUrl: string;
  internalToken?: string;
  timeout?: number;
}

interface RequestOptions<TBody = unknown> {
  headers?: Record<string, string>;
  timeout?: number;
  body?: TBody;
}

const sensitiveHeaderNames = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-internal-token',
]);

// ログ出力時にセンシティブヘッダーを [REDACTED] 化する
function maskHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      sensitiveHeaderNames.has(key.toLowerCase()) ? '[REDACTED]' : value,
    ]),
  );
}

/**
 * # APIClient
 * 外部 API を呼ぶための共通クライアント
 *
 * ### 2つのリクエスト経路
 * - `get` / `post` / `put` / `delete` / `patch`
 *   → `request()` 経由で openapi-fetch を使う（OpenAPI 定義にあるパス・型安全）
 * - `getUrl` / `postUrl` / `putUrl` / `deleteUrl` / `patchUrl`
 *   → `requestUrl()` 経由で生 fetch を使う（OpenAPI 定義にない外部 API 向け）
 *
 * ### 共通機能
 * - Bearer トークン / X-Internal-Token による認証
 * - AbortController によるタイムアウト制御（デフォルト 5000ms）
 * - センシティブヘッダーのログマスク
 * - エラー時は throw ApiResultError、成功時は data を返す
 */
export class APIClient {
  private userToken: string | null = null;
  private readonly config: APIClientConfig;
  private readonly client: ReturnType<typeof createClient<paths>>;

  constructor(config: APIClientConfig) {
    this.config = config;
    this.client = createClient<paths>({
      baseUrl: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /** ユーザートークンの設定 / Authorization: Bearer に使用 */
  setUserToken(token: string | null): void {
    this.userToken = token;
  }

  // 認証ヘッダーを含むリクエスト用ヘッダーを構築する
  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      ...options?.headers,
    };

    if (this.config.internalToken) {
      headers['X-Internal-Token'] = this.config.internalToken;
    }
    if (this.userToken) {
      headers['Authorization'] = `Bearer ${this.userToken}`;
    }

    return headers;
  }

  // ApiResultError 以外の予期しないエラーを共通フォーマットへ変換する
  private handleUnexpectedError(
    error: unknown,
    method: string,
    pathOrUrl: string,
    timeout: number,
  ): never {
    if (isApiResultError(error)) {
      throw error;
    }

    logger.error(`API Request Failed: ${method} ${pathOrUrl}`, error);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }

    throw new Error('Network error: unknown error');
  }

  // openapi-fetch 経路: OpenAPI 定義にあるパスを型安全に呼ぶ
  private async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    const timeout = options?.timeout || this.config.timeout || 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = this.buildHeaders(options);

      logger.debug(`== API Request ==\n${method} ${path}`, {
        headers: maskHeaders(headers),
      });

      const requestMethod = this.client[method as keyof typeof this.client] as unknown as (
        targetPath: string,
        requestOptions: {
          body?: unknown;
          headers: Record<string, string>;
          signal: AbortSignal;
        },
      ) => Promise<{
        data?: unknown;
        error?: unknown;
        response: {
          status: number;
        };
      }>;

      const response = await requestMethod(path, {
        ...(options?.body !== undefined && { body: options.body }),
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.error) {
        logger.warn(`API Error: ${method} ${path}`, {
          status: response.response.status,
          error: response.error,
        });

        throw createApiResultError(
          response.response.status,
          response.error,
          `API Error: ${response.response.status}`,
        );
      }

      logger.debug(`API Success: ${method} ${path}`);
      return response.data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      this.handleUnexpectedError(error, method, path, timeout);
    }
  }

  // 生 fetch 経路 OpenAPI 定義にない外部 API を絶対 URL で呼ぶ
  private async requestUrl<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    options?: RequestOptions,
  ): Promise<T> {
    const timeout = options?.timeout || this.config.timeout || 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = this.buildHeaders(options);

      logger.debug(`== External API Request ==\n${method} ${url}`, {
        headers: maskHeaders(headers),
      });

      const response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
        ...(options?.body !== undefined && {
          body: this.formatBody(options.body, headers['Content-Type'], true) as
            | string
            | FormData
            | URLSearchParams
            | undefined,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // レスポンスボディを JSON としてパース試行、失敗時はテキスト
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          body = await response.text();
        }

        logger.warn(`External API Error: ${method} ${url}`, {
          status: response.status,
          body,
        });

        throw createApiResultError(response.status, body, `API Error: ${response.status}`);
      }

      // 204 No Content 等を考慮
      const contentType = response.headers.get('content-type');
      let data: unknown;
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      logger.debug(`External API Success: ${method} ${url}`);
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      this.handleUnexpectedError(error, method, url, timeout);
    }
  }

  // --- openapi-fetch 経路（OpenAPI 定義にあるパス向け） ---

  async get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<T = unknown, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<T> {
    return this.request<T>('POST', path, {
      ...options,
      body: this.formatBody(body, options?.headers?.['Content-Type'], false),
    });
  }

  async put<T = unknown, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<T> {
    return this.request<T>('PUT', path, {
      ...options,
      body: this.formatBody(body, options?.headers?.['Content-Type'], false),
    });
  }

  async delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  async patch<T = unknown, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<T> {
    return this.request<T>('PATCH', path, {
      ...options,
      body: this.formatBody(body, options?.headers?.['Content-Type'], false),
    });
  }

  // 生 fetch 経路（OpenAPI 定義にない外部 API 向け）

  async getUrl<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return this.requestUrl<T>('GET', url, options);
  }

  async postUrl<T = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<T> {
    return this.requestUrl<T>('POST', url, {
      ...options,
      body: this.formatBody(body, options?.headers?.['Content-Type'], true),
    });
  }

  async putUrl<T = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<T> {
    return this.requestUrl<T>('PUT', url, {
      ...options,
      body: this.formatBody(body, options?.headers?.['Content-Type'], true),
    });
  }

  async deleteUrl<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return this.requestUrl<T>('DELETE', url, options);
  }

  async patchUrl<T = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptions<TBody>,
  ): Promise<T> {
    return this.requestUrl<T>('PATCH', url, {
      ...options,
      body: this.formatBody(body, options?.headers?.['Content-Type'], true),
    });
  }

  // Content-Type に応じてリクエストボディを適切な形式に変換する
  // stringifyJson=true の場合は JSON ボディを文字列化する（生 fetch 経路用）
  private formatBody<TBody>(
    body: TBody | undefined,
    contentType?: string,
    stringifyJson = false,
  ): unknown {
    if (body == null) return undefined;

    switch (contentType) {
      case 'application/x-www-form-urlencoded':
        return new URLSearchParams(body as Record<string, string>).toString();
      case 'multipart/form-data': {
        const formData = new FormData();
        Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
          if (value instanceof Blob || typeof value === 'string') {
            formData.append(key, value);
            return;
          }
          formData.append(key, String(value));
        });
        return formData;
      }
      default:
        // openapi-fetch はオブジェクトをそのまま渡せるが、
        // 生 fetch は JSON を文字列化する必要がある
        return stringifyJson ? JSON.stringify(body) : body;
    }
  }
}
