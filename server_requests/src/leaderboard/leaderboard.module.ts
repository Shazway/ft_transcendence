import { Module } from '@nestjs/common';
import { PlayersController } from './controllers/players/players.controller';

@Module({
  controllers: [PlayersController]
})
export class LeaderboardModule {}
