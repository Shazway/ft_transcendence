import { Socket } from 'socket.io';

export class Player {
	client: Socket;
	user_id: number;
	username: string;
	directionUp?: boolean;
	directionDown?: boolean;
}

export class FoundMatch {
	username: string;
	match_id: number;
}
