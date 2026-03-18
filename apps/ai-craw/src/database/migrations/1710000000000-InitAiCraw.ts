import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAiCraw1710000000000 implements MigrationInterface {
  name = 'InitAiCraw1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid extension if not exists
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    // ============================================
    // Table: craw_articles
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "craw_articles" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "url"         text        NOT NULL,
        "title"       text,
        "topic"       text,
        "summary"     text,
        "content"     text,
        "key_points"  jsonb,
        "created_at"  TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_craw_articles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_craw_articles_url" ON "craw_articles" ("url")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_craw_articles_topic" ON "craw_articles" ("topic")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_craw_articles_created_at" ON "craw_articles" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_craw_articles_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_craw_articles_topic"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_craw_articles_url"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "craw_articles"`);
  }
}
