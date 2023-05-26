export interface Achievement {
	achievement_name: string;
	achievement_description: string;
}

export interface AchievementList {
	unlockedAchievements: Achievement[];
	lockedAchievements: Achievement[];
}