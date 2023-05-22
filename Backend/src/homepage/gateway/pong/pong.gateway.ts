/* eslint-disable prettier/prettier */
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException
} from '@nestjs/websockets';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { Socket } from 'socket.io';
import { Match } from 'src/homepage/dtos/Match.dto';
import { Player } from 'src/homepage/dtos/Matchmaking.dto';
import { GamesService } from 'src/homepage/services/game/game.service';
import { MatchEntity, MatchSettingEntity } from 'src/entities';
import { MatchsService } from 'src/homepage/services/matchs/matchs.service';
import { cp } from 'fs';

@WebSocketGateway(3005, {
	cors: {
		origin: 'http://localhost:4200'
	}
})
export class PongGateway {
	private matchs: Map<number, Match>;
	UP = 1;
	DOWN = 0;
	VELOCITY = 1;
	constructor(
		private tokenManager: TokenManagerService,
		private itemsService: ItemsService,
		private matchService: MatchsService
	) {
		this.matchs = new Map<number, Match>();
	}

	@WebSocketServer()
	server;

	buildPlayer(socket: Socket, id: number, name: string): Player {
		return { client: socket, user_id: id, username: name, isReady: false };
	}

	async handleConnection(client: Socket) {
		let user;
		try {
			user = this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		} catch(error) {
			console.log(error);
			client.disconnect();
			return ;
		}
		const match_id = Number(client.handshake.query.match_id);
		let match = this.matchs.get(match_id);
		
		console.log({ new_player: user });
		if (!match) {
			match = new Match();
			match.players = new Array<Player>();
			match.entity = await this.itemsService.getMatch(match_id);
			match.players.push(this.buildPlayer(client, user.sub, user.name));
			this.matchs.set(match_id, match);
		}
		if (match.players.length == 1 && match.players[0].user_id !== user.sub) {
			match.players.push(this.buildPlayer(client, user.sub, user.name));
		}
		if (match_id == 0)
		{
			match.players.push(this.buildPlayer(null, 0, 'System'));
			const matchEntity = await this.matchService.createFullMatch(
				user.sub,
				0,
				false
			);
			match.entity = matchEntity;
			match.players[1].isReady = true;
			this.initMatch(match, await this.itemsService.getMatchSetting(match.entity.match_id));
			return ;
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

	initMatch(match: Match, setting: MatchSettingEntity) {
		match.gameService = new GamesService(this.itemsService);
		match.gameService.initObjects(match.players[0], match.players[1]);
		match.gameService.startGame(setting);
		match.gameService.match = match.entity;
	}

	async handleDisconnect(client: Socket)
	{
		let user;
		try {
			user = this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		} catch(error) {
			return ;
		}
		const userEntity = await this.itemsService.getUser(user.sub);
		if (!userEntity)
			return ;
		const matchEntitiy = userEntity.match_history.find((match) => match.is_ongoing == true);
		if (!matchEntitiy)
			return ;
		await this.matchService.setMatchEnd(matchEntitiy);
		matchEntitiy.is_victory[this.getOtherPlayerIndex(matchEntitiy, user.sub)] = true;
		this.matchService.setMatchEnd(matchEntitiy);

		const match = this.matchs.get(matchEntitiy.match_id);
		if (!match)
			return;
		match.gameService.endMatch(user.sub);
		this.matchs.delete(matchEntitiy.match_id);
	}

	getPlayerIndex(match: MatchEntity, userId: number): number {
		return Number(match.user[1].user_id == userId);
	}

	getOtherPlayerIndex(match: MatchEntity, userId: number): number {
		return Number(match.user[1].user_id != userId);
	}

	emitToMatch(event: string, content: any, match: Match) {
		match.players.forEach((user) => {
			if (user.user_id == 0) {}
			else
				user.client.emit(event, content);
		});
	}

	setUpindexes(user_id: number, players: Array<Player>): { moving: number; opponent: number } {
		if (players[0].user_id == user_id) return { moving: 0, opponent: 1 };
		return { moving: 1, opponent: 0 };
	}

	@SubscribeMessage('ArrowDown')
	handleDown(@ConnectedSocket() client: Socket, @MessageBody() body: boolean) {
		const user = this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);

		if (!match ||!match.gameService) throw new WsException('Match/GameService aren\'t available');
		match.gameService.changeInput(user.sub, 'ArrowDown', body);
		const move = match.gameService.getMove(user.sub);
		match.players.forEach((player) => {
			if (player.user_id == 0){
			}
			else if (player.user_id == user.sub) player.client.emit('onPlayerMove', move);
			else player.client.emit('onOpponentMove', move);
		});
	}

	@SubscribeMessage('ArrowUp')
	handleUp(@ConnectedSocket() client: Socket, @MessageBody() body: boolean) {
		const user = this.tokenManager.getToken(client.request.headers.authorization, 'ws');

		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);
		if (!match.gameService) throw new WsException('No game service up');

		// console.log('user ' + user.sub + ' pressed ArrowUp');
		match.gameService.changeInput(user.sub, 'ArrowUp', body);
		const move = match.gameService.getMove(user.sub);
		match.players.forEach((player) => {
			if (player.user_id == 0){
			}
			else if (player.user_id == user.sub) player.client.emit('onPlayerMove', move);
			else player.client.emit('onOpponentMove', move);
		});
	}

	@SubscribeMessage('ready')
	async playerReady(@ConnectedSocket() client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);

		if (!match || !match.gameService) throw new WsException('Match/GameService aren\'t available');
		match.players.forEach((player) => {
			if (player.user_id == 0){
			}
			else if (player.user_id == user.sub) {
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
