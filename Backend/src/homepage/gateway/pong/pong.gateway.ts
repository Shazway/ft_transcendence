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
import { WsexceptionFilter } from 'src/homepage/filters/wsexception/wsexception.filter';
import { UseFilters } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@UseFilters(new WsexceptionFilter())
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
	private disconnectMutex: Mutex;
	constructor(
		private tokenManager: TokenManagerService,
		private itemsService: ItemsService,
		private matchService: MatchsService,
		private notificationsGateway: NotificationsGateway,
	) {
		this.connectMutex = new Mutex();
		this.disconnectMutex = new Mutex();
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

		await this.connectMutex.acquire().then(async () => {
			const userEntity = await this.itemsService.getUser(user.sub);
			const match_id = Number(client.handshake.query.match_id);

			if (Number.isNaN(match_id) || !match_id)
				return client.disconnect();
			const matchEntity = await this.itemsService.getMatch(match_id);
			if (!matchEntity || !matchEntity.is_ongoing)
				return client.disconnect();
			if (userEntity.inMatch)
				return client.emit('onError', "Already in match");
			let match = this.matchs.get(match_id);
			if (!(await this.isPlayer(user.sub, match_id)) && (!match || !match.started))
			{
				client.emit('notStarted', 'Match is not ready, please wait before joining again');
				client.disconnect();
			}
			userEntity.inMatch = true;
			await this.itemsService.saveUserState(userEntity);
			if (!match)
			{
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
				this.emitToMatch('onSpectateMatch', {username: user.name, img_url: userEntity.img_url}, match);
				return ;
			}
			if (match.players.length == 1 && match.players[0].user_id == user.sub)
				return ;
			match.players.push(this.buildPlayer(client, user.sub, user.name));
			if (match.players.length == 2 && !match.started){
				match.started = true;
				this.initMatch(match, await this.itemsService.getMatchSetting(match.entity.match_id));
			}
		});
		this.connectMutex.release();
	}

	initMatch(match: Match, setting: MatchSettingEntity) {
		match.gameService = new GamesService(this.itemsService, this.notificationsGateway);
		if (match.entity.user[0].user_id != match.players[0].user_id) {
			match.players.reverse();
		}
		match.gameService.initObjects(match.players[0], match.players[1]);
		match.gameService.startGame(setting);
		match.gameService.match = match.entity;
	}

	isSpectator(match: Match, userId: number) {
		return match.gameService && match.gameService.spectators && match.gameService.spectators.find((spectator) => spectator.user_id == userId);
	}

	isPlayerCheck(matchEntity: MatchEntity, userId: number)
	{
		return matchEntity.user.find((player) => player.user_id == userId)
	}

	async handleDisconnect(client: Socket)
	{
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		if (!user) return ;
		const match_id = Number(client.handshake.query.match_id);

		if (Number.isNaN(match_id) || !match_id)
			return ;
		const match = this.matchs.get(match_id);
		const matchEntity = await this.itemsService.getMatch(match_id);
		if (!matchEntity || !match || (!this.isPlayerCheck(matchEntity, user.sub) && !this.isSpectator(match, user.sub)))
			return ;
		if (this.isSpectator(match, user.sub) && !this.isPlayerCheck(matchEntity, user.sub))
		{
			match.gameService.endMatchSpectator(user.sub);
			return this.emitToMatch('onUnspectateMatch', {username: user.name}, match);
		}
		if ((match.gameService && !match.gameService.match.is_ongoing) || !matchEntity.is_ongoing)
			return this.matchs.delete(match_id);
		await this.matchService.setMatchEnd(matchEntity);
		if (match.gameService)
			match.gameService.endMatch(user.sub);
	}

	getPlayerIndex(match: MatchEntity, userId: number): number {
		return Number(match.user[1].user_id == userId);
	}

	getOtherPlayerIndex(match: MatchEntity, userId: number): number {
		return Number(match.user[1].user_id != userId);
	}

	emitToMatch(event: string, content: any, match: Match) {
		if (!match)
			return ;
		if (match.players)
		{
			match.players.forEach((user) => {
				user.client.emit(event, content);
			});
		}
		if (match.gameService && match.gameService.spectators)
		{
			match.gameService.spectators.forEach((spectator) => {
				spectator.client.emit(event, content);
			});
		}
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

		if (!match ||!match.gameService) return client.emit('onError', 'The game is not ready yet');
		match.gameService.changeInput(user.sub, 'ArrowDown', body);
		const move = match.gameService.getMove(user.sub);
		match.players.forEach((player) => {
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

		if (!match ||!match.gameService) return client.emit('onError', 'The game is not ready yet');
		match.gameService.changeInput(user.sub, 'ArrowUp', body);
		const move = match.gameService.getMove(user.sub);
		match.players.forEach((player) => {
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

		if (!match || !match.gameService) return client.emit('onError', 'The game is not ready yet');
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

	@SubscribeMessage('getProfiles')
	async getProfiles(@ConnectedSocket() client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'ws');
		const match_id = Number(client.handshake.query.match_id);
		const match = await this.itemsService.getMatch(match_id);

		let player;
		let opponent;
		if (!match) throw new WsException('No matches ongoing');
		if (match.user[0].user_id == user.sub) {
			player = match.user[0];
			opponent = match.user[1];
		}
		else if (match.user[1].user_id == user.sub) {
			player = match.user[1];
			opponent = match.user[0];
		}
		else {
			player = match.user[0];
			opponent = match.user[1];
		}
		client.emit('onRecieveProfile', {player, opponent});
	}
}
