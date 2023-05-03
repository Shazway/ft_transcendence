import { Injectable } from '@nestjs/common';
import { MatchSettingEntity } from 'src/entities';
import { Player } from 'src/homepage/dtos/Matchmaking.dto';
import { Move, ballObjectDto, pongObjectDto } from 'src/homepage/dtos/Pong.dto';

@Injectable()
export class GamesService {
	private interval: NodeJS.Timeout;
	private matchSetting: MatchSettingEntity;
	private player1: pongObjectDto;
	private player2: pongObjectDto;
	private ball: ballObjectDto;
	private oldDate: Date;
	private movespeed = 5;
	private gamespeed = 13;
	private oldDir = 0;

	constructor() {
		this.player1 = new pongObjectDto(1000, 600);
		this.player2 = new pongObjectDto(1000, 600);
		this.ball = new ballObjectDto(1000, 600);
		this.oldDate = new Date();
	}

	initObjects(player1: Player, player2: Player) {
		this.player1.init(10, 250, 200, 200, player1);
		this.player2.init(1000 - (10 + 200), 250, 200, 200, player2);
		this.ball.init(500, 300, 10);
	}

	startGame(settings: MatchSettingEntity) {
		this.matchSetting = settings;
		console.log('settings: ');
		console.log(settings);
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

	update(delta: number) {
		if (!this.player1.player.isReady || !this.player2.player.isReady) return;
		this.applyPlayerMove(this.player1, delta);
		this.applyPlayerMove(this.player2, delta);
		if (this.closeEnoughPlayer() && this.ball.collidesWithPlayer(this.player1))
			this.ball.changeDirectionPlayer(this.player1);
		else if (this.closeEnoughOpponent() && this.ball.collidesWithPlayer(this.player2))
			this.ball.changeDirectionOpponent(this.player2);
		if (this.oldDir != this.ball.direction) {
			this.oldDir = this.ball.direction;
			//console.log('Ballbefore' + this.ball.pos.x + ' ' + this.ball.pos.y);
			this.player1.player.client.emit('onBallCollide', this.ball.getMovement());
			if (this.player2.player.client)
				this.player2.player.client.emit('onBallCollide', this.ball.getMovementMirrored());
			//console.log('Ballafter' + this.ball.pos.x + ' ' + this.ball.pos.y);
		}
		this.ball.moveObject(delta);
	}

	applyPlayerMove(player: pongObjectDto, delta: number) {
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

	getInput(player: pongObjectDto): Move {
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
