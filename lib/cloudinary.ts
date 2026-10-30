import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadStreamToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const isConfigured =
    cloudName &&
    cloudName !== 'demo-cloud' &&
    apiKey &&
    apiKey !== '123456789012345' &&
    apiSecret &&
    !apiSecret.startsWith('abcdef');

  // If Cloudinary credentials are dummy or missing, use base64 data URI
  if (!isConfigured) {
    const base64 = buffer.toString('base64');
    return {
      url: `data:image/jpeg;base64,${base64}`,
      publicId: `local-data-${Date.now()}`,
    };
  }

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          console.warn('Cloudinary upload failed, falling back to data URL:', error?.message);
          const base64 = buffer.toString('base64');
          resolve({
            url: `data:image/jpeg;base64,${base64}`,
            publicId: `local-fallback-${Date.now()}`,
          });
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export default cloudinary;
