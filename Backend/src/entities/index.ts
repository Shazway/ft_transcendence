import { User as UserEntity } from './users.entity';
import { Friendrequest as FriendrequestRelation } from './friend_request.entity';
import { MatchSetting as MatchSettingEntity } from './match_setting.entity';
import AchievementsEntity from './achievements.entity';
import { MatchHistory as MatchHistoryRelation } from './match_history.entity';
import { Match as MatchEntity } from './matchs.entity';
import { Channel as ChannelEntity } from './channels.entity';
import { ChannelUser as ChannelUserRelation } from './channel_user.entity';
import { Message as MessageEntity } from './messages.entity';

const entities = [
	UserEntity,
	FriendrequestRelation,
	MatchSettingEntity,
	AchievementsEntity,
	MatchEntity,
	MatchHistoryRelation,
	ChannelEntity,
	ChannelUserRelation,
	MessageEntity,
];

export {
	UserEntity,
	FriendrequestRelation,
	MatchSettingEntity,
	AchievementsEntity,
	MatchEntity,
	MatchHistoryRelation,
	ChannelEntity,
	ChannelUserRelation,
	MessageEntity,
};

export default entities;
