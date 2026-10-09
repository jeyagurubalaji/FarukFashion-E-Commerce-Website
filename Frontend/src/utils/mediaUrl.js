import { cloudinaryDisplay } from './cloudinary';

export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://farukfashion-e-commerce-web.onrender.com/api'
).replace(/\/$/, '');

export const API_ORIGIN = API_BASE.replace(/\/api$/, '');

/**
 * @param {string} url
 * @param {number} [width=600] - used for Cloudinary optimization
 */
export function mediaUrl(url, width = 600) {
  if (!url) return '';

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    if (url.includes('res.cloudinary.com')) {
      return cloudinaryDisplay(url, width);
    }
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