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
  // If Cloudinary credentials are not configured, return a mock/data URL for offline resilience
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    const base64 = buffer.toString('base64');
    const mockUrl = `data:image/jpeg;base64,${base64}`;
    return {
      url: mockUrl,
      publicId: `local-mock-${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload to Cloudinary failed'));
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
