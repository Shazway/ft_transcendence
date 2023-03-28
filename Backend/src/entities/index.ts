import { User as UserEntity } from './users.entity';
import { Friendrequest as FriendrequestRelation } from './friend_request.entity';
import { MatchSetting as MatchSettingEntity } from './match_setting.entity';
import { Achievements as AchievementsEntity } from './achievements.entity';
import { MatchHistory as MatchHistoryEntity } from './match_history.entity';
import { Match as MatchEntity } from './matchs.entity';
import { Channel as ChannelEntity } from './channels.entity';
import { ChannelUser as ChannelUserEntity } from './channel_user.entity';
import { Message as MessageEntity } from './messages.entity';

const entities = [UserEntity, FriendrequestRelation, MatchSettingEntity, AchievementsEntity, MatchEntity, MatchHistoryEntity, ChannelEntity, ChannelUserEntity, MessageEntity];

export { UserEntity, FriendrequestRelation, MatchSettingEntity, AchievementsEntity, MatchEntity, MatchHistoryEntity, ChannelEntity, ChannelUserEntity, MessageEntity };

export default entities;
