import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHierarchicalLessonStructure1234567890123 implements MigrationInterface {
  name = 'AddHierarchicalLessonStructure1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add tree structure columns to lessons table
    await queryRunner.query(`
      ALTER TABLE "lessons" 
      ADD COLUMN "parentId" uuid NULL,
      ADD COLUMN "path" varchar(500) NULL,
      ADD COLUMN "level" integer NOT NULL DEFAULT 0,
      ADD COLUMN "childrenCount" integer NOT NULL DEFAULT 0
    `);

    // Add R2 video storage columns
    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD COLUMN "videoKey" varchar(500) NULL,
      ADD COLUMN "videoSize" bigint NULL,
      ADD COLUMN "videoFormat" varchar(50) NULL
    `);

    // Add index on parentId for efficient tree queries
    await queryRunner.query(`
      CREATE INDEX "IDX_lessons_parentId" ON "lessons" ("parentId")
    `);

    // Add foreign key constraint for parent-child relationship
    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD CONSTRAINT "FK_lessons_parent"
      FOREIGN KEY ("parentId")
      REFERENCES "lessons"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "lessons"
      DROP CONSTRAINT "FK_lessons_parent"
    `);

    // Drop index
    await queryRunner.query(`
      DROP INDEX "IDX_lessons_parentId"
    `);

    // Drop R2 columns
    await queryRunner.query(`
      ALTER TABLE "lessons"
      DROP COLUMN "videoFormat",
      DROP COLUMN "videoSize",
      DROP COLUMN "videoKey"
    `);

    // Drop tree structure columns
    await queryRunner.query(`
      ALTER TABLE "lessons"
      DROP COLUMN "childrenCount",
      DROP COLUMN "level",
      DROP COLUMN "path",
      DROP COLUMN "parentId"
    `);
  }
}
