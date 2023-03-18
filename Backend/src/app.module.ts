import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [UsersModule, LeaderboardModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
