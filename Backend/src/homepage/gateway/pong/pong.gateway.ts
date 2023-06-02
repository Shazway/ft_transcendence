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
	constructor(
		private tokenManager: TokenManagerService,
		private itemsService: ItemsService,
		private matchService: MatchsService,
		private notificationsGateway: NotificationsGateway
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
		console.log(user.name);
		await this.connectMutex.waitForUnlock().then(async () => {
			await this.connectMutex.acquire().then(async () => {
				const userEntity = await this.itemsService.getUser(user.sub);
				const match_id = Number(client.handshake.query.match_id);

				if (Number.isNaN(match_id) || !match_id)
					return client.disconnect();
				const matchEntity = await this.itemsService.getMatch(match_id);
				if (!matchEntity || !matchEntity.is_ongoing)
					return client.disconnect();
				let match = this.matchs.get(match_id);

				console.log({ new_player: user });
				console.log("Match id: ");
				console.log(match_id);
				if (userEntity.inMatch)
					return client.disconnect();
				if (!(await this.isPlayer(user.sub, match_id)) && (!match || !match.started))
				{
					client.emit('notStarted', 'Match is not ready, please wait before joining again');
					console.log('ici');
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
				if (match)
				{
					console.log('MatchTest');
					console.log(match.started);
					console.log(match.players.length >= 2);
				}
				if (match.started && match.players.length >= 2)
				{
					match.gameService.spectators.push(this.buildPlayer(client, user.sub, user.name));
					console.log('emit spectateMatch');
					client.emit('spectateMatch', {
						matchSetting: new MatchSettingEntity(),
						ballPos: match.gameService.ball.pos,
						ballDir: match.gameService.ball.direction,
						playerPos: match.gameService.player1.pos,
						playerScore: match.gameService.player1.score,
						opponentPos: match.gameService.player2.pos,
						opponentScore: match.gameService.player2.score,
					});
					console.log('onSpectateMatch');
					this.emitToMatch('onSpectateMatch', {username: user.name, img_url: userEntity.img_url}, match);
					console.log('sent');
					return ;
				}
				console.log('pass3');
				if (match.players.length == 1 && match.players[0].user_id !== user.sub) {
					match.players.push(this.buildPlayer(client, user.sub, user.name));
				}
				console.log('pass4');
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
				console.log('final pass');
			});
			this.connectMutex.release();
			console.log('release');
		});
		console.log('end of connect');
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

	async handleDisconnect(client: Socket)
	{
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		if (!user) return ;
		console.log('disconnect from match + ' + user.name);
		const match_id = Number(client.handshake.query.match_id);

		console.log(match_id);
		if (Number.isNaN(match_id) || !match_id)
			return ;
		const match = this.matchs.get(match_id);
		const matchEntitiy = await this.itemsService.getMatch(match_id);
		if (!matchEntitiy || !match)
			return ;
		if (!matchEntitiy.user.find((player) => player.user_id == user.sub))
		{
			const userEntity = await this.itemsService.getUser(user.sub);

			userEntity.inMatch = false;
			await this.itemsService.saveUserState(userEntity);
			return this.emitToMatch('onUnSpectateMatch', {username: user.name}, match);
		}
		if (!matchEntitiy.is_ongoing)
			return this.matchs.delete(match_id);
		matchEntitiy.is_victory[this.getOtherPlayerIndex(matchEntitiy, user.sub)] = true;
		await this.matchService.setMatchEnd(matchEntitiy);
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
		if (match && match.players)
		{
			console.log('players: ');
			console.log(match.players);
			match.players.forEach((user) => {
				console.log('sent to player');
				user.client.emit(event, content);
			});
		}
		console.log('to Spec');
		if (match.gameService && match.gameService.spectators)
		{
			console.log('spectators: ');
			console.log(match.gameService.spectators);
			match.gameService.spectators.forEach((spectator) => {
				console.log('sent to spec');
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

		if (!match ||!match.gameService) throw new WsException('Match/GameService aren\'t available');
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
		if (!match.gameService) throw new WsException('No game service up');

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
