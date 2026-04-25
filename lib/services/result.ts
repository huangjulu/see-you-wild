/**
 * Discriminated union returned by service-layer commands.
 * Routes translate `ok` to a 2xx response and `fail` to an error response,
 * using the captured `status` to map directly to HTTP.
 */
export type ServiceSuccess<T> = { ok: true; value: T };
export type ServiceFailure = { ok: false; error: string; status: number };
export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

export const ok = <T>(value: T): ServiceSuccess<T> => ({ ok: true, value });

export const fail = (error: string, status: number): ServiceFailure => ({
  ok: false,
  error,
  status,
});
