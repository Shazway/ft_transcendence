import { MigrationInterface, QueryRunner } from "typeorm";

export class FourteenthMigration1684098976618 implements MigrationInterface {
    name = 'FourteenthMigration1684098976618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "is_victory" SET DEFAULT '{false,false}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "is_victory" SET DEFAULT '{f,f}'`);
    }

}
