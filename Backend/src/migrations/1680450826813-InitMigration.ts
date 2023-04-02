import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1680450826813 implements MigrationInterface {
	name = 'InitMigration1680450826813';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "achievements" ("achievement_id" SERIAL NOT NULL, "achievement_name" character varying(255) NOT NULL, "achievement_description" character varying(1024), "achievement_condition" character varying(1024), CONSTRAINT "PK_78a155f02e79ffa720c19416266" PRIMARY KEY ("achievement_id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "friendrequest" ("id" SERIAL NOT NULL, "senderUserId" integer, "receiverUserId" integer, CONSTRAINT "PK_93d47d7b23f08b1b1180c47349d" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "intra_id" integer, "username" character varying(20) NOT NULL, "nickname" character varying(20), "img_url" character varying(255), "rank_score" integer NOT NULL DEFAULT '0', "currency" integer NOT NULL DEFAULT '0', "activity_status" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e3a88bfa3a0891f44f09eadc739" UNIQUE ("intra_id"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "match settings" ("match_setting_id" SERIAL NOT NULL, "map_appearance" integer NOT NULL DEFAULT '0', "timer" integer NOT NULL DEFAULT '300', "is_ranked" boolean NOT NULL DEFAULT false, "score_to_win" integer NOT NULL DEFAULT '0', "max_players" integer NOT NULL DEFAULT '2', "round_to_win" integer NOT NULL DEFAULT '2', CONSTRAINT "PK_0622478bce499d0255260aa6816" PRIMARY KEY ("match_setting_id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "match" ("match_id" SERIAL NOT NULL, "match_timer" integer NOT NULL, CONSTRAINT "PK_2e7d516f3dc97d9e2f882212d2b" PRIMARY KEY ("match_id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "match history" ("match_history_id" SERIAL NOT NULL, "current_score" integer NOT NULL DEFAULT '0', "round_won" integer NOT NULL DEFAULT '0', "is_ongoing" boolean NOT NULL DEFAULT true, "is_victory" boolean NOT NULL DEFAULT false, "userUserId" integer, "matchMatchId" integer, CONSTRAINT "PK_b9282af8e2efb2d0947a3d1c802" PRIMARY KEY ("match_history_id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "channels" ("channel_id" SERIAL NOT NULL, "channel_name" character varying(20) NOT NULL, "channel_password" character varying(30), "is_channel_private" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_3530dfdd05f6068ee22721bdd25" UNIQUE ("channel_name"), CONSTRAINT "PK_e5809c462cb7e05ef84de3c7843" PRIMARY KEY ("channel_id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "channel user" ("channel_user_id" SERIAL NOT NULL, "is_creator" boolean NOT NULL DEFAULT false, "is_admin" boolean NOT NULL DEFAULT false, "is_muted" boolean NOT NULL DEFAULT false, "is_banned" boolean NOT NULL DEFAULT false, "remaining_mute_time" TIMESTAMP, "userUserId" integer, "channelChannelId" integer, CONSTRAINT "PK_3e6484a18a01ac4828860fa3261" PRIMARY KEY ("channel_user_id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "messages" ("message_id" SERIAL NOT NULL, "message_content" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "authorUserId" integer, "channelChannelId" integer, CONSTRAINT "PK_6187089f850b8deeca0232cfeba" PRIMARY KEY ("message_id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "users_friends_users" ("usersUserId_1" integer NOT NULL, "usersUserId_2" integer NOT NULL, CONSTRAINT "PK_7fa6e909ff447876d3582a20c25" PRIMARY KEY ("usersUserId_1", "usersUserId_2"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_a92a6991599c4c8af5ed1b461f" ON "users_friends_users" ("usersUserId_1") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_053a8a15293a546588cebe1955" ON "users_friends_users" ("usersUserId_2") `,
		);
		await queryRunner.query(
			`ALTER TABLE "friendrequest" ADD CONSTRAINT "FK_ff67b468c77d6a0db0a025a4cb7" FOREIGN KEY ("senderUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "friendrequest" ADD CONSTRAINT "FK_3e8ad526eec5c3290c22be46890" FOREIGN KEY ("receiverUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "match history" ADD CONSTRAINT "FK_d85470a15ed6b38609cc61c4b03" FOREIGN KEY ("userUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "match history" ADD CONSTRAINT "FK_e8c40286dcdc4af2c777328a396" FOREIGN KEY ("matchMatchId") REFERENCES "match"("match_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel user" ADD CONSTRAINT "FK_426fccfdbb9ae37b2fa7ba707ab" FOREIGN KEY ("userUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel user" ADD CONSTRAINT "FK_434939df5750d58772613356e79" FOREIGN KEY ("channelChannelId") REFERENCES "channels"("channel_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_ddb84fe04b9750c677fdad498d1" FOREIGN KEY ("authorUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_17e78ccb07be0bb0620f615d3f6" FOREIGN KEY ("channelChannelId") REFERENCES "channels"("channel_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "users_friends_users" ADD CONSTRAINT "FK_a92a6991599c4c8af5ed1b461f8" FOREIGN KEY ("usersUserId_1") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "users_friends_users" ADD CONSTRAINT "FK_053a8a15293a546588cebe19558" FOREIGN KEY ("usersUserId_2") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "users_friends_users" DROP CONSTRAINT "FK_053a8a15293a546588cebe19558"`,
		);
		await queryRunner.query(
			`ALTER TABLE "users_friends_users" DROP CONSTRAINT "FK_a92a6991599c4c8af5ed1b461f8"`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" DROP CONSTRAINT "FK_17e78ccb07be0bb0620f615d3f6"`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" DROP CONSTRAINT "FK_ddb84fe04b9750c677fdad498d1"`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel user" DROP CONSTRAINT "FK_434939df5750d58772613356e79"`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel user" DROP CONSTRAINT "FK_426fccfdbb9ae37b2fa7ba707ab"`,
		);
		await queryRunner.query(
			`ALTER TABLE "match history" DROP CONSTRAINT "FK_e8c40286dcdc4af2c777328a396"`,
		);
		await queryRunner.query(
			`ALTER TABLE "match history" DROP CONSTRAINT "FK_d85470a15ed6b38609cc61c4b03"`,
		);
		await queryRunner.query(
			`ALTER TABLE "friendrequest" DROP CONSTRAINT "FK_3e8ad526eec5c3290c22be46890"`,
		);
		await queryRunner.query(
			`ALTER TABLE "friendrequest" DROP CONSTRAINT "FK_ff67b468c77d6a0db0a025a4cb7"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_053a8a15293a546588cebe1955"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_a92a6991599c4c8af5ed1b461f"`,
		);
		await queryRunner.query(`DROP TABLE "users_friends_users"`);
		await queryRunner.query(`DROP TABLE "messages"`);
		await queryRunner.query(`DROP TABLE "channel user"`);
		await queryRunner.query(`DROP TABLE "channels"`);
		await queryRunner.query(`DROP TABLE "match history"`);
		await queryRunner.query(`DROP TABLE "match"`);
		await queryRunner.query(`DROP TABLE "match settings"`);
		await queryRunner.query(`DROP TABLE "users"`);
		await queryRunner.query(`DROP TABLE "friendrequest"`);
		await queryRunner.query(`DROP TABLE "achievements"`);
	}
}
