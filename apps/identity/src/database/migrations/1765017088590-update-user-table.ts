import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1765017088590 implements MigrationInterface {
    name = 'UpdateUserTable1765017088590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

}
