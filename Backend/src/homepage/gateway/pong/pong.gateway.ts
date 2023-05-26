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
import { Mutex } from 'async-mutex';

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
	private connectMutex: Mutex;
	constructor(
		private tokenManager: TokenManagerService,
		private itemsService: ItemsService,
		private matchService: MatchsService
	) {
		this.connectMutex = new Mutex();
		this.matchs = new Map<number, Match>();
	}

	@WebSocketServer()
	server;

	buildPlayer(socket: Socket, id: number, name: string): Player {
		return { client: socket, user_id: id, username: name, isReady: false };
	}

	async isPlayer(userId: number, matchId: number)
	{
		const matchEntitiy = await this.itemsService.getMatch(matchId);

		if (!matchEntitiy)
			return null;
		return matchEntitiy.user.find((user) => user.user_id == userId)
	}

	async handleConnection(client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		if (!user) return client.disconnect();
		await this.connectMutex.waitForUnlock().then(async () => {
			await this.connectMutex.acquire().then(async () => {
				const userEntity = await this.itemsService.getUser(user.sub);
				const match_id = Number(client.handshake.query.match_id);
				if (!match_id)
					return client.disconnect();
				const matchEntity = await this.itemsService.getMatch(match_id);
				if (!matchEntity || !matchEntity.is_ongoing)
					return client.disconnect();
				let match = this.matchs.get(match_id);
		
				console.log({ new_player: user });
				if (userEntity.inMatch)
					return client.disconnect();
				if (!this.isPlayer(user.sub, match_id) && (!match || !match.started))
				{
					client.emit('notStarted', 'Match is not ready, please wait before joining again');
					client.disconnect();
				}
				userEntity.inMatch = true;
				await this.itemsService.saveUserState(userEntity);
				if (!match) {
					match = new Match();
					match.players = new Array<Player>();
					match.entity = matchEntity;
					match.players.push(this.buildPlayer(client, user.sub, user.name));
					this.matchs.set(match_id, match);
				}
				if (match.started && match.players.length >= 2)
				{
					match.gameService.spectators.push(this.buildPlayer(client, user.sub, user.name));
					client.emit('spectateMatch', {
						matchSetting: new MatchSettingEntity(),
						ballPos: match.gameService.ball.pos,
						ballDir: match.gameService.ball.direction,
						playerPos: match.gameService.player1.pos,
						playerScore: match.gameService.player1.score,
						opponentPos: match.gameService.player2.pos,
						opponentScore: match.gameService.player2.score,
					});
					return ;
				}
				if (match.players.length == 1 && match.players[0].user_id !== user.sub) {
					match.players.push(this.buildPlayer(client, user.sub, user.name));
				}
				if (match.players.length == 2 && !match.started){
					console.log('Le match commence');
					match.started = true;
					this.initMatch(match, await this.itemsService.getMatchSetting(match.entity.match_id));
				}
				else
					this.emitToMatch(
						'waitMatch',
						'Waiting for ' + match.entity.user[0] + ' to join or ' + match.entity.user[1],
						match
				)
			});
			this.connectMutex.release();
		});
	}

	initMatch(match: Match, setting: MatchSettingEntity) {
		match.gameService = new GamesService(this.itemsService);
		match.gameService.initObjects(match.players[0], match.players[1]);
		match.gameService.startGame(setting);
		match.gameService.match = match.entity;
	}

	async handleDisconnect(client: Socket)
	{
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		if (!user) return client.disconnect();
		const userEntity = await this.itemsService.getUser(user.sub);
		if (!userEntity)
			return ;
		const matchEntitiy = userEntity.match_history.find((match) => match.is_ongoing == true);
		if (!matchEntitiy)
			return;
		if (!matchEntitiy.is_ongoing)
			return this.matchs.delete(matchEntitiy.match_id);;
		matchEntitiy.is_victory[this.getOtherPlayerIndex(matchEntitiy, user.sub)] = true;
		await this.matchService.setMatchEnd(matchEntitiy);
		const match = this.matchs.get(matchEntitiy.match_id);
		if (!match)
			return;
		if (match.gameService) match.gameService.endMatch(user.sub);
	}

	getPlayerIndex(match: MatchEntity, userId: number): number {
		return Number(match.user[1].user_id == userId);
	}

	getOtherPlayerIndex(match: MatchEntity, userId: number): number {
		return Number(match.user[1].user_id != userId);
	}

	emitToMatch(event: string, content: any, match: Match) {
		match.players.forEach((user) => {
				user.client.emit(event, content);
		});
	}

	setUpindexes(user_id: number, players: Array<Player>): { moving: number; opponent: number } {
		if (players[0].user_id == user_id) return { moving: 0, opponent: 1 };
		return { moving: 1, opponent: 0 };
	}

	@SubscribeMessage('ArrowDown')
	async handleDown(@ConnectedSocket() client: Socket, @MessageBody() body: boolean) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);

		if (!match ||!match.gameService) throw new WsException('Match/GameService aren\'t available');
		match.gameService.changeInput(user.sub, 'ArrowDown', body);
		const move = match.gameService.getMove(user.sub);
		match.players.forEach((player, index) => {
			if (player.user_id == user.sub)
				player.client.emit('onPlayerMove', move);
			else
				player.client.emit('onOpponentMove', move);
		});
		match.gameService.emitToSpectators(match.players[0].user_id == user.sub ? 'onPlayerMove' : 'onOpponentMove', move);
	}

	@SubscribeMessage('ArrowUp')
	async handleUp(@ConnectedSocket() client: Socket, @MessageBody() body: boolean) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');

		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);
		if (!match.gameService) throw new WsException('No game service up');

		// console.log('user ' + user.sub + ' pressed ArrowUp');
		match.gameService.changeInput(user.sub, 'ArrowUp', body);
		const move = match.gameService.getMove(user.sub);
		match.players.forEach((player, index) => {
			if (player.user_id == 0){
			}
			else if (player.user_id == user.sub) player.client.emit('onPlayerMove', move);
			else player.client.emit('onOpponentMove', move);
			match.gameService.emitToSpectators(match.players[0].user_id == user.sub ? 'onPlayerMove' : 'onOpponentMove', move);
		});
	}

	@SubscribeMessage('ready')
	async playerReady(@ConnectedSocket() client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
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

	@SubscribeMessage('getSpectators')
	async getSpectators(@ConnectedSocket() client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const match_id = Number(client.handshake.query.match_id);
		const match = this.matchs.get(match_id);

		if (!user || !match || !match.gameService) throw new WsException('Match/GameService aren\'t available');
		client.emit('getSpectators', match.gameService.spectators);
	}
}
