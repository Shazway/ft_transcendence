/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class FourthMigration1680558363257 implements MigrationInterface {
    name = 'FourthMigration1680558363257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "achievement" ("achievement_id" SERIAL NOT NULL, "achievement_name" character varying(255) NOT NULL, "achievement_description" character varying(1024), "achievement_reward" character varying(30), "userUserId" integer, CONSTRAINT "PK_5cbaff867128cd6996d6aee95b1" PRIMARY KEY ("achievement_id"))`);
        await queryRunner.query(`CREATE TABLE "friend_request" ("id" SERIAL NOT NULL, "senderUserId" integer, "receiverUserId" integer, CONSTRAINT "PK_4c9d23ff394888750cf66cac17c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message" ("message_id" SERIAL NOT NULL, "message_content" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "authorChannelUserId" integer, "channelChannelId" integer, CONSTRAINT "PK_06a563cdbd963a9f7cbcb25c447" PRIMARY KEY ("message_id"))`);
        await queryRunner.query(`CREATE TABLE "channel" ("channel_id" SERIAL NOT NULL, "channel_name" character varying(20) NOT NULL, "channel_password" character varying(30), "is_channel_private" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_82553d18a60331b291c927e5ffe" UNIQUE ("channel_name"), CONSTRAINT "PK_161c95ba32beeb8aa68267b54ae" PRIMARY KEY ("channel_id"))`);
        await queryRunner.query(`CREATE TABLE "channel_user" ("channel_user_id" SERIAL NOT NULL, "is_creator" boolean NOT NULL DEFAULT false, "is_admin" boolean NOT NULL DEFAULT false, "is_muted" boolean NOT NULL DEFAULT false, "is_banned" boolean NOT NULL DEFAULT false, "remaining_mute_time" TIMESTAMP, "userUserId" integer, "channelChannelId" integer, CONSTRAINT "PK_6749a0a72af6932f778f3ec495d" PRIMARY KEY ("channel_user_id"))`);
        await queryRunner.query(`CREATE TABLE "match settings" ("match_setting_id" SERIAL NOT NULL, "map_appearance" integer NOT NULL DEFAULT '0', "timer" integer NOT NULL DEFAULT '300', "is_ranked" boolean NOT NULL DEFAULT false, "score_to_win" integer NOT NULL DEFAULT '0', "max_players" integer NOT NULL DEFAULT '2', "round_to_win" integer NOT NULL DEFAULT '2', CONSTRAINT "PK_0622478bce499d0255260aa6816" PRIMARY KEY ("match_setting_id"))`);
        await queryRunner.query(`CREATE TABLE "match" ("match_id" SERIAL NOT NULL, "current_score" integer array NOT NULL DEFAULT '{0,0}', "match_timer" integer NOT NULL, "round_won" integer array NOT NULL DEFAULT '{0,0}', "is_ongoing" boolean NOT NULL DEFAULT true, "is_victory" boolean array NOT NULL DEFAULT '{false,false}', CONSTRAINT "PK_2e7d516f3dc97d9e2f882212d2b" PRIMARY KEY ("match_id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("user_id" SERIAL NOT NULL, "intra_id" integer, "username" character varying(20) NOT NULL, "nickname" character varying(20), "img_url" character varying(255), "rank_score" integer NOT NULL DEFAULT '0', "currency" integer NOT NULL DEFAULT '0', "activity_status" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "wins" integer NOT NULL DEFAULT '0', "losses" integer NOT NULL DEFAULT '0', "blacklistedByUserId" integer, CONSTRAINT "UQ_b6b30080359ecd92bb2571c6336" UNIQUE ("intra_id"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e2364281027b926b879fa2fa1e0" UNIQUE ("nickname"), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "user_friend_user" ("userUserId_1" integer NOT NULL, "userUserId_2" integer NOT NULL, CONSTRAINT "PK_639bd80ba4f7d224b9e27439624" PRIMARY KEY ("userUserId_1", "userUserId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d8ee6796c777b44ef29c026bdd" ON "user_friend_user" ("userUserId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_7d095a83a532ec46832d9783ee" ON "user_friend_user" ("userUserId_2") `);
        await queryRunner.query(`CREATE TABLE "user_match_history_match" ("userUserId" integer NOT NULL, "matchMatchId" integer NOT NULL, CONSTRAINT "PK_bcb0e635e5569f40f2f930f8aa3" PRIMARY KEY ("userUserId", "matchMatchId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_85a8e9023f540a7570bccf2972" ON "user_match_history_match" ("userUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b9048c3a1c53129706aab9f45a" ON "user_match_history_match" ("matchMatchId") `);
        await queryRunner.query(`ALTER TABLE "achievement" ADD CONSTRAINT "FK_cce5fa18731eae85fd2a26bdc63" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_b387088f13b068e4f4e76f328ad" FOREIGN KEY ("senderUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_0d421a9a17dab5bb653b1dbcc53" FOREIGN KEY ("receiverUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_5dc0978a2ede39257d2e881f150" FOREIGN KEY ("authorChannelUserId") REFERENCES "channel_user"("channel_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_33449c0422a3cc356a8749ae8a4" FOREIGN KEY ("channelChannelId") REFERENCES "channel"("channel_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_user" ADD CONSTRAINT "FK_cd56b6df6ee4422199f37d528f5" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_user" ADD CONSTRAINT "FK_1d336cd9cb70c63464d813a6f3d" FOREIGN KEY ("channelChannelId") REFERENCES "channel"("channel_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_41d51ddd57c38f4b78ebcf8741d" FOREIGN KEY ("blacklistedByUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friend_user" ADD CONSTRAINT "FK_d8ee6796c777b44ef29c026bdd3" FOREIGN KEY ("userUserId_1") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_friend_user" ADD CONSTRAINT "FK_7d095a83a532ec46832d9783ee1" FOREIGN KEY ("userUserId_2") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_match_history_match" ADD CONSTRAINT "FK_85a8e9023f540a7570bccf2972b" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_match_history_match" ADD CONSTRAINT "FK_b9048c3a1c53129706aab9f45af" FOREIGN KEY ("matchMatchId") REFERENCES "match"("match_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_match_history_match" DROP CONSTRAINT "FK_b9048c3a1c53129706aab9f45af"`);
        await queryRunner.query(`ALTER TABLE "user_match_history_match" DROP CONSTRAINT "FK_85a8e9023f540a7570bccf2972b"`);
        await queryRunner.query(`ALTER TABLE "user_friend_user" DROP CONSTRAINT "FK_7d095a83a532ec46832d9783ee1"`);
        await queryRunner.query(`ALTER TABLE "user_friend_user" DROP CONSTRAINT "FK_d8ee6796c777b44ef29c026bdd3"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_41d51ddd57c38f4b78ebcf8741d"`);
        await queryRunner.query(`ALTER TABLE "channel_user" DROP CONSTRAINT "FK_1d336cd9cb70c63464d813a6f3d"`);
        await queryRunner.query(`ALTER TABLE "channel_user" DROP CONSTRAINT "FK_cd56b6df6ee4422199f37d528f5"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_33449c0422a3cc356a8749ae8a4"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_5dc0978a2ede39257d2e881f150"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_0d421a9a17dab5bb653b1dbcc53"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_b387088f13b068e4f4e76f328ad"`);
        await queryRunner.query(`ALTER TABLE "achievement" DROP CONSTRAINT "FK_cce5fa18731eae85fd2a26bdc63"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b9048c3a1c53129706aab9f45a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85a8e9023f540a7570bccf2972"`);
        await queryRunner.query(`DROP TABLE "user_match_history_match"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d095a83a532ec46832d9783ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8ee6796c777b44ef29c026bdd"`);
        await queryRunner.query(`DROP TABLE "user_friend_user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "match"`);
        await queryRunner.query(`DROP TABLE "match settings"`);
        await queryRunner.query(`DROP TABLE "channel_user"`);
        await queryRunner.query(`DROP TABLE "channel"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "friend_request"`);
        await queryRunner.query(`DROP TABLE "achievement"`);
    }

}
