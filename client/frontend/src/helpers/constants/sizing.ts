export const SHOW_HEADER_NAVIGATION_WIDTH = 800;
export const SHOW_DISCOVERY_SIDEBAR_WIDTH = 1170;

export const CACHE_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8003'
    : 'https://www.cache.rootshare.io';
