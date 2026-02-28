import { JAVBUS } from './constants.js';

export const PAGE_REG = /^[1-9]\d*$/;

export function formatImageUrl(url?: string) {
  return url && !url.startsWith('http') ? `${JAVBUS}${url}` : url;
}
