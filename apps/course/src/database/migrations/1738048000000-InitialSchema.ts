import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1738048000000 implements MigrationInterface {
  name = 'InitialSchema1738048000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create courses table
    await queryRunner.query(`
      CREATE TYPE "course_level_enum" AS ENUM('beginner', 'intermediate', 'advanced', 'all_levels');
      CREATE TYPE "course_status_enum" AS ENUM('draft', 'published', 'archived');
      
      CREATE TABLE "courses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "category" character varying(100),
        "level" "course_level_enum" NOT NULL DEFAULT 'all_levels',
        "price" numeric(10,2) NOT NULL DEFAULT '0',
        "thumbnail" text,
        "previewVideo" text,
        "status" "course_status_enum" NOT NULL DEFAULT 'draft',
        "instructorId" uuid NOT NULL,
        "instructorName" text,
        "enrollmentCount" integer NOT NULL DEFAULT '0',
        "rating" numeric(3,2) NOT NULL DEFAULT '0',
        "reviewCount" integer NOT NULL DEFAULT '0',
        "requirements" text,
        "whatYouWillLearn" text,
        "tags" text,
        "language" character varying(10),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "publishedAt" TIMESTAMP,
        CONSTRAINT "PK_courses" PRIMARY KEY ("id")
      );
      
      CREATE INDEX "IDX_COURSE_TITLE" ON "courses" ("title");
      CREATE INDEX "IDX_course_category" ON "courses" ("category");
      CREATE INDEX "IDX_course_level" ON "courses" ("level");
      CREATE INDEX "IDX_course_status" ON "courses" ("status");
      CREATE INDEX "IDX_course_instructorId" ON "courses" ("instructorId");
      CREATE INDEX "IDX_course_status_createdAt" ON "courses" ("status", "createdAt");
    `);

    // Create sections table
    await queryRunner.query(`
      CREATE TABLE "sections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "orderIndex" integer NOT NULL DEFAULT '0',
        "courseId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sections" PRIMARY KEY ("id")
      );
      
      CREATE INDEX "IDX_section_courseId" ON "sections" ("courseId");
      CREATE INDEX "IDX_section_courseId_orderIndex" ON "sections" ("courseId", "orderIndex");
      
      ALTER TABLE "sections" 
        ADD CONSTRAINT "FK_section_course" 
        FOREIGN KEY ("courseId") 
        REFERENCES "courses"("id") 
        ON DELETE CASCADE;
    `);

    // Create lessons table
    await queryRunner.query(`
      CREATE TYPE "lesson_type_enum" AS ENUM('video', 'article', 'quiz', 'coding_exercise', 'resource');
      
      CREATE TABLE "lessons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "type" "lesson_type_enum" NOT NULL DEFAULT 'video',
        "content" text,
        "duration" integer NOT NULL DEFAULT '0',
        "orderIndex" integer NOT NULL DEFAULT '0',
        "isFree" boolean NOT NULL DEFAULT false,
        "sectionId" uuid NOT NULL,
        "attachments" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lessons" PRIMARY KEY ("id")
      );
      
      CREATE INDEX "IDX_lesson_sectionId" ON "lessons" ("sectionId");
      CREATE INDEX "IDX_lesson_sectionId_orderIndex" ON "lessons" ("sectionId", "orderIndex");
      
      ALTER TABLE "lessons" 
        ADD CONSTRAINT "FK_lesson_section" 
        FOREIGN KEY ("sectionId") 
        REFERENCES "sections"("id") 
        ON DELETE CASCADE;
    `);

    // Create enrollments table
    await queryRunner.query(`
      CREATE TYPE "enrollment_status_enum" AS ENUM('active', 'completed', 'suspended');
      
      CREATE TABLE "enrollments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "courseId" uuid NOT NULL,
        "status" "enrollment_status_enum" NOT NULL DEFAULT 'active',
        "progress" numeric(5,2) NOT NULL DEFAULT '0',
        "lastAccessedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "enrolledAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enrollments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_enrollment_user_course" UNIQUE ("userId", "courseId")
      );
      
      CREATE INDEX "IDX_enrollment_userId" ON "enrollments" ("userId");
      CREATE INDEX "IDX_enrollment_courseId" ON "enrollments" ("courseId");
      CREATE INDEX "IDX_enrollment_userId_status" ON "enrollments" ("userId", "status");
      CREATE INDEX "IDX_enrollment_enrolledAt" ON "enrollments" ("enrolledAt");
      
      ALTER TABLE "enrollments" 
        ADD CONSTRAINT "FK_enrollment_course" 
        FOREIGN KEY ("courseId") 
        REFERENCES "courses"("id") 
        ON DELETE CASCADE;
    `);

    // Create lesson_progress table
    await queryRunner.query(`
      CREATE TABLE "lesson_progress" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "lessonId" uuid NOT NULL,
        "completed" boolean NOT NULL DEFAULT false,
        "watchedDuration" integer NOT NULL DEFAULT '0',
        "completedAt" TIMESTAMP,
        "startedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lesson_progress" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_lesson_progress_user_lesson" UNIQUE ("userId", "lessonId")
      );
      
      CREATE INDEX "IDX_lesson_progress_userId" ON "lesson_progress" ("userId");
      CREATE INDEX "IDX_lesson_progress_lessonId" ON "lesson_progress" ("lessonId");
      CREATE INDEX "IDX_lesson_progress_completed" ON "lesson_progress" ("completed");
      CREATE INDEX "IDX_lesson_progress_userId_lessonId" ON "lesson_progress" ("userId", "lessonId");
      
      ALTER TABLE "lesson_progress" 
        ADD CONSTRAINT "FK_lesson_progress_lesson" 
        FOREIGN KEY ("lessonId") 
        REFERENCES "lessons"("id") 
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "lesson_progress" CASCADE`);
    await queryRunner.query(`DROP TABLE "enrollments" CASCADE`);
    await queryRunner.query(`DROP TABLE "lessons" CASCADE`);
    await queryRunner.query(`DROP TABLE "sections" CASCADE`);
    await queryRunner.query(`DROP TABLE "courses" CASCADE`);
    await queryRunner.query(`DROP TYPE "enrollment_status_enum"`);
    await queryRunner.query(`DROP TYPE "lesson_type_enum"`);
    await queryRunner.query(`DROP TYPE "course_status_enum"`);
    await queryRunner.query(`DROP TYPE "course_level_enum"`);
  }
}
