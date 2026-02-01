import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTranscriptionTables1769921994001 implements MigrationInterface {
    name = 'AddTranscriptionTables1769921994001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transcripts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lessonId" uuid NOT NULL, "content" text NOT NULL, "segments" jsonb, "language" character varying(10) NOT NULL DEFAULT 'vi', "source" character varying(50), "duration" integer, "wordCount" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5601fe5ab2de55a9f07a0c1ebe1" UNIQUE ("lessonId"), CONSTRAINT "PK_40c75f89c1fc953cd33e702247d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5601fe5ab2de55a9f07a0c1ebe" ON "transcripts" ("lessonId") `);
        await queryRunner.query(`CREATE TYPE "public"."transcription_jobs_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "transcription_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lessonId" uuid NOT NULL, "videoKey" character varying(500) NOT NULL, "videoUrl" text NOT NULL, "status" "public"."transcription_jobs_status_enum" NOT NULL DEFAULT 'pending', "retryCount" integer NOT NULL DEFAULT '0', "errorMessage" text, "processedAt" TIMESTAMP, "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9fa2f74330aeb693b0c49d7f58c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8f5ad45f57a79b5cdda1abbf89" ON "transcription_jobs" ("lessonId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f9901f13f0d47045fce0041393" ON "transcription_jobs" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_ec4a8d7cdf122795875ac9ef49" ON "transcription_jobs" ("status", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "transcripts" ADD CONSTRAINT "FK_5601fe5ab2de55a9f07a0c1ebe1" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transcription_jobs" ADD CONSTRAINT "FK_8f5ad45f57a79b5cdda1abbf892" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transcription_jobs" DROP CONSTRAINT "FK_8f5ad45f57a79b5cdda1abbf892"`);
        await queryRunner.query(`ALTER TABLE "transcripts" DROP CONSTRAINT "FK_5601fe5ab2de55a9f07a0c1ebe1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec4a8d7cdf122795875ac9ef49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9901f13f0d47045fce0041393"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f5ad45f57a79b5cdda1abbf89"`);
        await queryRunner.query(`DROP TABLE "transcription_jobs"`);
        await queryRunner.query(`DROP TYPE "public"."transcription_jobs_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5601fe5ab2de55a9f07a0c1ebe"`);
        await queryRunner.query(`DROP TABLE "transcripts"`);
    }

}
