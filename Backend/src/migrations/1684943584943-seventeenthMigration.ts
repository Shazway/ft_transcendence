import { MigrationInterface, QueryRunner } from "typeorm";

export class SeventeenthMigration1684943584943 implements MigrationInterface {
    name = 'SeventeenthMigration1684943584943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "inMatch" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "is_victory" SET DEFAULT '{false,false}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "is_victory" SET DEFAULT '{f,f}'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "inMatch"`);
    }

}
