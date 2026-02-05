import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class MinioService {
    public s3: S3Client;

    constructor() {
        this.s3 = new S3Client({
            endpoint: 'http://192.168.50.22:9000', // đổi IP nếu server khác
            region: 'us-east-1',
            credentials: {
                accessKeyId: 'admin',
                secretAccessKey: 'Admin@123',
            },
            forcePathStyle: true, // QUAN TRỌNG với MinIO
        });
    }
}
