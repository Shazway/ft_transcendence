import { Injectable } from '@nestjs/common';
import { Player } from 'src/homepage/dtos/Matchmaking.dto';
import { Move, ballObjectDto, pongObjectDto } from 'src/homepage/dtos/Pong.dto';

@Injectable()
export class GamesService {
	private interval: NodeJS.Timeout;
	private player1: pongObjectDto;
	private player2: pongObjectDto;
	private ball: ballObjectDto;
	private oldDate: Date;
	private movespeed = 5;
	private gamespeed = 13;

	constructor() {
		this.player1 = new pongObjectDto(1000, 600);
		this.player2 = new pongObjectDto(1000, 600);
		this.ball = new ballObjectDto(1000, 600);
		this.oldDate = new Date();
	}

	initObjects(player1: Player, player2: Player) {
		this.player1.init(0, 0, 20, 100, player1);
		this.player2.init(980, 0, 20, 100, player2);
		this.ball.init(500, 300, 15);
	}

	startGame() {
		this.interval = setInterval(() => {
			const date = new Date();
			this.update((date.getTime() - this.oldDate.getTime()) / this.gamespeed);
			this.oldDate = new Date();
		}, 1000 / 120);
	}

	endGame() {
		clearTimeout(this.interval);
	}

	update(delta: number) {
		this.applyPlayerMove(this.player1, delta);
		this.applyPlayerMove(this.player2, delta);
		const ret1 = this.ball.collisionPaddle(this.player1, this.player2);
		const ret2 = this.ball.moveObject(delta);
		if (ret1 || ret2) {
			this.player1.player.client.emit('onBallCollide', this.ball.getMovement());
			this.player2.player.client.emit('onBallCollide', this.ball.getMovementMirrored());
		}
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
			posX: 0,
			posY: player.pos.y
		};
	}

	getMove(user_id: number) {
		if (user_id == this.player1.player.user_id) return this.getInput(this.player1);
		return this.getInput(this.player2);
	}
}
