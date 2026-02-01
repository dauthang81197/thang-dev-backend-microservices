# Transcription Service Integration Guide

## Overview
Python service quét bảng `lessons` để tìm video chưa có transcript, sau đó tự động transcribe và lưu kết quả.

## Database Tables

### 1. `lessons` (Source)
Chứa thông tin video:
```sql
SELECT id, "videoKey", duration, title
FROM lessons
WHERE "videoKey" IS NOT NULL
AND type = 'video';
```

### 2. `transcripts` (Target)
Lưu kết quả transcript:
```sql
-- Check lessons chưa có transcript
SELECT l.id, l."videoKey", l.title
FROM lessons l
LEFT JOIN transcripts t ON l.id = t."lessonId"
WHERE l."videoKey" IS NOT NULL
AND l.type = 'video'
AND t.id IS NULL;
```

**Columns:**
- `id` (uuid) - Transcript ID
- `lessonId` (uuid) - UNIQUE - Lesson ID
- `content` (text) - Full transcript text
- `segments` (jsonb) - Array timestamps: `[{start: 0, end: 5, text: "..."}, ...]`
- `language` (varchar) - vi, en, etc.
- `source` (varchar) - whisper, google, etc.
- `duration` (int) - Video duration
- `wordCount` (int) - Total words
- `createdAt`, `updatedAt`

## Workflow

### 1. Query Lessons Without Transcript
```python
import psycopg2

conn = psycopg2.connect("postgresql://...")
cursor = conn.cursor()

# Tìm lessons chưa có transcript
cursor.execute("""
    SELECT l.id, l."videoKey", l.title, l.duration
    FROM lessons l
    LEFT JOIN transcripts t ON l.id = t."lessonId"
    WHERE l."videoKey" IS NOT NULL
    AND l.type = 'video'
    AND t.id IS NULL
    LIMIT 10
""")

lessons = cursor.fetchall()
```

### 2. Generate R2 Presigned URL
```python
import boto3
from botocore.client import Config

# R2 Configuration
s3_client = boto3.client(
    's3',
    endpoint_url='https://<account-id>.r2.cloudflarestorage.com',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY',
    config=Config(signature_version='s3v4')
)

def get_video_url(video_key):
    return s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': 'your-bucket', 'Key': video_key},
        ExpiresIn=3600  # 1 hour
    )
```

### 3. Download Video & Transcribe
```python
import requests
import whisper
import os

model = whisper.load_model("base")

for lesson_id, video_key, title, duration in lessons:
    try:
        print(f"Processing: {title} (Lesson ID: {lesson_id})")
        
        # Generate presigned URL
        video_url = get_video_url(video_key)
        
        # Download video
        video_path = f"/tmp/{lesson_id}.mp4"
        response = requests.get(video_url, stream=True)
        with open(video_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Transcribe with Whisper
        result = model.transcribe(video_path)
        
        # Prepare segments
        segments = [
            {"start": seg["start"], "end": seg["end"], "text": seg["text"]}
            for seg in result["segments"]
        ]
        
        # Save transcript to database
        save_transcript(lesson_id, result, segments)
        
        # Cleanup
        os.remove(video_path)
        
        print(f"✅ Completed: {title}")
        
    except Exception as e:
        print(f"❌ Error processing {lesson_id}: {str(e)}")
        continue
```

### 4. Save Transcript to Database
```python
import json

def save_transcript(lesson_id, result, segments):
    cursor.execute("""
        INSERT INTO transcripts (
            id, "lessonId", content, segments, language, source, 
            duration, "wordCount", "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT ("lessonId") DO UPDATE SET
            content = EXCLUDED.content,
            segments = EXCLUDED.segments,
            duration = EXCLUDED.duration,
            "wordCount" = EXCLUDED."wordCount",
            "updatedAt" = NOW()
    """, (
        lesson_id,
        result["text"],
        json.dumps(segments),
        result["language"],
        "whisper",
        int(result.get("duration", 0)),
        len(result["text"].split())
    ))
    conn.commit()
```

## Complete Python Script

```python
#!/usr/bin/env python3
import psycopg2
import boto3
from botocore.client import Config
import requests
import whisper
import json
import os
import time

# Database Configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your_password",
    "database": "course_db"
}

# R2 Configuration
R2_CONFIG = {
    "endpoint_url": "https://<account-id>.r2.cloudflarestorage.com",
    "aws_access_key_id": "YOUR_ACCESS_KEY",
    "aws_secret_access_key": "YOUR_SECRET_KEY",
    "bucket": "your-bucket-name"
}

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=R2_CONFIG['endpoint_url'],
        aws_access_key_id=R2_CONFIG['aws_access_key_id'],
        aws_secret_access_key=R2_CONFIG['aws_secret_access_key'],
        config=Config(signature_version='s3v4')
    )

def get_video_url(s3_client, video_key):
    return s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': R2_CONFIG['bucket'], 'Key': video_key},
        ExpiresIn=3600
    )

def save_transcript(cursor, conn, lesson_id, result, segments):
    cursor.execute("""
        INSERT INTO transcripts (
            id, "lessonId", content, segments, language, source, 
            duration, "wordCount", "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
        )
        ON CONFLICT ("lessonId") DO UPDATE SET
            content = EXCLUDED.content,
            segments = EXCLUDED.segments,
            duration = EXCLUDED.duration,
            "wordCount" = EXCLUDED."wordCount",
            "updatedAt" = NOW()
    """, (
        lesson_id,
        result["text"],
        json.dumps(segments),
        result["language"],
        "whisper",
        int(result.get("duration", 0)),
        len(result["text"].split())
    ))
    conn.commit()

def main():
    # Connect to database
    conn = psycopg2.connect(**DB_CONFIG)
    s3_client = get_s3_client()
    
    # Load Whisper model
    print("Loading Whisper model...")
    model = whisper.load_model("base")
    
    while True:
        try:
            cursor = conn.cursor()
            
            # Find lessons without transcript
            cursor.execute("""
                SELECT l.id, l."videoKey", l.title, l.duration
                FROM lessons l
                LEFT JOIN transcripts t ON l.id = t."lessonId"
                WHERE l."videoKey" IS NOT NULL
                AND l.type = 'video'
                AND t.id IS NULL
                LIMIT 5
            """)
            
            lessons = cursor.fetchall()
            
            if not lessons:
                print("No lessons to process. Waiting 60 seconds...")
                time.sleep(60)
                continue
            
            print(f"\nFound {len(lessons)} lessons to transcribe")
            
            for lesson_id, video_key, title, duration in lessons:
                try:
                    print(f"\n📹 Processing: {title}")
                    print(f"   Lesson ID: {lesson_id}")
                    print(f"   Video Key: {video_key}")
                    
                    # Generate presigned URL
                    video_url = get_video_url(s3_client, video_key)
                    
                    # Download video
                    video_path = f"/tmp/{lesson_id}.mp4"
                    print("   Downloading video...")
                    response = requests.get(video_url, stream=True)
                    response.raise_for_status()
                    
                    with open(video_path, "wb") as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    # Transcribe
                    print("   Transcribing...")
                    result = model.transcribe(video_path, language="vi")
                    
                    # Prepare segments
                    segments = [
                        {
                            "start": float(seg["start"]),
                            "end": float(seg["end"]),
                            "text": seg["text"]
                        }
                        for seg in result["segments"]
                    ]
                    
                    # Save to database
                    print("   Saving transcript...")
                    save_transcript(cursor, conn, lesson_id, result, segments)
                    
                    # Cleanup
                    os.remove(video_path)
                    
                    print(f"   ✅ Completed: {len(result['text'].split())} words")
                    
                except Exception as e:
                    print(f"   ❌ Error: {str(e)}")
                    if os.path.exists(video_path):
                        os.remove(video_path)
                    continue
            
            cursor.close()
            print("\n✨ Batch completed. Waiting 30 seconds...")
            time.sleep(30)
            
        except KeyboardInterrupt:
            print("\n\n👋 Shutting down...")
            break
        except Exception as e:
            print(f"\n❌ Fatal error: {str(e)}")
            time.sleep(60)
    
    conn.close()

if __name__ == "__main__":
    main()
```

## Requirements

```txt
psycopg2-binary==2.9.9
openai-whisper==20231117
boto3==1.34.0
requests==2.31.0
```

## Environment Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables (optional)
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_NAME=course_db

export R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
export R2_ACCESS_KEY=your_access_key
export R2_SECRET_KEY=your_secret_key
export R2_BUCKET=your-bucket

# Run the script
python transcription_worker.py
```

## Query Transcript from Frontend

```sql
-- Get transcript for a lesson
SELECT content, segments, language, duration, "wordCount"
FROM transcripts
WHERE "lessonId" = 'lesson-uuid';

-- Get all lessons with transcripts
SELECT l.id, l.title, t.content, t."wordCount"
FROM lessons l
INNER JOIN transcripts t ON l.id = t."lessonId"
WHERE l.type = 'video';
```

## Notes

- Python tự động quét và xử lý lessons chưa có transcript
- Không cần bảng job riêng - đơn giản và trực tiếp
- Transcript unique per lesson - tự động update nếu chạy lại
- JSONB segments cho subtitle/timeline trên frontend
- Script chạy liên tục, tự động phát hiện video mới

## Database Tables

### 1. `transcription_jobs`
Quản lý các job cần xử lý:
```sql
SELECT * FROM transcription_jobs 
WHERE status IN ('pending', 'failed') 
ORDER BY created_at ASC 
LIMIT 10;
```

**Columns:**
- `id` (uuid) - Job ID
- `lessonId` (uuid) - Lesson ID
- `videoKey` (varchar) - R2 object key
- `videoUrl` (text) - Presigned URL để download (expires in 24h)
- `status` (enum) - pending | processing | completed | failed
- `retryCount` (int) - Số lần retry
- `errorMessage` (text) - Lỗi nếu có
- `processedAt` (timestamp) - Thời gian bắt đầu xử lý
- `completedAt` (timestamp) - Thời gian hoàn thành
- `createdAt`, `updatedAt`

### 2. `transcripts`
Lưu kết quả transcript:
```sql
INSERT INTO transcripts (
  id, lessonId, content, segments, language, source, duration, wordCount
) VALUES (...);
```

**Columns:**
- `id` (uuid) - Transcript ID
- `lessonId` (uuid) - UNIQUE - Lesson ID
- `content` (text) - Full transcript text
- `segments` (jsonb) - Array timestamps: `[{start: 0, end: 5, text: "..."}, ...]`
- `language` (varchar) - vi, en, etc.
- `source` (varchar) - whisper, google, etc.
- `duration` (int) - Video duration
- `wordCount` (int) - Total words

## Workflow

### 1. Poll for Pending Jobs (Python)
```python
import psycopg2

conn = psycopg2.connect("postgresql://...")
cursor = conn.cursor()

cursor.execute("""
    SELECT id, lessonId, videoKey, videoUrl, retryCount
    FROM transcription_jobs
    WHERE status IN ('pending', 'failed')
    AND retryCount < 3
    ORDER BY created_at ASC
    LIMIT 10
""")

jobs = cursor.fetchall()
```

### 2. Update Job Status to Processing
```python
cursor.execute("""
    UPDATE transcription_jobs
    SET status = 'processing', processed_at = NOW()
    WHERE id = %s
""", (job_id,))
conn.commit()
```

### 3. Download Video & Process
```python
import requests
import whisper

# Download video
response = requests.get(video_url, stream=True)
with open(f"/tmp/{video_key}", "wb") as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)

# Process with Whisper
model = whisper.load_model("base")
result = model.transcribe(f"/tmp/{video_key}")
```

### 4. Save Transcript
```python
import json

segments = [
    {"start": seg["start"], "end": seg["end"], "text": seg["text"]}
    for seg in result["segments"]
]

cursor.execute("""
    INSERT INTO transcripts (
        id, lessonId, content, segments, language, source, duration, wordCount
    ) VALUES (
        gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s
    )
    ON CONFLICT (lessonId) DO UPDATE SET
        content = EXCLUDED.content,
        segments = EXCLUDED.segments,
        duration = EXCLUDED.duration,
        wordCount = EXCLUDED.wordCount,
        updated_at = NOW()
""", (
    lesson_id,
    result["text"],
    json.dumps(segments),
    result["language"],
    "whisper",
    int(result.get("duration", 0)),
    len(result["text"].split())
))
conn.commit()
```

### 5. Mark Job as Completed
```python
cursor.execute("""
    UPDATE transcription_jobs
    SET status = 'completed', completed_at = NOW()
    WHERE id = %s
""", (job_id,))
conn.commit()
```

### 6. Handle Errors
```python
try:
    # ... processing ...
except Exception as e:
    cursor.execute("""
        UPDATE transcription_jobs
        SET status = 'failed',
            retry_count = retry_count + 1,
            error_message = %s
        WHERE id = %s
    """, (str(e), job_id))
    conn.commit()
```

## Microservice API Endpoints (Alternative)

Nếu không muốn truy cập trực tiếp database, có thể dùng API:

### Get Pending Jobs
```typescript
// Message: 'transcription.jobs.pending'
// Returns: Array of jobs with status 'pending' or 'failed'
```

### Start Job
```typescript
// Message: 'transcription.jobs.start'
// Payload: { jobId: string }
// Updates status to 'processing'
```

### Complete Job
```typescript
// Message: 'transcription.jobs.complete'
// Payload: { jobId: string }
// Updates status to 'completed'
```

### Fail Job
```typescript
// Message: 'transcription.jobs.fail'
// Payload: { jobId: string, errorMessage: string }
// Updates status to 'failed' and increments retryCount
```

### Save Transcript
```typescript
// Message: 'transcription.save'
// Payload: {
//   lessonId: string,
//   content: string,
//   segments?: Array<{start: number, end: number, text: string}>,
//   language?: string,
//   source?: string,
//   duration?: number,
//   wordCount?: number
// }
```

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=course_db
```

## Example Python Script

```python
#!/usr/bin/env python3
import psycopg2
import requests
import whisper
import json
import time
from datetime import datetime

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "your_password",
    "database": "course_db"
}

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    model = whisper.load_model("base")
    
    while True:
        try:
            cursor = conn.cursor()
            
            # Get pending jobs
            cursor.execute("""
                SELECT id, "lessonId", "videoKey", "videoUrl", "retryCount"
                FROM transcription_jobs
                WHERE status IN ('pending', 'failed')
                AND "retryCount" < 3
                ORDER BY created_at ASC
                LIMIT 1
            """)
            
            job = cursor.fetchone()
            
            if not job:
                print("No pending jobs, waiting...")
                time.sleep(30)
                continue
            
            job_id, lesson_id, video_key, video_url, retry_count = job
            print(f"Processing job {job_id} for lesson {lesson_id}")
            
            # Update to processing
            cursor.execute("""
                UPDATE transcription_jobs
                SET status = 'processing', "processedAt" = NOW()
                WHERE id = %s
            """, (job_id,))
            conn.commit()
            
            # Download video
            video_path = f"/tmp/{video_key.replace('/', '_')}"
            response = requests.get(video_url, stream=True)
            with open(video_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Transcribe
            result = model.transcribe(video_path)
            
            # Prepare segments
            segments = [
                {"start": seg["start"], "end": seg["end"], "text": seg["text"]}
                for seg in result["segments"]
            ]
            
            # Save transcript
            cursor.execute("""
                INSERT INTO transcripts (
                    id, "lessonId", content, segments, language, source, duration, "wordCount"
                ) VALUES (
                    gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT ("lessonId") DO UPDATE SET
                    content = EXCLUDED.content,
                    segments = EXCLUDED.segments,
                    duration = EXCLUDED.duration,
                    "wordCount" = EXCLUDED."wordCount",
                    "updatedAt" = NOW()
            """, (
                lesson_id,
                result["text"],
                json.dumps(segments),
                result["language"],
                "whisper",
                int(result.get("duration", 0)),
                len(result["text"].split())
            ))
            
            # Mark job as completed
            cursor.execute("""
                UPDATE transcription_jobs
                SET status = 'completed', "completedAt" = NOW()
                WHERE id = %s
            """, (job_id,))
            conn.commit()
            
            print(f"✅ Job {job_id} completed successfully")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            cursor.execute("""
                UPDATE transcription_jobs
                SET status = 'failed',
                    "retryCount" = "retryCount" + 1,
                    "errorMessage" = %s
                WHERE id = %s
            """, (str(e), job_id))
            conn.commit()
        
        finally:
            cursor.close()

if __name__ == "__main__":
    main()
```

## Requirements

```txt
psycopg2-binary==2.9.9
openai-whisper==20231117
requests==2.31.0
```

## Installation

```bash
pip install -r requirements.txt
python transcription_worker.py
```

## Notes

- Presigned URL hết hạn sau 24h, xử lý kịp thời
- Retry tối đa 3 lần cho mỗi job
- JSONB segments giúp frontend tạo subtitle timeline
- Transcript unique per lesson - auto update nếu re-transcribe
