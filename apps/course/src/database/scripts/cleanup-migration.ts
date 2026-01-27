import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({
    path: join(__dirname, '../../../../.env'),
});

const { dataSource: AppDataSource } = require('../ormconfig');

async function cleanup() {
    try {
        await AppDataSource.initialize();
        console.log('Connected to database');

        const queryRunner = AppDataSource.createQueryRunner();

        // Drop all indexes and tables in reverse order
        const dropStatements = [
            // Drop foreign keys first
            'ALTER TABLE IF EXISTS "sections" DROP CONSTRAINT IF EXISTS "FK_0fc0dc8ce98e7dc47c273f85e3d"',
            'ALTER TABLE IF EXISTS "lessons" DROP CONSTRAINT IF EXISTS "FK_ece0b5b02985c7033bf0db088a5"',
            'ALTER TABLE IF EXISTS "lessons" DROP CONSTRAINT IF EXISTS "FK_6dc4890fa16a7a866b6144f4929"',
            'ALTER TABLE IF EXISTS "lesson_progress" DROP CONSTRAINT IF EXISTS "FK_df13299d2740b302dd44a368df9"',
            'ALTER TABLE IF EXISTS "enrollments" DROP CONSTRAINT IF EXISTS "FK_60dd0ae4e21002e63a5fdefeec8"',

            // Drop all indexes
            'DROP INDEX IF EXISTS "IDX_0e51558e26614e05fbb8685438"',
            'DROP INDEX IF EXISTS "IDX_0fc0dc8ce98e7dc47c273f85e3"',
            'DROP INDEX IF EXISTS "IDX_6a444439206229576b5acc7c87"',
            'DROP INDEX IF EXISTS "IDX_ece0b5b02985c7033bf0db088a"',
            'DROP INDEX IF EXISTS "IDX_6dc4890fa16a7a866b6144f492"',
            'DROP INDEX IF EXISTS "IDX_ad81afae954f3a14766e7bf810"',
            'DROP INDEX IF EXISTS "IDX_df13299d2740b302dd44a368df"',
            'DROP INDEX IF EXISTS "IDX_905d73cf0620f42edeebc7e937"',
            'DROP INDEX IF EXISTS "IDX_eb4349e70765bb218bb4f833f6"',
            'DROP INDEX IF EXISTS "IDX_38c562a7d67fd33c7bb917dbf4"',
            'DROP INDEX IF EXISTS "IDX_1ac2924c6479e5fa4fc5d1eec9"',
            'DROP INDEX IF EXISTS "IDX_e6714597bea722629fa7d32124"',
            'DROP INDEX IF EXISTS "IDX_889f2701163f86b2faf62a6247"',
            'DROP INDEX IF EXISTS "IDX_493f6cddac816a7640bc7ceba9"',
            'DROP INDEX IF EXISTS "IDX_COURSE_TITLE"',
            'DROP INDEX IF EXISTS "IDX_117520c1124661424c212d63d2"',
            'DROP INDEX IF EXISTS "IDX_60dd0ae4e21002e63a5fdefeec"',
            'DROP INDEX IF EXISTS "IDX_ca3fe81d84823ff3fe8d9e00e0"',
            'DROP INDEX IF EXISTS "IDX_de33d443c8ae36800c37c58c92"',

            // Drop tables
            'DROP TABLE IF EXISTS "sections" CASCADE',
            'DROP TABLE IF EXISTS "lessons" CASCADE',
            'DROP TABLE IF EXISTS "lesson_progress" CASCADE',
            'DROP TABLE IF EXISTS "courses" CASCADE',
            'DROP TABLE IF EXISTS "enrollments" CASCADE',

            // Drop enums
            'DROP TYPE IF EXISTS "lessons_type_enum"',
            'DROP TYPE IF EXISTS "courses_status_enum"',
            'DROP TYPE IF EXISTS "courses_level_enum"',
            'DROP TYPE IF EXISTS "enrollments_status_enum"',
        ];

        for (const statement of dropStatements) {
            try {
                console.log(`Executing: ${statement}`);
                await queryRunner.query(statement);
                console.log('✓ Success');
            } catch (error) {
                console.log(`⚠ Skipped (may not exist): ${error.message}`);
            }
        }

        await queryRunner.release();
        console.log('\n✓ Database cleanup completed successfully');
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
    }
}

cleanup();
