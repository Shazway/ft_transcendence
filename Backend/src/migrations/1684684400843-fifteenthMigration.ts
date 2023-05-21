import { MigrationInterface, QueryRunner } from "typeorm";

export class FifteenthMigration1684684400843 implements MigrationInterface {
    name = 'FifteenthMigration1684684400843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "is_victory" SET DEFAULT '{false,false}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "is_victory" SET DEFAULT '{f,f}'`);
    }

}
