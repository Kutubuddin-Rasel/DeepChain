import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CloudinaryUploadResult } from '../interfaces/cloudinary.interface';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.logger.log('Cloudinary configured successfully');
    } else {
      this.logger.warn(
        'Cloudinary credentials not provided — image upload will not work',
      );
    }
  }

  async uploadImage(
    fileBuffer: Buffer,
    folder: string = 'foodio/menu-items',
  ): Promise<CloudinaryUploadResult> {
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' },
          ],
        },
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed', error?.message);
            reject(error ?? new Error('Upload returned no result'));
            return;
          }
          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      this.logger.error(
        `Failed to delete image ${publicId}`,
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  extractPublicId(cloudinaryUrl: string): string | null {
    try {
      const urlParts = cloudinaryUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex === -1) return null;

      // Skip version number (e.g., v1234567890)
      const pathAfterUpload = urlParts.slice(uploadIndex + 2);
      const fileWithExtension = pathAfterUpload.join('/');
      const publicId = fileWithExtension.replace(/\.[^/.]+$/, '');
      return publicId;
    } catch {
      return null;
    }
  }
}
