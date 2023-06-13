import { WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ChannelGateway } from '../channel/channel.gateway';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { MatchsService } from 'src/homepage/services/matchs/matchs.service';
import { FoundMatch, Player } from 'src/homepage/dtos/Matchmaking.dto';
import { WsexceptionFilter } from 'src/homepage/filters/wsexception/wsexception.filter';
import { UseFilters } from '@nestjs/common';

@UseFilters(new WsexceptionFilter())
@WebSocketGateway(3004, {
	cors: {
		origin: 'http://localhost:4200'
	}
})
export class MatchmakingGateway {
	private userQueue: Map<string, Map<number, Player>>;
	private matchMaker: Array<Player>;
	private interval;
	constructor(
		private tokenManager: TokenManagerService,
		private notificationsGateway: NotificationsGateway,
		private channelsGateway: ChannelGateway,
		private itemsService: ItemsService,
		private matchsService: MatchsService
	) {
		this.userQueue = new Map<string, Map<number, Player>>();
		this.matchMaker = new Array<Player>();
	}
	@WebSocketServer()
	server;

	getRankFork(rank_score: number) {
		return (rank_score - (rank_score % 100)).toString();
	}

	buildPlayer(socket: Socket, id: number, name: string): Player {
		return { client: socket, user_id: id, username: name, isReady: false };
	}

	async handleConnection(client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		if (!user) return client.disconnect();
		console.log({ new_player: user });
		const player = await this.itemsService.getUser(user.sub);
		if (!player || player.inMatch) {
			client.emit('inMatch');
			return client.disconnect();
		}
		const rankFork = this.getRankFork(player.rank_score);
		let bracket = this.userQueue.get(rankFork);
		if (!bracket) {
			this.userQueue.set(rankFork, new Map<number, Player>());
			bracket = this.userQueue.get(rankFork);
		}
		const newPlayer = this.buildPlayer(client, user.sub, user.name);
		bracket.set(user.sub, newPlayer);

		if (!this.interval) await this.handleStartTimer();
	}

	async handleDisconnect(client: Socket) {
		const user = await this.tokenManager.getToken(client.request.headers.authorization, 'EEEE');
		if (!user) return client.disconnect();
		const player = await this.itemsService.getUser(user.sub);

		if (!player) return client.disconnect();
		player.inMatch = false;
		this.itemsService.saveUserState(player);
		const rankFork = this.getRankFork(player.rank_score);
		const bracket = this.userQueue.get(rankFork);
		this.matchMaker = this.matchMaker.filter((player) => player.user_id != user.sub);
		if (bracket) {
			bracket.delete(user.sub);
			if (!bracket.size) {
				this.userQueue.delete(rankFork);
				if (!this.userQueue.size) this.handleStopTimer();
			}
		}
	}

	buildMatch(opponent: string, matchId: number): FoundMatch {
		return {
			match_id: matchId,
			username: opponent
		};
	}

	async addUserTobracket(user_id: number, player: Player) {
		const user = await this.itemsService.getUser(user_id);

		if (!user) throw new WsException('User does not exist');
		const rankFork = this.getRankFork(user.rank_score);
		const bracket = this.userQueue.get(rankFork);
		bracket.set(user_id, player);
		return true;
	}

	secureMatchMaker(user: Player) {
		let replaceCheck = false;
		this.matchMaker.forEach((player) => {
			if (user.user_id == player.user_id) {
				player.client.disconnect();
				player = user;
				replaceCheck = true;
			}
		});
		if (!replaceCheck) return this.matchMaker.push(user);
		return user;
	}

	async handleStartTimer() {
		this.interval = setInterval(async () => {
			this.userQueue.forEach(async (bracket) => {
				bracket.forEach(async (user) => {
					this.secureMatchMaker(user);
					if (this.matchMaker.length == 2 && this.matchMaker[0] && this.matchMaker[1]) {
						const match = await this.matchsService.createFullMatch(
							this.matchMaker[0].user_id,
							this.matchMaker[1].user_id
						);
						this.matchMaker[0].client.emit(
							'foundMatch',
							this.buildMatch(this.matchMaker[1].username, match.match_id)
						);
						this.matchMaker[1].client.emit(
							'foundMatch',
							this.buildMatch(this.matchMaker[0].username, match.match_id)
						);
						console.log(
							this.matchMaker[0].username + ' + ' + this.matchMaker[1].username
						);
						this.matchMaker.splice(0, this.matchMaker.length);
					}
				});
				bracket.clear();
			});
			if (this.matchMaker.length == 1) this.matchMaker[0].client.emit('onError', 'Pending');
			console.log(this.userQueue);
			console.log(this.matchMaker);
		}, 2000);
	}

	handleStopTimer() {
		clearInterval(this.interval);
		this.interval = null;
	}
}
