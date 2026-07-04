export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AccessTokenOnly {
  access_token: string;
  token_type: string;
}

export interface ApiErrorBody {
  detail?: string | { msg: string; loc?: (string | number)[] }[];
}

/** Backend'den dönen hata mesajını okunabilir tek bir string'e indirger. */
export function extractErrorMessage(body: unknown, fallback: string): string {
  const detail = (body as ApiErrorBody | undefined)?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) return detail[0].msg ?? fallback;
  return fallback;
}
