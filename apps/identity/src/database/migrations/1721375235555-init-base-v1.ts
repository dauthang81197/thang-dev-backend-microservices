import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitBaseV11721375235555 implements MigrationInterface {
  name = 'InitBaseV11721375235555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "menus" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "name" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying, "url" character varying, "icon" character varying, "parent_id" integer, "order_num" integer NOT NULL, CONSTRAINT "PK_3fec3d93327f4538e0cbd4349c4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "actions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, CONSTRAINT "UQ_9acef2caf74c332ed69ced319c1" UNIQUE ("code", "name"), CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_module_xref" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "plan_id" integer, "module_id" integer, CONSTRAINT "PK_4df4a799b9a5048e6a5de775608" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "announcements" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "code" character varying, "description" character varying, "image" character varying, "is_send_now" boolean NOT NULL DEFAULT false, "is_schedule_expire_date" boolean NOT NULL DEFAULT false, "send_date" TIMESTAMP WITH TIME ZONE, "expire_date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_ae580588e6724ac0d36f0f38244" UNIQUE ("uuid"), CONSTRAINT "PK_b3ad760876ff2e19d58e05dc8b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "name" character varying NOT NULL, "code" character varying NOT NULL, CONSTRAINT "UQ_7cfc24d6c24f0ec91294003d6b8" UNIQUE ("code"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role_permission_xref" ("id" SERIAL NOT NULL, "role_permission_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_59365618fdd5de61102459286ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permission_xref" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "role_id" integer, "permission_id" integer, CONSTRAINT "PK_7a7ae583c13a461e3524e42b917" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "name" character varying, "code" character varying, "display_id" character varying, "description" character varying NOT NULL, "content" character varying, "organization_types_code" character varying(200), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying, "last_name" character varying, "full_name" character varying, "email" character varying NOT NULL, "phone_number" character varying, "password" character varying, "is_email_confirmed" boolean NOT NULL DEFAULT false, "signup_verify_token" character varying DEFAULT '', "refresh_token" character varying DEFAULT '', "is_onboarding" boolean DEFAULT false, "login_failed_count" integer DEFAULT '0', "organization_id" integer NOT NULL, "updated_password_at" TIMESTAMP WITH TIME ZONE, "last_login_time" TIMESTAMP WITH TIME ZONE, "is_update_permission_user" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_951b8f1dfc94ac1d0301a14b7e1" UNIQUE ("uuid"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_notification_xref" ("id" BIGSERIAL NOT NULL, "user_id" integer NOT NULL, "notification_id" integer, "is_read" boolean NOT NULL, "notification_type" character varying NOT NULL DEFAULT 'MANUALLY', "module_url" character varying, "title" character varying, "content" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6c85fd89d47aa5d04e4446c3092" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying, "title" character varying NOT NULL, "content" character varying, "is_send_now" boolean NOT NULL DEFAULT false, "send_date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_84989adc90ebf9f1c9b7ba66f0a" UNIQUE ("uuid"), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "name" character varying, "subscription_id" integer NOT NULL, "total_amount" numeric(10,2), "link_invoice" character varying, CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "plan_id" integer NOT NULL, "organization_id" integer NOT NULL, "started_date" TIMESTAMP WITH TIME ZONE NOT NULL, "expired_date" TIMESTAMP WITH TIME ZONE, "price" numeric(10,2), "is_auto_renew" boolean NOT NULL DEFAULT true, "period_type" integer NOT NULL DEFAULT '0', "duration" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plans" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "code" character varying, "type" character varying NOT NULL, "monthly_pricing" numeric(10,2), "yearly_pricing" numeric(10,2), "max_user" integer, "is_paid" boolean NOT NULL DEFAULT true, "plan_benefits" jsonb DEFAULT '[]', "image" character varying NOT NULL, CONSTRAINT "UQ_90304db6cb3a8d7d17601328b25" UNIQUE ("uuid"), CONSTRAINT "UQ_95f7ef3fc4c31a3545b4d825dd4" UNIQUE ("code"), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_permissions_xref" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "plan_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "PK_12ecef224c8292126bfa078f950" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "title" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying NOT NULL, "content" character varying NOT NULL, "module_id" integer, "action_id" integer, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8dad765629e83229da6feda1c1" ON "permissions" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "modules" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "name" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying NOT NULL, "product_code" character varying, "organization_type_code" character varying(200), CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_types" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "name" character varying(200) NOT NULL, "code" character varying(200) NOT NULL, "description" character varying(200), CONSTRAINT "UQ_446d66525e6d78513402b6a4f8a" UNIQUE ("code"), CONSTRAINT "PK_1e086602db2811aa43bfd5ff149" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review_files" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "path" character varying(255) NOT NULL, "description" character varying(100), "origanization_id" integer, "domain_url" character varying, "review_pipeline_id" integer, CONSTRAINT "UQ_5e5db6ad9440756096eeba8d782" UNIQUE ("uuid"), CONSTRAINT "UQ_1b92043e54edc4944e3f7dd7ad0" UNIQUE ("name", "path"), CONSTRAINT "PK_ca8c0a3516037c107584624008d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review_pipelines" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying, "remark" character varying, "organization_name" character varying, "account_email" character varying, "account_name" character varying, "reviewed_at" TIMESTAMP WITH TIME ZONE, "reviewed_by" integer, "user_id" integer, "origanization_id" integer, CONSTRAINT "UQ_5c24480882718f2700c1d78e2bb" UNIQUE ("uuid"), CONSTRAINT "PK_a21630a2db9bae7d123824e7581" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" character varying, "description" character varying, "address" character varying, "content" character varying, "country" character varying, "website" character varying, "size" character varying, "organization_types_code" character varying(200), CONSTRAINT "UQ_94726c8fd554481cd1db1be83e8" UNIQUE ("uuid"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7e27c3b62c681fbe3e2322535f" ON "organizations" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "medicare_infomation" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "card_number" integer, "irn" integer, "valid_to" TIMESTAMP WITH TIME ZONE, "note" character varying(500), "medicare_id" integer, CONSTRAINT "UQ_476e5f82b58b96d27a1ea09a5ca" UNIQUE ("uuid"), CONSTRAINT "PK_c46c02fed0b14d5a38bd9d5650d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "patient_contacts" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_address" character varying(200) NOT NULL, "city" character varying(200) NOT NULL, "state_province" character varying(200) NOT NULL, "email" character varying(200) NOT NULL, "phone_number" character varying(100) NOT NULL, "second_address" character varying(100), "zip_postal_code" character varying, "country_code" character varying(100) NOT NULL, "email_alt" character varying(200), "emergency_contact" character varying(200) NOT NULL, "patient_contact_id" integer, CONSTRAINT "UQ_d8611c726e376ca316fa18e5495" UNIQUE ("uuid"), CONSTRAINT "PK_e2d00fa2280fa17899b2b24850c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "patients" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying, "first_name" character varying(100) NOT NULL, "middle_name" character varying(100), "last_name" character varying(100) NOT NULL, "full_name" character varying(300) NOT NULL, "date_or_birth" TIMESTAMP WITH TIME ZONE NOT NULL, "sex" character varying(10) NOT NULL, "gender" character varying(100) NOT NULL, "organization_id" integer, "is_primary_provider_of_their_family" boolean NOT NULL DEFAULT false, "industry_code" character varying, "occupation" character varying, CONSTRAINT "UQ_6cb236a23f2cf8a0e28639e0819" UNIQUE ("uuid"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedback_attachments" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "path" character varying NOT NULL, "feedback_id" integer, CONSTRAINT "UQ_83099d7770f2efb389e8b45d8d4" UNIQUE ("uuid"), CONSTRAINT "UQ_2ee0eea2d2bdf2376f52a36932d" UNIQUE ("name", "path"), CONSTRAINT "PK_4d40ff6f2ae8ef07b4603ce20fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."feedbacks_category_enum" AS ENUM('System Performance', 'System Feature')`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedbacks" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "code" character varying, "subject" character varying(64) NOT NULL, "category" "public"."feedbacks_category_enum" NOT NULL DEFAULT 'System Feature', "sender" character varying NOT NULL, "description" character varying(1000) NOT NULL, CONSTRAINT "UQ_22c9ef2e7e55c3a3688a50407f0" UNIQUE ("code"), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_log" ("id" BIGSERIAL NOT NULL, "email" character varying(200), "user_id" integer, "organization_id" integer, "organization_code" character varying(200) NOT NULL, "organization_name" character varying(200), "module_name" character varying(200), "action_type" character varying, "role_name" character varying, "action_display" character varying, "account_display" character varying, "organization_type_code" character varying, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reset_password" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "email" character varying(100) NOT NULL, "reset_code" character varying(50), CONSTRAINT "UQ_5b91bf6b5f71b9595c284bad2af" UNIQUE ("email"), CONSTRAINT "PK_82bffbeb85c5b426956d004a8f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mail_histories" ("id" SERIAL NOT NULL, "receiver_email" character varying(255) NOT NULL, "template" character varying(255) NOT NULL, "subject" character varying(255), "content" character varying, "url" character varying(255), "organization_id" integer, "time_sent" TIMESTAMP WITH TIME ZONE, "data" jsonb DEFAULT '{}', "error" character varying, CONSTRAINT "PK_6d506d3f726075f90e87dfe27cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "system_config" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "key" character varying(255) NOT NULL, "value" character varying(500) NOT NULL, "group" character varying(100), "description" character varying(500) NOT NULL, CONSTRAINT "UQ_eedd3cd0f227c7fb5eff2204e93" UNIQUE ("key"), CONSTRAINT "UQ_a1caef0693badeeaf798b798104" UNIQUE ("group"), CONSTRAINT "PK_db4e70ac0d27e588176e9bb44a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_history" ("id" BIGSERIAL NOT NULL, "organization_id" integer NOT NULL, "subscription_id" integer NOT NULL, "changed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "previous_plan_id" integer, "new_plan_id" integer, "expire_date" TIMESTAMP WITH TIME ZONE, "total_amount" numeric(10,2), "reason" character varying, "max_users" character varying, "is_auto_renew" boolean NOT NULL DEFAULT true, "previous_period_type" integer, "new_period_type" integer, "change_type" character varying NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, CONSTRAINT "PK_91a0ee8b462f23bfb2ad7924754" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "announcement_plan_xref" ("announcement_id" integer NOT NULL, "plan_id" integer NOT NULL, CONSTRAINT "PK_ad9b309235ecc39d39952332155" PRIMARY KEY ("announcement_id", "plan_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bae46f033e3298c68fbfe14d6a" ON "announcement_plan_xref" ("announcement_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af5afa6ec80465424ac3019b10" ON "announcement_plan_xref" ("plan_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role_xref" ("user_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "PK_8000de915ac75772839862818e6" PRIMARY KEY ("user_id", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_328f3283d9482d45058a7f7157" ON "user_role_xref" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7eeb22041a4b07e3b45ee831b" ON "user_role_xref" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_product_xref" ("user_id" integer NOT NULL, "product_code" character varying NOT NULL, CONSTRAINT "PK_c4c964154734619f14360aaa0c5" PRIMARY KEY ("user_id", "product_code"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc1513d50144da675e5a74afa6" ON "user_product_xref" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ea867348e16eb53f5a528c4b6" ON "user_product_xref" ("product_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_plan_xref" ("notification_id" integer NOT NULL, "plan_id" integer NOT NULL, CONSTRAINT "PK_8e3dc36b9b9b0fd4bd97d2cd19e" PRIMARY KEY ("notification_id", "plan_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd1b0546d5c7a49229b63d817a" ON "notification_plan_xref" ("notification_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bcc29386cecdf202ae5835dcdf" ON "notification_plan_xref" ("plan_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_organization_xref" ("plan_id" integer NOT NULL, "organization_id" integer NOT NULL, CONSTRAINT "PK_eccb9b86fe94ef5e598699902c3" PRIMARY KEY ("plan_id", "organization_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3a2e7d1c2d2db4c311de943b7" ON "plan_organization_xref" ("plan_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db390fe93f4f0b5b4011fd7268" ON "plan_organization_xref" ("organization_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "menu_module_xref" ("module_id" integer NOT NULL, "menu_id" integer NOT NULL, CONSTRAINT "PK_4e37c2d4af5b2303e521ca11e1d" PRIMARY KEY ("module_id", "menu_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_43a0c1da9d8011402b3f861561" ON "menu_module_xref" ("module_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bf98f811449d6ae7410eac7b25" ON "menu_module_xref" ("menu_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_module_xref" ADD CONSTRAINT "FK_b053813e83c0b321f64c338be58" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_module_xref" ADD CONSTRAINT "FK_b0333e19d5e3661fbb83cef2030" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_permission_xref" ADD CONSTRAINT "FK_3ac340a161b71b01117aa205218" FOREIGN KEY ("role_permission_id") REFERENCES "role_permission_xref"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_permission_xref" ADD CONSTRAINT "FK_ef76520d0bf7e1bd6d8d7623e32" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission_xref" ADD CONSTRAINT "FK_20ff2ec8849bef19fe58ca6d841" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission_xref" ADD CONSTRAINT "FK_78a48d06e2979ee0729be37b7ff" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_8cda09e64284497d4244bac338f" FOREIGN KEY ("organization_types_code") REFERENCES "organization_types"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_21a659804ed7bf61eb91688dea7" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_xref" ADD CONSTRAINT "FK_83a0f2814c59312285617dfff0e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_xref" ADD CONSTRAINT "FK_a6a4b3dd5fdfd6812879dc3d5f6" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_5152c0aa0f851d9b95972b442e0" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_9ea1509175fa294fc64d43a9fe6" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_permissions_xref" ADD CONSTRAINT "FK_18098cb04920b5158f86706f82e" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_permissions_xref" ADD CONSTRAINT "FK_e8f2ffb0ff133026b515ef2880c" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_738f46bb9ac6ea356f1915835d0" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_b260ff500cf388b8c01569a97e1" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" ADD CONSTRAINT "FK_001a63b6984ddefc7a9aae7c42c" FOREIGN KEY ("product_code") REFERENCES "products"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" ADD CONSTRAINT "FK_67c7ca32014a48511a593febdbb" FOREIGN KEY ("organization_type_code") REFERENCES "organization_types"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_files" ADD CONSTRAINT "FK_4ca7f5156cc7e94dd510572080b" FOREIGN KEY ("review_pipeline_id") REFERENCES "review_pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_pipelines" ADD CONSTRAINT "FK_c346092161b0ce858221cd2bb4b" FOREIGN KEY ("origanization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "FK_09afe313691c8514992300878c9" FOREIGN KEY ("organization_types_code") REFERENCES "organization_types"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicare_infomation" ADD CONSTRAINT "FK_1f13030c0daedaefd85cd04f108" FOREIGN KEY ("medicare_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_contacts" ADD CONSTRAINT "FK_52903bd8783e866edc48d2b7e10" FOREIGN KEY ("patient_contact_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_attachments" ADD CONSTRAINT "FK_f36fef23929587c840d3f79bbde" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_plan_xref" ADD CONSTRAINT "FK_bae46f033e3298c68fbfe14d6a1" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_plan_xref" ADD CONSTRAINT "FK_af5afa6ec80465424ac3019b10e" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_xref" ADD CONSTRAINT "FK_328f3283d9482d45058a7f71576" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_xref" ADD CONSTRAINT "FK_c7eeb22041a4b07e3b45ee831b3" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_product_xref" ADD CONSTRAINT "FK_dc1513d50144da675e5a74afa66" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_product_xref" ADD CONSTRAINT "FK_8ea867348e16eb53f5a528c4b67" FOREIGN KEY ("product_code") REFERENCES "products"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_plan_xref" ADD CONSTRAINT "FK_dd1b0546d5c7a49229b63d817a0" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_plan_xref" ADD CONSTRAINT "FK_bcc29386cecdf202ae5835dcdf5" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_organization_xref" ADD CONSTRAINT "FK_c3a2e7d1c2d2db4c311de943b7d" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_organization_xref" ADD CONSTRAINT "FK_db390fe93f4f0b5b4011fd72681" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_module_xref" ADD CONSTRAINT "FK_43a0c1da9d8011402b3f861561e" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_module_xref" ADD CONSTRAINT "FK_bf98f811449d6ae7410eac7b25c" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "menu_module_xref" DROP CONSTRAINT "FK_bf98f811449d6ae7410eac7b25c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_module_xref" DROP CONSTRAINT "FK_43a0c1da9d8011402b3f861561e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_organization_xref" DROP CONSTRAINT "FK_db390fe93f4f0b5b4011fd72681"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_organization_xref" DROP CONSTRAINT "FK_c3a2e7d1c2d2db4c311de943b7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_plan_xref" DROP CONSTRAINT "FK_bcc29386cecdf202ae5835dcdf5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_plan_xref" DROP CONSTRAINT "FK_dd1b0546d5c7a49229b63d817a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_product_xref" DROP CONSTRAINT "FK_8ea867348e16eb53f5a528c4b67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_product_xref" DROP CONSTRAINT "FK_dc1513d50144da675e5a74afa66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_xref" DROP CONSTRAINT "FK_c7eeb22041a4b07e3b45ee831b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_xref" DROP CONSTRAINT "FK_328f3283d9482d45058a7f71576"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_plan_xref" DROP CONSTRAINT "FK_af5afa6ec80465424ac3019b10e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_plan_xref" DROP CONSTRAINT "FK_bae46f033e3298c68fbfe14d6a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_attachments" DROP CONSTRAINT "FK_f36fef23929587c840d3f79bbde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_contacts" DROP CONSTRAINT "FK_52903bd8783e866edc48d2b7e10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicare_infomation" DROP CONSTRAINT "FK_1f13030c0daedaefd85cd04f108"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "FK_09afe313691c8514992300878c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_pipelines" DROP CONSTRAINT "FK_c346092161b0ce858221cd2bb4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_files" DROP CONSTRAINT "FK_4ca7f5156cc7e94dd510572080b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT "FK_67c7ca32014a48511a593febdbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT "FK_001a63b6984ddefc7a9aae7c42c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_b260ff500cf388b8c01569a97e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_738f46bb9ac6ea356f1915835d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_permissions_xref" DROP CONSTRAINT "FK_e8f2ffb0ff133026b515ef2880c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_permissions_xref" DROP CONSTRAINT "FK_18098cb04920b5158f86706f82e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_9ea1509175fa294fc64d43a9fe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_5152c0aa0f851d9b95972b442e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_xref" DROP CONSTRAINT "FK_a6a4b3dd5fdfd6812879dc3d5f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_xref" DROP CONSTRAINT "FK_83a0f2814c59312285617dfff0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_21a659804ed7bf61eb91688dea7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "FK_8cda09e64284497d4244bac338f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission_xref" DROP CONSTRAINT "FK_78a48d06e2979ee0729be37b7ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission_xref" DROP CONSTRAINT "FK_20ff2ec8849bef19fe58ca6d841"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_permission_xref" DROP CONSTRAINT "FK_ef76520d0bf7e1bd6d8d7623e32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_permission_xref" DROP CONSTRAINT "FK_3ac340a161b71b01117aa205218"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_module_xref" DROP CONSTRAINT "FK_b0333e19d5e3661fbb83cef2030"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_module_xref" DROP CONSTRAINT "FK_b053813e83c0b321f64c338be58"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bf98f811449d6ae7410eac7b25"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_43a0c1da9d8011402b3f861561"`,
    );
    await queryRunner.query(`DROP TABLE "menu_module_xref"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db390fe93f4f0b5b4011fd7268"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3a2e7d1c2d2db4c311de943b7"`,
    );
    await queryRunner.query(`DROP TABLE "plan_organization_xref"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bcc29386cecdf202ae5835dcdf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd1b0546d5c7a49229b63d817a"`,
    );
    await queryRunner.query(`DROP TABLE "notification_plan_xref"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8ea867348e16eb53f5a528c4b6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc1513d50144da675e5a74afa6"`,
    );
    await queryRunner.query(`DROP TABLE "user_product_xref"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7eeb22041a4b07e3b45ee831b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_328f3283d9482d45058a7f7157"`,
    );
    await queryRunner.query(`DROP TABLE "user_role_xref"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af5afa6ec80465424ac3019b10"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bae46f033e3298c68fbfe14d6a"`,
    );
    await queryRunner.query(`DROP TABLE "announcement_plan_xref"`);
    await queryRunner.query(`DROP TABLE "subscription_history"`);
    await queryRunner.query(`DROP TABLE "system_config"`);
    await queryRunner.query(`DROP TABLE "mail_histories"`);
    await queryRunner.query(`DROP TABLE "reset_password"`);
    await queryRunner.query(`DROP TABLE "activity_log"`);
    await queryRunner.query(`DROP TABLE "feedbacks"`);
    await queryRunner.query(`DROP TYPE "public"."feedbacks_category_enum"`);
    await queryRunner.query(`DROP TABLE "feedback_attachments"`);
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(`DROP TABLE "patient_contacts"`);
    await queryRunner.query(`DROP TABLE "medicare_infomation"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7e27c3b62c681fbe3e2322535f"`,
    );
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TABLE "review_pipelines"`);
    await queryRunner.query(`DROP TABLE "review_files"`);
    await queryRunner.query(`DROP TABLE "organization_types"`);
    await queryRunner.query(`DROP TABLE "modules"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8dad765629e83229da6feda1c1"`,
    );
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "plan_permissions_xref"`);
    await queryRunner.query(`DROP TABLE "plans"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "user_notification_xref"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "role_permission_xref"`);
    await queryRunner.query(`DROP TABLE "user_role_permission_xref"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "announcements"`);
    await queryRunner.query(`DROP TABLE "plan_module_xref"`);
    await queryRunner.query(`DROP TABLE "actions"`);
    await queryRunner.query(`DROP TABLE "menus"`);
  }
}
