import { User as UserEntity } from './users.entity';
import { Friendrequest as FriendrequestRelation } from './friend_request.entity';
import { MatchSetting as MatchSettingEntity } from './match_setting.entity';
import AchievementsEntity from './achievements.entity';
import { Match as MatchEntity } from './matchs.entity';
import { Channel as ChannelEntity } from './channels.entity';
import { ChannelUser as ChannelUserRelation } from './channel_user.entity';
import { Message as MessageEntity } from './messages.entity';
import { Skin as SkinEntity } from './skins.entity';

const entities = [
	UserEntity,
	FriendrequestRelation,
	MatchSettingEntity,
	AchievementsEntity,
	MatchEntity,
	ChannelEntity,
	ChannelUserRelation,
	MessageEntity,
	SkinEntity,
];

export {
	UserEntity,
	FriendrequestRelation,
	MatchSettingEntity,
	AchievementsEntity,
	MatchEntity,
	ChannelEntity,
	ChannelUserRelation,
	MessageEntity,
	SkinEntity,
};

export default entities;
