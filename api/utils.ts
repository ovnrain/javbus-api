import { JAVBUS } from './constants.js'

export const PAGE_REG = /^[1-9]\d*$/

export function formatImageUrl(url?: string): string | undefined {
  return url && !url.startsWith('http') ? `${JAVBUS}${url}` : url
}
