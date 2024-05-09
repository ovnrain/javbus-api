import { ZodError } from 'zod';
import { HTTPError, RequestError, TimeoutError } from 'got';
import { JAVBUS } from './constants';

export const PAGE_REG = /^[1-9]\d*$/;

export function formatImageUrl(url?: string) {
  return url && !/^http/.test(url) ? `${JAVBUS}${url}` : url;
}

export function handleRouteError(e: unknown) {
  let errorResponse: Record<string, unknown> = {};
  let status: number;

  if (e instanceof ZodError) {
    errorResponse = {
      error: 'Query is invalid',
      errors: e.errors,
    };
    status = 400;
  } else if (e instanceof RequestError || e instanceof HTTPError || e instanceof TimeoutError) {
    errorResponse = { error: e.message };
    status = e.response?.statusCode ?? 500;
  } else if (e instanceof Error) {
    errorResponse = { error: e.message };
    status = 500;
  } else {
    errorResponse = { error: 'Unknown error' };
    status = 500;
  }

  return { errorResponse, status };
}
