export interface NotificationRequest {
	type: string;
	target_name: string;
	target_id: number;
	sent_at?: Date;
	accepted?: boolean;
	channel_id?: number;
}
export interface NotificationResponse {
	source_id: number;
	type: string;
	source_name: string;
	sent_at: Date;
	accepted: boolean;
}