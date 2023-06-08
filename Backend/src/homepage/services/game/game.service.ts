/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MatchEntity, MatchSettingEntity } from 'src/entities';
import { Player } from 'src/homepage/dtos/Matchmaking.dto';
import { GameEnd, Move, ballObject, pongObject } from 'src/homepage/dtos/Pong.dto';
import { ItemsService } from '../items/items.service';
import { NotificationsGateway } from 'src/homepage/gateway/notifications/notifications.gateway';
import { forEach, random } from 'mathjs';

@Injectable()
export class GamesService {
	LEFT = 0;
	RIGHT = 1;
	LOSS = 0;
	WIN = 1;
	private interval: NodeJS.Timeout;

	private matchSetting: MatchSettingEntity;
	public player1: pongObject;
	public player2: pongObject;
	public ball: ballObject;
	private oldDate: Date;
	private movespeed = 5;
	private gamespeed = 13;
	private oldDir = 0;
	private countdown = 300;
	public match: MatchEntity;
	public spectators: Array<Player>;
	constructor(
		private itemsService: ItemsService,
		private notifGateway: NotificationsGateway,
	) {
		this.spectators = new Array<Player>;
		this.match = new MatchEntity();
		this.player1 = new pongObject(1000, 600);
		this.player2 = new pongObject(1000, 600);
		this.ball = new ballObject(1000, 600);
		this.oldDate = new Date();
	}

	initObjects(player1: Player, player2: Player) {
		this.player1.init(10, 250, 20, 100, player1);
		this.player2.init(1000 - 30, 250, 20, 100, player2);
		this.ball.init(500, 300, 10);
	}

	startGame(settings: MatchSettingEntity) {
		this.matchSetting = settings;
		this.interval = setInterval(() => {
			const date = new Date();
			this.update((date.getTime() - this.oldDate.getTime()) / this.gamespeed);
			this.oldDate = new Date();
		}, 1000 / 300);
	}

	endGame() {
		clearTimeout(this.interval);
		this.interval = null;
	}

	closeEnoughPlayer() {
		return this.ball.pos.x <= this.player1.upperRightCorner.x + this.ball.DIAMETER;
	}
	closeEnoughOpponent() {
		return this.ball.pos.x >= this.player2.upperLeftCorner.x - this.ball.DIAMETER;
	}
	

	async emitToSpectators(event: string, content: any)
	{
		this.spectators = this.spectators.filter((spectator) => spectator.client.connected)
		this.spectators.forEach((spectator) => {
			spectator.client.emit(event, content);
		})
	}

	checkDirectionChange()
	{
		if (this.oldDir != this.ball.direction) {
			this.oldDir = this.ball.direction;
			this.player1.player.client.emit('onBallCollide', this.ball.getMovement());
			if (this.player2.player.client)
				this.player2.player.client.emit('onBallCollide', this.ball.getMovementMirrored())
			this.emitToSpectators('onBallCollide', this.ball.getMovement());
		}
	}
		
	async sendScoreChange(pointChecker: {state: boolean, side: number})
	{
		if (pointChecker.side == this.RIGHT)
		{
			this.match.current_score[0]++;
			this.ball.direction = random(-(Math.PI / 4), Math.PI / 4) + Math.PI;
		}
		else
		{
			this.match.current_score[1]++;
			this.ball.direction = random(-(Math.PI / 4), Math.PI / 4);
		}
		this.emitScore(pointChecker);
		this.itemsService.saveMatchState(this.match);
	}

	emitScore(pointChecker: {state: boolean, side: number})
	{
		if (pointChecker.side == this.LEFT)
		{
			this.player1.player.client.emit('onScoreChange', {side: this.LEFT});
			this.emitToSpectators('onScoreChange', {side: this.LEFT});
			this.player2.player.client.emit('onScoreChange', {side: this.RIGHT});
		}
		else if (pointChecker.side == this.RIGHT)
		{
			this.player1.player.client.emit('onScoreChange', {side: this.RIGHT});
			this.emitToSpectators('onScoreChange', {side: this.RIGHT});
			this.player2.player.client.emit('onScoreChange', {side: this.LEFT});
		}
	}
	buildEndEvent(player: pongObject, id?: number): GameEnd
	{
		if (!id)
			return (player.score >= this.matchSetting.score_to_win ? {state: this.WIN, reason: "score"} : {state: this.LOSS, reason: "score"});
		else
			return (player.player.user_id == id ? {state: this.LOSS, reason: "you left"} : {state: this.WIN, reason: "opponent left"})
	}

	async endMatchSpectators() {
		this.spectators.forEach(async (spectator) => {
			const userEntity = await this.itemsService.getUser(spectator.user_id);

			userEntity.inMatch = false;
			this.itemsService.saveUserState(userEntity);
		})
	}
	async endMatchSpectator(userId: number) {
		const userEntity = await this.itemsService.getUser(userId);
		userEntity.inMatch = false;
		this.itemsService.saveUserState(userEntity);
	}

	endMatch(id?: number) {
		this.match.is_ongoing = false;
		this.itemsService.saveMatchState(this.match);

		this.player1.player.client.emit('onMatchEnd', this.buildEndEvent(this.player1, id));
		this.emitToSpectators('onMatchEnd', this.buildEndEvent(this.player1, id));
		if (this.player2.player.client)
			this.player2.player.client.emit('onMatchEnd', this.buildEndEvent(this.player2, id));
		this.itemsService.updateRankScore(this.player1, this.player2, this.match, this.matchSetting, this.notifGateway, id);
		this.endMatchSpectators();
		this.endGame();
	}

	update(delta: number) {
		if (!this.player1.player.isReady || !this.player2.player.isReady) return;
		this.applyPlayerMove(this.player1, delta);
		this.applyPlayerMove(this.player2, delta);

		if (this.closeEnoughPlayer() && this.ball.collidesWithPlayer(this.player1))
			this.ball.changeDirectionPlayer(this.player1);
		else if (this.closeEnoughOpponent() && this.ball.collidesWithPlayer(this.player2))
			this.ball.changeDirectionOpponent(this.player2);
		if (this.countdown > 0)
			this.countdown -= delta;
		else {
			this.checkDirectionChange();
			const pointChecker = this.ball.moveObject(delta, this.player1, this.player2);
			if (pointChecker.state)
			{
				this.countdown = 300;
				this.sendScoreChange(pointChecker);
			}
			if (this.player1.score >= this.matchSetting.score_to_win || this.player2.score >= this.matchSetting.score_to_win)
				this.endMatch();
		}
	}

	applyPlayerMove(player: pongObject, delta: number) {
		if (player.inputs.ArrowUp) player.moveObject(player.position(0, -this.movespeed * delta));
		if (player.inputs.ArrowDown) player.moveObject(player.position(0, this.movespeed * delta));
	}

	changeInput(user_id: number, move: string, state: boolean) {
		if (move == 'ArrowUp') {
			if (user_id == this.player1.player.user_id) this.player1.inputs.ArrowUp = state;
			else this.player2.inputs.ArrowUp = state;
		} else {
			if (user_id == this.player1.player.user_id) this.player1.inputs.ArrowDown = state;
			else this.player2.inputs.ArrowDown = state;
		}
	}

	getInput(player: pongObject): Move {
		return {
			ArrowUp: player.inputs.ArrowUp,
			ArrowDown: player.inputs.ArrowDown,
			posX: 5,
			posY: player.pos.y
		};
	}

	getMove(user_id: number) {
		if (user_id == this.player1.player.user_id) return this.getInput(this.player1);
		return this.getInput(this.player2);
	}

}
