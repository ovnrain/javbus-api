import { JAVBUS } from './constants';

export const PAGE_REG = /^[1-9]\d*$/;

export function formatImageUrl(url?: string) {
  return url && !/^http/.test(url) ? `${JAVBUS}${url}` : url;
}
