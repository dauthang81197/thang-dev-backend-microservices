import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskModule1709100000000 implements MigrationInterface {
  name = 'AddTaskModule1709100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create task_status enum
    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE')
    `);

    // Create task_priority enum
    await queryRunner.query(`
      CREATE TYPE "task_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')
    `);

    // Create default_view enum
    await queryRunner.query(`
      CREATE TYPE "default_view_enum" AS ENUM('LIST', 'BOARD', 'CALENDAR')
    `);

    // Create tags table
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "name" character varying(50) NOT NULL,
        "color" character varying(7),
        CONSTRAINT "PK_tags" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_tags_user_id" ON "tags" ("user_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_tags_user_name" ON "tags" ("user_id", "name")
    `);

    // Create tasks table
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "status" "task_status_enum" NOT NULL DEFAULT 'TODO',
        "priority" "task_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "due_date" TIMESTAMP,
        "estimated_minutes" integer,
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_tasks_user_id" ON "tasks" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_tasks_status" ON "tasks" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_tasks_priority" ON "tasks" ("priority")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_tasks_due_date" ON "tasks" ("due_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_tasks_user_status" ON "tasks" ("user_id", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_tasks_user_due_date" ON "tasks" ("user_id", "due_date")
    `);

    // Create task_tags join table (many-to-many)
    await queryRunner.query(`
      CREATE TABLE "task_tags" (
        "task_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_task_tags" PRIMARY KEY ("task_id", "tag_id"),
        CONSTRAINT "FK_task_tags_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_task_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_task_tags_task_id" ON "task_tags" ("task_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_task_tags_tag_id" ON "task_tags" ("tag_id")
    `);

    // Create task_settings table
    await queryRunner.query(`
      CREATE TABLE "task_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "default_view" "default_view_enum" NOT NULL DEFAULT 'LIST',
        "show_completed" boolean NOT NULL DEFAULT true,
        "default_priority" "task_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "auto_archive_days" integer NOT NULL DEFAULT 30,
        CONSTRAINT "PK_task_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_task_settings_user_id" UNIQUE ("user_id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_task_settings_user_id" ON "task_settings" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "task_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_settings"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "default_view_enum"`);
  }
}
