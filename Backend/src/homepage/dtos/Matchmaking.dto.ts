import { Socket } from 'socket.io';
import { Position } from './Pong.dto';
export class Player {
	client: Socket;
	user_id: number;
	username: string;
	position?: Position;
}

export class FoundMatch {
	username: string;
	match_id: number;
}
