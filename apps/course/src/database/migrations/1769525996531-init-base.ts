import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitBase1769525996531 implements MigrationInterface {
  name = 'InitBase1769525996531';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."enrollments_status_enum" AS ENUM('active', 'completed', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "enrollments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "courseId" uuid NOT NULL, "status" "public"."enrollments_status_enum" NOT NULL DEFAULT 'active', "progress" numeric(5,2) NOT NULL DEFAULT '0', "lastAccessedAt" TIMESTAMP, "completedAt" TIMESTAMP, "enrolledAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a6f2eeafcbf0dd7a69fc91e2957" UNIQUE ("userId", "courseId"), CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de33d443c8ae36800c37c58c92" ON "enrollments" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_60dd0ae4e21002e63a5fdefeec" ON "enrollments" ("courseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ca3fe81d84823ff3fe8d9e00e0" ON "enrollments" ("enrolledAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_117520c1124661424c212d63d2" ON "enrollments" ("userId", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."courses_level_enum" AS ENUM('beginner', 'intermediate', 'advanced', 'all_levels')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."courses_status_enum" AS ENUM('draft', 'published', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text NOT NULL, "category" character varying(100), "level" "public"."courses_level_enum" NOT NULL DEFAULT 'all_levels', "price" numeric(10,2) NOT NULL DEFAULT '0', "thumbnail" text, "previewVideo" text, "status" "public"."courses_status_enum" NOT NULL DEFAULT 'draft', "instructorId" uuid NOT NULL, "instructorName" text, "enrollmentCount" integer NOT NULL DEFAULT '0', "rating" numeric(3,2) NOT NULL DEFAULT '0', "reviewCount" integer NOT NULL DEFAULT '0', "requirements" text, "whatYouWillLearn" text, "tags" text, "language" character varying(10), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "publishedAt" TIMESTAMP, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_COURSE_TITLE" ON "courses" ("title") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ac2924c6479e5fa4fc5d1eec9" ON "courses" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_493f6cddac816a7640bc7ceba9" ON "courses" ("level") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_889f2701163f86b2faf62a6247" ON "courses" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e6714597bea722629fa7d32124" ON "courses" ("instructorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38c562a7d67fd33c7bb917dbf4" ON "courses" ("status", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "lesson_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "lessonId" uuid NOT NULL, "completed" boolean NOT NULL DEFAULT false, "watchedDuration" integer NOT NULL DEFAULT '0', "completedAt" TIMESTAMP, "startedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ad81afae954f3a14766e7bf8106" UNIQUE ("userId", "lessonId"), CONSTRAINT "PK_e6223ebbc5f8f5fce40e0193de1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb4349e70765bb218bb4f833f6" ON "lesson_progress" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_df13299d2740b302dd44a368df" ON "lesson_progress" ("lessonId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_905d73cf0620f42edeebc7e937" ON "lesson_progress" ("completed") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad81afae954f3a14766e7bf810" ON "lesson_progress" ("userId", "lessonId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lessons_type_enum" AS ENUM('video', 'article', 'quiz', 'coding_exercise', 'resource')`,
    );
    await queryRunner.query(
      `CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "type" "public"."lessons_type_enum" NOT NULL DEFAULT 'video', "content" text, "duration" integer NOT NULL DEFAULT '0', "orderIndex" integer NOT NULL DEFAULT '0', "isFree" boolean NOT NULL DEFAULT false, "sectionId" uuid NOT NULL, "attachments" text, "parentId" uuid, "path" character varying(500), "level" integer NOT NULL DEFAULT '0', "childrenCount" integer NOT NULL DEFAULT '0', "videoKey" character varying(500), "videoSize" bigint, "videoFormat" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6dc4890fa16a7a866b6144f492" ON "lessons" ("sectionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ece0b5b02985c7033bf0db088a" ON "lessons" ("parentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a444439206229576b5acc7c87" ON "lessons" ("sectionId", "orderIndex") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "orderIndex" integer NOT NULL DEFAULT '0', "courseId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0fc0dc8ce98e7dc47c273f85e3" ON "sections" ("courseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e51558e26614e05fbb8685438" ON "sections" ("courseId", "orderIndex") `,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" ADD CONSTRAINT "FK_60dd0ae4e21002e63a5fdefeec8" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" ADD CONSTRAINT "FK_df13299d2740b302dd44a368df9" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_6dc4890fa16a7a866b6144f4929" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_ece0b5b02985c7033bf0db088a5" FOREIGN KEY ("parentId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" ADD CONSTRAINT "FK_0fc0dc8ce98e7dc47c273f85e3d" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sections" DROP CONSTRAINT "FK_0fc0dc8ce98e7dc47c273f85e3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT "FK_ece0b5b02985c7033bf0db088a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT "FK_6dc4890fa16a7a866b6144f4929"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" DROP CONSTRAINT "FK_df13299d2740b302dd44a368df9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT "FK_60dd0ae4e21002e63a5fdefeec8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e51558e26614e05fbb8685438"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0fc0dc8ce98e7dc47c273f85e3"`,
    );
    await queryRunner.query(`DROP TABLE "sections"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6a444439206229576b5acc7c87"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ece0b5b02985c7033bf0db088a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6dc4890fa16a7a866b6144f492"`,
    );
    await queryRunner.query(`DROP TABLE "lessons"`);
    await queryRunner.query(`DROP TYPE "public"."lessons_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad81afae954f3a14766e7bf810"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df13299d2740b302dd44a368df"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_905d73cf0620f42edeebc7e937"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df13299d2740b302dd44a368df"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eb4349e70765bb218bb4f833f6"`,
    );
    await queryRunner.query(`DROP TABLE "lesson_progress"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_38c562a7d67fd33c7bb917dbf4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ac2924c6479e5fa4fc5d1eec9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e6714597bea722629fa7d32124"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e6714597bea722629fa7d32124"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_889f2701163f86b2faf62a6247"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_493f6cddac816a7640bc7ceba9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ac2924c6479e5fa4fc5d1eec9"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_COURSE_TITLE"`);
    await queryRunner.query(`DROP TABLE "courses"`);
    await queryRunner.query(`DROP TYPE "public"."courses_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."courses_level_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_117520c1124661424c212d63d2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_60dd0ae4e21002e63a5fdefeec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ca3fe81d84823ff3fe8d9e00e0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_60dd0ae4e21002e63a5fdefeec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de33d443c8ae36800c37c58c92"`,
    );
    await queryRunner.query(`DROP TABLE "enrollments"`);
    await queryRunner.query(`DROP TYPE "public"."enrollments_status_enum"`);
  }
}
