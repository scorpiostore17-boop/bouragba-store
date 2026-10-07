import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists as a robust fallback
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer memory storage for direct streaming to Cloudinary
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('الملف المحدد ليس صورة صالحة. يرجى اختيار ملف صورة.'));
    }
  }
});

/**
 * Get Cloudinary client with credentials dynamically fetched
 * from SQLite settings or process.env
 */
export function getCloudinaryConfig() {
  const settingsRows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'cloudinary_%'").all();
  const settingsMap = Object.fromEntries(settingsRows.map(r => [r.key, r.value]));

  const cloud_name = settingsMap.cloudinary_cloud_name || process.env.CLOUDINARY_CLOUD_NAME || '';
  const api_key = settingsMap.cloudinary_api_key || process.env.CLOUDINARY_API_KEY || '';
  const api_secret = settingsMap.cloudinary_api_secret || process.env.CLOUDINARY_API_SECRET || '';

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true
    });
    return { isConfigured: true, cloud_name };
  }

  return { isConfigured: false, cloud_name: '' };
}

/**
 * Upload a buffer to Cloudinary or save locally if not configured
 */
export async function uploadImageBuffer(buffer, originalFilename = 'product.jpg') {
  const { isConfigured } = getCloudinaryConfig();

  if (isConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'bouragba_store/products',
          resource_type: 'image',
          format: 'webp',
          quality: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              source: 'cloudinary'
            });
          }
        }
      );
      uploadStream.end(buffer);
    });
  } else {
    // Graceful fallback to local public/uploads directory
    const cleanExt = path.extname(originalFilename) || '.jpg';
    const filename = `product-${Date.now()}-${Math.round(Math.random() * 1e4)}${cleanExt}`;
    const targetPath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(targetPath, buffer);

    return {
      url: `/uploads/${filename}`,
      public_id: filename,
      source: 'local',
      notice: 'تم الحفظ محلياً. لربط Cloudinary سحابياً بالكامل، يرجى ملء بيانات Cloudinary في إعدادات لوحة التحكم.'
    };
  }
}

export default cloudinary;
