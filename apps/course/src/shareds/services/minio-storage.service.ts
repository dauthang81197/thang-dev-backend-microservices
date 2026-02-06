import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioStorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    // Cấu hình MinIO từ environment variables
    const minioConfig = {
      endpoint: process.env.MINIO_ENDPOINT || 'https://storage.thanghub.com',
      accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
      secretAccessKey: process.env.MINIO_SECRET_KEY || 'Admin@123',
      bucketName: process.env.MINIO_BUCKET_NAME || 'myfile',
      publicUrl:
        process.env.MINIO_PUBLIC_URL || 'https://storage.thanghub.com/myfile',
    };

    this.bucketName = minioConfig.bucketName;
    this.publicUrl = minioConfig.publicUrl;

    // Initialize S3 client cho MinIO
    this.s3Client = new S3Client({
      endpoint: minioConfig.endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: minioConfig.accessKeyId,
        secretAccessKey: minioConfig.secretAccessKey,
      },
      forcePathStyle: true, // QUAN TRỌNG với MinIO
    });

    this.logger.log('MinIO Storage Service initialized in Course Service');
  }

  /**
   * Upload file to MinIO
   * @param file - File buffer
   * @param originalName - Original filename
   * @param mimeType - MIME type
   * @param folder - Folder path (e.g., 'videos', 'thumbnails')
   * @returns Object key in MinIO
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'videos',
  ): Promise<string> {
    try {
      const fileExtension = originalName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      this.logger.log(`File uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      this.logger.error('Error uploading file to MinIO', error);
      throw new Error('Failed to upload file to MinIO');
    }
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error('Error deleting file from MinIO', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get presigned URL for temporary access
   * @param key - Object key
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Presigned URL
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      console.log(command, 'fjlas');
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      console.log(url, ':fjlas');
      return url;
    } catch (error) {
      this.logger.error('Error generating presigned URL', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Get public URL (if bucket is public)
   */
  getPublicUrl(key: string): string {
    if (!this.publicUrl) {
      throw new Error('Public URL not configured');
    }
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
}
