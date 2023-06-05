export interface Achievement {
	achievement_id: number
	achievement_name: string;
	achievement_description: string;
	achievement_reward?: string;
}

export interface AchievementList {
	unlockedAchievements: Achievement[];
	lockedAchievements: Achievement[];
}
