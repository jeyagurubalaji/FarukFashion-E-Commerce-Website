/**
 * API base — matches api.js (VITE_API_URL or default Render URL)
 */
export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://farukfashion-e-commerce-web.onrender.com/api'
).replace(/\/$/, '');

/** Origin without trailing /api */
export const API_ORIGIN = API_BASE.replace(/\/api$/, '');

/**
 * Fix image paths on Vercel:
 * /api/uploads/xxx → https://your-backend.onrender.com/api/uploads/xxx
 */
export function mediaUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  if (url.startsWith('/api/')) {
    return `${API_ORIGIN}${url}`;
  }
  if (url.startsWith('/uploads/')) {
    return `${API_ORIGIN}/api${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_ORIGIN}/api/${url}`;
  }
  if (!url.startsWith('/')) {
    return `${API_ORIGIN}/api/uploads/${url}`;
  }
  return url;
}