import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { Socket } from 'socket.io';
import { MatchDto } from 'src/homepage/dtos/MatchDto.dto';
import { MatchsService } from 'src/homepage/services/matchs/matchs.service';
import { Move, Position } from 'src/homepage/dtos/Pong.dto';
import { Player } from 'src/homepage/dtos/Matchmaking.dto';

@WebSocketGateway(3005, {
	cors: {
		origin: '*'
	}
})
export class PongGateway {
	private matchs: Map<number, MatchDto>;
	UP = 1;
	DOWN = 0;
	VELOCITY = 1;
	constructor(
		private tokenManager: TokenManagerService,
		private itemsService: ItemsService,
		private matchsService: MatchsService
	) {
		this.matchs = new Map<number, MatchDto>();
	}

	@WebSocketServer()
	server;

	buildPlayer(socket: Socket, id: number, name: string, pos: Position) {
		return { client: socket, user_id: id, username: name, position: pos };
	}

	playerStartingPos(side: string): Position {
		return { x: side == 'right' ? 100 : 0, y: 50, object: 'player' };
	}

	async handleConnection(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const match_id = Number(client.handshake.query.match_id);
		let match = this.matchs.get(match_id);

		console.log({ new_player: user });
		if (!match) {
			match = new MatchDto();
			match.players = new Array<Player>();
			match.entity = await this.itemsService.getMatch(match_id);
			match.players.push(
				this.buildPlayer(client, user.sub, user.name, this.playerStartingPos('left'))
			);
			this.matchs.set(match_id, match);
		}
		match.players.push(
			this.buildPlayer(client, user.sub, user.name, this.playerStartingPos('right'))
		);
		if (match.players.length == 2) this.emitToMatch(match_id, 'startMatch', 'Match can begin');
		else this.emitToMatch(match_id, 'waitMatch', 'Waiting for other player to join');
	}

	async handleDisconnect(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const userEntity = await this.itemsService.getUser(user.sub);
		const matchEntity = userEntity.match_history[userEntity.match_history.length - 1];
		if (!matchEntity.is_ongoing) {
			const match = this.matchs.get(matchEntity.match_id);
			match.players = match.players.filter((player) => {
				player.user_id !== user.sub;
			});
			if (!match.players.length) this.matchs.delete(matchEntity.match_id);
		} else return; //TODO faire des trucs genre attendre qu'il se reconnecte après le point en cours ou autre
	}

	emitToMatch(match_id: number, event: string, content: any) {
		const match = this.matchs.get(match_id);
		match.players.forEach((user) => {
			user.client.emit(event, content);
		});
	}

	setUpindexes(user_id: number, players: Array<Player>): { moving: number; opponent: number } {
		if (players[0].user_id == user_id) return { moving: 0, opponent: 1 };
		return { moving: 1, opponent: 0 };
	}

	

	@SubscribeMessage('ArrowDown')
	handleDown(@ConnectedSocket() client: Socket, @MessageBody() body: Move) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		this.emitToMatch(body.match_id, 'ArrowDown', {user_id: user.sub});
	}

	@SubscribeMessage('ArrowUp')
	handleUp(@ConnectedSocket() client: Socket, @MessageBody() body: Move) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		this.emitToMatch(body.match_id, 'ArrowUp', {user_id: user.sub});
	}
}
