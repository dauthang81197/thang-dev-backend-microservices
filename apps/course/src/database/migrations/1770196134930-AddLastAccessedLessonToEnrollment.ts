import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastAccessedLessonToEnrollment1770196134930 implements MigrationInterface {
  name = 'AddLastAccessedLessonToEnrollment1770196134930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "enrollments" ADD "lastAccessedLessonId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP COLUMN "lastAccessedLessonId"`,
    );
  }
}
