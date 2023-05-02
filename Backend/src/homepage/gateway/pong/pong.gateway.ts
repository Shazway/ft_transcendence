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
import { Player } from 'src/homepage/dtos/Matchmaking.dto';
import { GamesService } from 'src/homepage/services/game/game.service';
import { MatchSettingEntity } from 'src/entities';
import { MatchsService } from 'src/homepage/services/matchs/matchs.service';

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
		private matchService: MatchsService
	) {
		this.matchs = new Map<number, MatchDto>();
	}

	@WebSocketServer()
	server;

	buildPlayer(socket: Socket, id: number, name: string): Player {
		return { client: socket, user_id: id, username: name, isReady: false };
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
			match.players.push(this.buildPlayer(client, user.sub, user.name));
			this.matchs.set(match_id, match);
		}
		if (match.players.length == 1 && match.players[0].user_id !== user.sub) {
			match.players.push(this.buildPlayer(client, user.sub, user.name));
		}
		if (match.players.length == 2) {
			this.initMatch(match, await this.itemsService.getMatchSetting(match.entity.match_id));
		} else
			this.emitToMatch(
				'waitMatch',
				'Waiting for ' + match.entity.user[0] + ' to join or ' + match.entity.user[1],
				match
			);
	}

	async initMatch(match: MatchDto, setting: MatchSettingEntity) {
		match.gameService = new GamesService();
		match.gameService.initObjects(match.players[0], match.players[1]);
		match.gameService.startGame(setting);
	}

	async handleDisconnect(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const userEntity = await this.itemsService.getUser(user.sub);
		const matchEntity = userEntity.match_history[userEntity.match_history.length - 1];
		if (!matchEntity)
			return ;
		const match = this.matchs.get(matchEntity.match_id);
		if (!match)
			return ;
		if (!matchEntity) {
			match.players = match.players.filter((player) => {
				player.user_id !== user.sub;
			});
			if (!match.players.length) this.matchs.delete(matchEntity.match_id);
		}
		if (!matchEntity.is_ongoing) {
			match.players = match.players.filter((player) => {
				player.user_id !== user.sub;
			});
			if (!match.players.length) {
				match.gameService.endGame();
				await this.matchService.setMatchEnd(matchEntity);
				this.matchs.delete(matchEntity.match_id);
			}
		} else return; //TODO faire des trucs genre attendre qu'il se reconnecte après le point en cours ou autre
	}

	emitToMatch(event: string, content: any, match: MatchDto) {
		match.players.forEach((user) => {
			user.client.emit(event, content);
		});
	}

	setUpindexes(user_id: number, players: Array<Player>): { moving: number; opponent: number } {
		if (players[0].user_id == user_id) return { moving: 0, opponent: 1 };
		return { moving: 1, opponent: 0 };
	}

	@SubscribeMessage('ArrowDown')
	handleDown(@ConnectedSocket() client: Socket, @MessageBody() body: boolean) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);
		if (!match.gameService) return;

		// console.log('user ' + user.sub + ' pressed ArrowDown');
		match.gameService.changeInput(user.sub, 'ArrowDown', body);
		const move = match.gameService.getMove(user.sub);
		match.players.forEach((player) => {
			if (player.user_id == user.sub) player.client.emit('onPlayerMove', move);
			else player.client.emit('onOpponentMove', move);
		});
	}

	@SubscribeMessage('ArrowUp')
	handleUp(@ConnectedSocket() client: Socket, @MessageBody() body: boolean) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);
		if (!match.gameService) return;

		// console.log('user ' + user.sub + ' pressed ArrowUp');
		match.gameService.changeInput(user.sub, 'ArrowUp', body);
		const move = match.gameService.getMove(user.sub);
		match.players.forEach((player) => {
			if (player.user_id == user.sub) player.client.emit('onPlayerMove', move);
			else player.client.emit('onOpponentMove', move);
		});
	}

	@SubscribeMessage('ready')
	async playerReady(@ConnectedSocket() client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);
		if (!match.gameService) return;

		match.players.forEach((player) => {
			if (player.user_id == user.sub) {
				player.isReady = true;
				player.client.emit('onPlayerReady');
			} else player.client.emit('onOpponentReady');
		});
		if (match.players[0].isReady && match.players[1].isReady)
			this.emitToMatch(
				'startMatch',
				await this.itemsService.getMatchSetting(match.entity.match_id),
				match
			);
	}
}
