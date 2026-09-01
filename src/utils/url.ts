/**
 * Utility for handling URLs in hosted vs local offline standalone (file://) environments.
 */

/**
 * Utility for handling URLs in hosted vs local offline standalone (file://) environments.
 */

export function getLiveAppUrl(): string {
  const defaultUrl = 'https://ais-pre-gxe6atj2ki3wnb6t5p7nkr-71297047795.asia-southeast1.run.app';
  if (typeof window === 'undefined' || !window.location) {
    return defaultUrl;
  }
  const origin = window.location.origin;
  // If we are opened offline via file:// or run on localhost, yield the real production URL so links route correctly
  if (!origin || origin.startsWith('file:') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return defaultUrl;
  }
  // If the origin is a valid web URL
  const pathname = window.location.pathname && window.location.pathname !== '/' ? window.location.pathname.replace(/\/+$/, '') : '';
  return `${origin.replace(/\/+$/, '')}${pathname}`;
}

