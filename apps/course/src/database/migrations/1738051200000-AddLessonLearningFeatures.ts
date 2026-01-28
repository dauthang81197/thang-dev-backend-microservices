import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonLearningFeatures1738051200000 implements MigrationInterface {
  name = 'AddLessonLearningFeatures1738051200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add completed_lessons_count and total_lessons_count to enrollments
    await queryRunner.query(`
      ALTER TABLE "enrollments" 
      ADD COLUMN IF NOT EXISTS "completed_lessons_count" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "total_lessons_count" integer DEFAULT 0
    `);

    // Update existing enrollments with correct counts
    await queryRunner.query(`
      UPDATE enrollments
      SET 
        "total_lessons_count" = COALESCE(
          (SELECT COUNT(DISTINCT l.id) 
           FROM sections s
           LEFT JOIN lessons l ON l."sectionId" = s.id
           WHERE s."courseId" = enrollments."courseId"
          ), 0
        ),
        "completed_lessons_count" = COALESCE(
          (SELECT COUNT(DISTINCT lp.id) 
           FROM sections s
           LEFT JOIN lessons l ON l."sectionId" = s.id
           LEFT JOIN lesson_progress lp ON lp."lessonId" = l.id 
                                       AND lp."userId" = enrollments."userId"
                                       AND lp.completed = true
           WHERE s."courseId" = enrollments."courseId"
          ), 0
        )
    `);

    // Update progress percentage
    await queryRunner.query(`
      UPDATE enrollments
      SET progress = CASE 
        WHEN "total_lessons_count" > 0 
        THEN ROUND(("completed_lessons_count"::decimal / "total_lessons_count") * 100, 2)
        ELSE 0 
      END
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_lesson_progress_userId_completed" 
      ON "lesson_progress" ("userId", "completed")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_lesson_progress_userId_completed"
    `);

    // Remove columns from enrollments
    await queryRunner.query(`
      ALTER TABLE "enrollments" 
      DROP COLUMN IF EXISTS "completed_lessons_count",
      DROP COLUMN IF EXISTS "total_lessons_count"
    `);
  }
}
