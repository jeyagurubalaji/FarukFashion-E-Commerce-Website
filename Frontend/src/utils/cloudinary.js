const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/** Upload one file → full original on Cloudinary (secure_url) */
export async function uploadToCloudinary(file) {
  if (!CLOUD || !PRESET) {
    throw new Error('Cloudinary not configured (check .env)');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', PRESET);
  form.append('folder', 'faruk-fashion');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }
  const data = await res.json();
  return data.secure_url;
}

/** Fast display URL: auto format + quality + max width */
export function cloudinaryDisplay(url, width = 600) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_auto') || url.includes('/upload/w_')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
}