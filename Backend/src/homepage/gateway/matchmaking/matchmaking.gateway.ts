import {
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ChannelGateway } from '../channel/channel.gateway';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { MatchsService } from 'src/homepage/services/matchs/matchs.service';
import { FoundMatch, Player } from 'src/homepage/dtos/Matchmaking.dto';
import { User } from 'src/entities/users.entity';

@WebSocketGateway(3004, {
	cors: {
		origin: '*',
	},
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
		private matchsService: MatchsService,
	) {
		this.userQueue = new Map<string, Map<number, Player>>();
		this.matchMaker = new Array<Player>;
	}
	@WebSocketServer()
	server;

	getRankFork(rank_score: number) {
		return ((rank_score - (rank_score % 100)).toString());
	}

	buildPlayer(socket: Socket, id: number, name: string)
	{
		return ({client: socket, user_id: id, username: name});
	}

	async handleConnection(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		console.log({new_player: user});
		const player_rank = (await this.itemsService.getUser(user.sub)).rank_score;
		const rankFork = this.getRankFork(player_rank);
		const playersFork = this.userQueue.get(rankFork);
		if (!playersFork)
			this.userQueue.set(rankFork, new Map<number, Player>());
		const bracket = this.userQueue.get(rankFork);
		const player = this.buildPlayer(client, user.sub, user.name);
		bracket.set(user.sub, player);
		if (!this.interval)
			await this.handleStartTimer();
	}

	async handleDisconnect(client: Socket) {
		const user = this.tokenManager.getToken(client.request.headers.authorization);
		const player_rank = (await this.itemsService.getUser(user.sub)).rank_score;
		const rankFork = this.getRankFork(player_rank);
		const bracket = this.userQueue.get(rankFork);
		if (bracket)
		{
			bracket.delete(user.sub);
			if (!bracket.size)
			{
				this.userQueue.delete(rankFork);
				if (!this.userQueue.size)
					this.handleStopTimer();
			}
		}
	}

	buildMatchDto(opponent: string, matchId: number): FoundMatch {
		return {
			match_id: matchId,
			username: opponent,
		};
	}

	async addUserTobracket(user_id: number, player: Player) {
		const player_rank = (await this.itemsService.getUser(user_id)).rank_score;
		const rankFork = this.getRankFork(player_rank);
		const bracket = this.userQueue.get(rankFork);
		bracket.set(user_id, player);
	}
	
	secureMatchMaker(user: Player) {
		let replaceCheck = false;
		this.matchMaker.forEach((player) => {
			if (user.user_id == player.user_id)
			{
				player.client.disconnect();
				player = user;
				replaceCheck = true;
			}
		})
		if (!replaceCheck)
			return this.matchMaker.push(user);
		return user;
	}

	async handleStartTimer() {
		this.interval = setInterval(async () => {
			this.userQueue.forEach(async (bracket) => {
				bracket.forEach(async (user) => {
					this.secureMatchMaker(user);
					if (this.matchMaker.length == 2)
					{
						const match = await this.matchsService.createFullMatch(this.matchMaker[0].user_id, this.matchMaker[1].user_id, false);
						this.matchMaker[0].client.emit('foundMatch', this.buildMatchDto(this.matchMaker[1].username, match.match_id));
						this.matchMaker[1].client.emit('foundMatch', this.buildMatchDto(this.matchMaker[0].username, match.match_id));
						this.matchMaker.splice(0, this.matchMaker.length);
					}
				})
				bracket.clear();
			})
			if (this.matchMaker.length == 1)
				this.matchMaker[0].client.emit('onError', 'Pending');
		}, 2000);
	}

	handleStopTimer() {
		clearInterval(this.interval);
		this.interval = null;
	}
}