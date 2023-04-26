import { Socket } from 'socket.io';

export class Player {
	client: Socket;
	user_id: number;
	username: string;
	rounds_won?: number;
	current_points?: number;
	directionUp?: boolean;
	directionDown?: boolean;
}

export class FoundMatch {
	username: string;
	match_id: number;
}
