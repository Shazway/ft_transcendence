import { Exclude } from 'class-transformer';
import { MatchEntity } from 'src/entities';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { Message } from 'src/entities/messages.entity';
import { User } from 'src/entities/users.entity';
import { MatchSettingDto } from 'src/homepage/dtos/MatchSettings.dto';
import { Player } from './Matchmaking.dto';

export class MatchDto {
	entity: MatchEntity;
	players: Array<Player>;
}
