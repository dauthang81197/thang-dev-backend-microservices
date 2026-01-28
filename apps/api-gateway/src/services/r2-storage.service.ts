import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { ENVIRONMENT } from '../../env/environment';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    // Load from environment configuration
    const config = ENVIRONMENT.r2;

    this.logger.log(
      'R2 Config:',
      JSON.stringify({
        accountId: config.accountId.substring(0, 8) + '...',
        bucketName: config.bucketName,
        hasAccessKey: !!config.accessKeyId,
        hasSecretKey: !!config.secretAccessKey,
      }),
    );

    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;

    // Initialize S3 client for Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.logger.log('R2 Storage Service initialized in API Gateway');
  }

  /**
   * Upload file to R2
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
      this.logger.error('Error uploading file to R2', error);
      throw new Error('Failed to upload file to R2');
    }
  }

  /**
   * Delete file from R2
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
      this.logger.error('Error deleting file from R2', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get presigned URL for temporary access
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error('Error generating presigned URL', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Get public URL
   */
  getPublicUrl(key: string): string {
    if (!this.publicUrl) {
      throw new Error('Public URL not configured');
    }
    return `${this.publicUrl}/${key}`;
  }
}
