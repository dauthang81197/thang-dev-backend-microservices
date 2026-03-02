import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitExpenses1709000000000 implements MigrationInterface {
    name = 'InitExpenses1709000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable uuid extension if not exists
        await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

        // Create wallet_type enum
        await queryRunner.query(`
      CREATE TYPE "wallet_type_enum" AS ENUM ('CASH', 'BANK', 'CREDIT', 'E_WALLET', 'INVESTMENT')
    `);

        // Create category_type enum
        await queryRunner.query(`
      CREATE TYPE "category_type_enum" AS ENUM ('INCOME', 'EXPENSE')
    `);

        // Create transaction_type enum
        await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM ('INCOME', 'EXPENSE')
    `);

        // ============================================
        // Table: wallets
        // ============================================
        await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "type" "wallet_type_enum" NOT NULL DEFAULT 'CASH',
        "balance" decimal(15,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallets" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_wallets_user_id" ON "wallets" ("user_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_wallets_user_id_name" ON "wallets" ("user_id", "name")
    `);

        // ============================================
        // Table: categories
        // ============================================
        await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "type" "category_type_enum" NOT NULL,
        "icon" varchar(50),
        "color" varchar(7),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_categories_user_id" ON "categories" ("user_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_categories_type" ON "categories" ("type")
    `);

        // ============================================
        // Table: transactions
        // ============================================
        await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "wallet_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "type" "transaction_type_enum" NOT NULL,
        "amount" decimal(15,2) NOT NULL,
        "description" text,
        "transaction_date" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_wallet" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_transactions_user_id" ON "transactions" ("user_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_transactions_transaction_date" ON "transactions" ("transaction_date")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_transactions_category_id" ON "transactions" ("category_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_transactions_wallet_id" ON "transactions" ("wallet_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_transactions_type" ON "transactions" ("type")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_transactions_user_date" ON "transactions" ("user_id", "transaction_date")
    `);

        // ============================================
        // Table: budgets
        // ============================================
        await queryRunner.query(`
      CREATE TABLE "budgets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "amount" decimal(15,2) NOT NULL,
        "month" int NOT NULL,
        "year" int NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_budgets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_budgets_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_budgets_user_category_month_year" UNIQUE ("user_id", "category_id", "month", "year")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_budgets_user_id" ON "budgets" ("user_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_budgets_month_year" ON "budgets" ("month", "year")
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "budgets" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "transactions" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "wallets" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "transaction_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "category_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "wallet_type_enum"`);
    }
}
