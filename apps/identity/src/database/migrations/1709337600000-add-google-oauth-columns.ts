import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGoogleOAuthColumns1709337600000 implements MigrationInterface {
  name = 'AddGoogleOAuthColumns1709337600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the auth_provider enum type
    await queryRunner.query(
      `CREATE TYPE "public"."users_auth_provider_enum" AS ENUM('local', 'google')`,
    );

    // Add google_id column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'google_id',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
    );

    // Add avatar column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'avatar',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add auth_provider column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'auth_provider',
        type: 'enum',
        enum: ['local', 'google'],
        enumName: 'users_auth_provider_enum',
        default: `'local'`,
      }),
    );

    // Make organization_id nullable (Google users may not have an organization)
    await queryRunner.changeColumn(
      'users',
      'organization_id',
      new TableColumn({
        name: 'organization_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert organization_id to NOT NULL
    await queryRunner.changeColumn(
      'users',
      'organization_id',
      new TableColumn({
        name: 'organization_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    await queryRunner.dropColumn('users', 'auth_provider');
    await queryRunner.dropColumn('users', 'avatar');
    await queryRunner.dropColumn('users', 'google_id');

    await queryRunner.query(
      `DROP TYPE "public"."users_auth_provider_enum"`,
    );
  }
}

