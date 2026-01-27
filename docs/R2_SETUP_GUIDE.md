# R2 Setup Guide - Cloudflare R2 for Video Storage

## Prerequisites

- Cloudflare account
- Access to Cloudflare Dashboard

## Step 1: Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the sidebar
3. Click **Create Bucket**
4. Enter bucket name: `course-videos` (or your preference)
5. Click **Create Bucket**

## Step 2: Generate API Tokens

1. In R2 section, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Configure token:
   - **Token Name**: `course-service-token`
   - **Permissions**: Object Read & Write
   - **Bucket**: Select `course-videos` or All buckets
4. Click **Create API Token**
5. **IMPORTANT**: Copy these values immediately (shown only once):
   - Access Key ID
   - Secret Access Key
   - Account ID (found in R2 overview page)

## Step 3: Configure Environment Variables

Add to your `.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=course-videos
R2_PUBLIC_URL=https://your-domain.r2.dev
```

### Getting Your Account ID:

1. In Cloudflare Dashboard, go to **R2**
2. Look at the breadcrumb or URL
3. Your account ID is in the format: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Optional: Public URL Setup

If you want public access (not recommended for paid content):

1. In R2 bucket settings, enable **Public Access**
2. Configure custom domain:
   - Go to bucket **Settings**
   - Click **Add Custom Domain**
   - Enter your domain: `videos.yourdomain.com`
   - Configure DNS as instructed
   - Use this domain as `R2_PUBLIC_URL`

## Step 4: Test Connection

Create a test script:

```typescript
// test-r2.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function testUpload() {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: 'test.txt',
      Body: 'Hello R2!',
    });

    await client.send(command);
    console.log('✅ R2 connection successful!');
  } catch (error) {
    console.error('❌ R2 connection failed:', error);
  }
}

testUpload();
```

Run test:

```bash
npx ts-node test-r2.ts
```

## Security Best Practices

### 1. Never Commit Credentials

Add to `.gitignore`:

```
.env
.env.local
.env.*.local
```

### 2. Use Presigned URLs

For video access, always use presigned URLs (already implemented):

```typescript
const url = await r2StorageService.getPresignedUrl(videoKey, 3600); // 1 hour
```

### 3. Restrict CORS (Optional)

In R2 bucket settings, configure CORS:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. Use IAM-like Token Permissions

Create separate tokens for:

- **Write-only**: For upload service
- **Read-only**: For playback service
- **Admin**: For full management

## Cost Estimation

Cloudflare R2 pricing (as of 2024):

- **Storage**: $0.015 / GB / month
- **Class A Operations** (writes): $4.50 / million requests
- **Class B Operations** (reads): $0.36 / million requests
- **Egress**: FREE (unlike S3)

Example for 1000 courses:

- 1000 videos × 500MB = 500 GB
- Monthly cost: 500 × $0.015 = **$7.50/month**
- Plus operational costs (very minimal)

## Troubleshooting

### Error: "Access Denied"

- Check API token has correct permissions
- Verify bucket name matches
- Ensure token is active (not expired)

### Error: "NoSuchBucket"

- Verify bucket name in environment variable
- Check bucket exists in Cloudflare Dashboard
- Ensure account ID is correct

### Error: "SignatureDoesNotMatch"

- Verify Access Key ID and Secret Access Key
- Check for extra spaces in environment variables
- Ensure credentials haven't been rotated

### Slow Uploads

- Check network connection
- Consider using multipart uploads for files >100MB
- Verify closest R2 region

## Advanced Configuration

### Multipart Upload (for large files)

```typescript
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';

// For files > 100MB, use multipart upload
// Implementation example in R2StorageService
```

### Lifecycle Policies

Set up automatic deletion of old videos:

1. Go to bucket settings
2. Add **Lifecycle Rule**
3. Configure: Delete objects older than X days

### R2 Analytics

Monitor usage:

1. In Cloudflare Dashboard → R2
2. Click your bucket
3. View **Analytics** tab for:
   - Storage usage
   - Request counts
   - Bandwidth

## Integration with CDN

For faster global delivery:

1. Create Cloudflare Worker:

```javascript
// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    const object = await env.MY_BUCKET.get(key);
    if (!object) return new Response('Not Found', { status: 404 });

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata.contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
};
```

2. Bind R2 bucket to Worker
3. Deploy and use Worker URL as CDN

## Backup Strategy

1. **Enable R2 Versioning** (if available)
2. **Set up sync to S3** for disaster recovery:

```bash
# Using rclone
rclone sync r2:course-videos s3:backup-bucket
```

## Monitoring

Add health check endpoint:

```typescript
@Get('health/r2')
async checkR2Health() {
  try {
    const exists = await this.r2StorageService.fileExists('health-check.txt');
    return { status: 'healthy', r2: 'connected' };
  } catch (error) {
    return { status: 'unhealthy', r2: 'disconnected', error: error.message };
  }
}
```

## Migration from S3

If migrating from AWS S3:

```bash
# Using AWS CLI
aws s3 sync s3://old-bucket s3://course-videos \
  --endpoint-url https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
```

## Resources

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [S3-compatible API Reference](https://developers.cloudflare.com/r2/api/s3/api/)

## Summary Checklist

✅ Create R2 bucket in Cloudflare Dashboard
✅ Generate API tokens with proper permissions
✅ Add credentials to `.env` file
✅ Never commit credentials to git
✅ Test connection with test script
✅ Configure CORS if needed
✅ Set up monitoring and alerts
✅ Plan backup strategy
✅ Consider CDN integration for global reach

Your R2 setup is now complete and ready for production use!
