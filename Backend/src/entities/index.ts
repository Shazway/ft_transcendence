import {
	User as UserEntity,
	Friendrequest as FriendrequestRelation,
} from './users.entity';
import { MatchSetting as MatchSettingEntity } from './match_setting.entity';

const entities = [UserEntity, FriendrequestRelation, MatchSettingEntity];

export { UserEntity, FriendrequestRelation, MatchSettingEntity };

export default entities;
