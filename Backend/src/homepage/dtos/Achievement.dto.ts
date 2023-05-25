import { AchievementsEntity } from 'src/entities';

export class AchievementList {
	unlockedAchievements: Array<AchievementsEntity>;
	lockedAchievements: Array<AchievementsEntity>;
}
