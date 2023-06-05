import { MatchSettingEntity } from 'src/entities';

export class NotificationRequest {
	type: string;
	target_name: string;
	target_id: number;
	sent_at: Date;
	accepted: boolean;
	channel_id: number;
}

export class NotificationResponse {
	type: string;
	source_name: string;
	source_id: number;
	sent_at: Date;
	accepted: boolean;
}
