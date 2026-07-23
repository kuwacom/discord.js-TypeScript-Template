// クライアント側 API エラー定義

export const ErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  BAD_GATEWAY: 'BAD_GATEWAY',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// zod 非依存の汎用バリデーションエラー詳細型
// zod を使う場合は呼び出し元で .flatten().issues を渡せばよい
export type ValidationErrorDetails = Array<{
  path?: (string | number)[];
  message: string;
}>;

type ValidationErrorResponse = {
  code: typeof ErrorCode.VALIDATION_ERROR;
  message: string;
  details: ValidationErrorDetails;
};

export type ErrorResponse = {
  code: Exclude<ErrorCode, typeof ErrorCode.VALIDATION_ERROR>;
  message: string;
};

export type ApiErrorResponse = ValidationErrorResponse | ErrorResponse;

/**
 * # ApiResultError
 * API 共通エラーレスポンスをクライアント側で扱うための Error
 *
 * ### 特徴
 * - HTTP ステータスと API の code をまとめて扱える
 * - validation error の details を安全に参照できる
 */
export class ApiResultError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: ValidationErrorDetails;

  public constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: ValidationErrorDetails,
  ) {
    super(message);
    this.name = 'ApiResultError';
    this.status = status;
    this.code = code;
    this.details = code === ErrorCode.VALIDATION_ERROR ? details : undefined;
  }
}

/**
 * ### isApiResultError
 * 捕捉したエラーが ApiResultError かどうかを判定する
 *
 * @param err - 判定対象
 * @returns ApiResultError の場合 true
 */
export function isApiResultError(err: unknown): err is ApiResultError {
  return err instanceof ApiResultError;
}

/**
 * ### isErrorCode
 * 値が有効な ErrorCode かどうかを判定する
 *
 * @param code - 判定対象
 * @returns 有効な ErrorCode の場合 true
 */
export function isErrorCode(code: unknown): code is ErrorCode {
  return Object.values(ErrorCode).some((value) => value === code);
}

/**
 * ### isApiErrorResponse
 * オブジェクトが API エラーレスポンス形式かどうかを判定する
 *
 * @param data - 判定対象
 * @returns ApiErrorResponse の場合 true
 */
export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (data == null || typeof data !== 'object') {
    return false;
  }

  const candidate = data as {
    code?: unknown;
    details?: unknown;
    message?: unknown;
  };

  if (
    typeof candidate.code !== 'string' ||
    !isErrorCode(candidate.code) ||
    typeof candidate.message !== 'string'
  ) {
    return false;
  }

  if (candidate.code === ErrorCode.VALIDATION_ERROR) {
    return Array.isArray(candidate.details);
  }

  return true;
}

/**
 * ### createApiResultError
 * API レスポンスから ApiResultError を生成する
 * レスポンスが ApiErrorResponse 形式でなければ INTERNAL_SERVER_ERROR でフォールバック
 *
 * @param status - HTTP ステータスコード
 * @param data - レスポンスボディ
 * @param fallbackMessage - 形式不明時のフォールバックメッセージ
 * @returns ApiResultError
 */
export function createApiResultError(
  status: number,
  data: unknown,
  fallbackMessage: string,
): ApiResultError {
  if (isApiErrorResponse(data)) {
    const code = data.code as ErrorCode;

    return new ApiResultError(
      status,
      code,
      data.message,
      code === ErrorCode.VALIDATION_ERROR ? (data as ValidationErrorResponse).details : undefined,
    );
  }

  return new ApiResultError(status, ErrorCode.INTERNAL_SERVER_ERROR, fallbackMessage);
}
