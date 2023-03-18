import { Module } from '@nestjs/common';
import { ChannelsController } from './channels/channels.controller';
import { RootController } from './root/root.controller';
import { ProfileController } from './profile/profile.controller';
import { PlayController } from './play/play.controller';
import { LoginController } from './login/login.controller';
import { LeaderboardController } from './leaderboard/leaderboard.controller';

@Module({
	controllers: [
		ChannelsController,
		RootController,
		ProfileController,
		PlayController,
		LoginController,
		LeaderboardController,
	],
})
export class HomepageModule {}
