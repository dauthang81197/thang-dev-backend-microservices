import {
    Controller,
    Get,
    Param,
    HttpStatus,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Body,
    Query,
    Res,
    StreamableFile,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import {
    ListBucketsCommand,
    HeadBucketCommand,
    PutObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import type { Response } from 'express';
import { Readable } from 'stream';
import { MinioService } from '../../services/minio.service';

@Controller('minio')
@ApiTags('minio')
export class MinioGatewayController {
    constructor(private readonly minioService: MinioService) { }

    @Get('buckets')
    @ApiOperation({ summary: 'List all buckets in MinIO' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bucket list retrieved successfully',
    })
    async listBuckets() {
        const result = await this.minioService.s3.send(new ListBucketsCommand({}));
        const buckets = (result.Buckets || []).map((bucket) => ({
            name: bucket.Name,
            createdAt: bucket.CreationDate,
        }));

        return {
            count: buckets.length,
            buckets,
        };
    }

    @Get('buckets/:name/exists')
    @ApiOperation({ summary: 'Check if a bucket exists in MinIO' })
    @ApiParam({ name: 'name', description: 'Bucket name' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bucket existence check result',
    })
    async bucketExists(@Param('name') name: string) {
        try {
            await this.minioService.s3.send(new HeadBucketCommand({ Bucket: name }));
            return { exists: true, name };
        } catch {
            return { exists: false, name };
        }
    }

    @Post('buckets/:name/upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a file to a MinIO bucket' })
    @ApiParam({ name: 'name', description: 'Bucket name' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                key: {
                    type: 'string',
                    description: 'Optional object key (filename) in bucket',
                },
            },
            required: ['file'],
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'File uploaded successfully',
    })
    async uploadFile(
        @Param('name') bucket: string,
        @UploadedFile() file: Multer.File,
        @Body('key') key?: string,
    ) {
        if (!file) {
            throw new BadRequestException('file is required');
        }

        const objectKey = key || file.originalname;

        const result = await this.minioService.s3.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: objectKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        return {
            bucket,
            key: objectKey,
            etag: result.ETag,
        };
    }

    @Get('buckets/:name/objects/*key')
    @ApiOperation({ summary: 'Get or download a file from MinIO' })
    @ApiParam({ name: 'name', description: 'Bucket name' })
    @ApiParam({ name: 'key', description: 'Object key (supports nested paths)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'File streamed successfully',
    })
    async getObject(
        @Param('name') bucket: string,
        @Param('key') key: string | string[],
        @Query('download') download: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const objectKey = Array.isArray(key) ? key.join('/') : key;
        if (!objectKey) {
            throw new BadRequestException('key is required');
        }

        const result = await this.minioService.s3.send(
            new GetObjectCommand({
                Bucket: bucket,
                Key: objectKey,
            }),
        );

        const contentType = result.ContentType || 'application/octet-stream';
        const isDownload = download === 'true' || download === '1';
        res.setHeader('Content-Type', contentType);
        res.setHeader(
            'Content-Disposition',
            `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(
                objectKey.split('/').pop() || 'file',
            )}"`,
        );

        const body = result.Body;
        if (!body) {
            throw new BadRequestException('Object body is empty');
        }

        const readable =
            body instanceof Readable
                ? body
                : Readable.fromWeb(body as unknown as any);

        return new StreamableFile(readable);
    }
}
