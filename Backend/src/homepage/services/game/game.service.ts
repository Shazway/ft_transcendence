import { Injectable } from '@nestjs/common';
import { Application, Ticker } from 'pixi.js';
import { Move, pongObjectDto } from 'src/homepage/dtos/Pong.dto';

@Injectable()
export class GamesService {
	private interval: NodeJS.Timeout;
	private player1: pongObjectDto;
	private player2: pongObjectDto;
	private oldDate: Date;
	private i = 0;
	private movespeed = 5;
	private gamespeed = 13;

	constructor() {
		this.player1 = new pongObjectDto(1000, 600);
		this.player2 = new pongObjectDto(1000, 600);
		this.oldDate = new Date();
		console.log('init');
	}

	initObjects(player1_id: number, player2_id: number) {
		this.player1.init(0, 0, 20, 100, player1_id);
		this.player2.init(980, 0, 20, 100, player2_id);
	}

	startGame() {
		this.interval = setInterval(() => {
			const date = new Date();
			this.update((date.getTime() - this.oldDate.getTime()) / this.gamespeed);
			this.oldDate = date;
		}, 1000 / 120);
	}

	update(delta: number) {
		this.applyPlayerMove(this.player1, delta);
		this.applyPlayerMove(this.player2, delta);
	}

	applyPlayerMove(player: pongObjectDto, delta: number) {
		if (player.inputs.ArrowUp) player.moveObject(player.position(0, -this.movespeed * delta));
		if (player.inputs.ArrowDown) player.moveObject(player.position(0, this.movespeed * delta));
	}

	changeInput(user_id: number, move: string, state: boolean) {
		if (move == 'ArrowUp') {
			if (user_id == this.player1.player_id) this.player1.inputs.ArrowUp = state;
			else this.player2.inputs.ArrowUp = state;
		} else {
			if (user_id == this.player1.player_id) this.player1.inputs.ArrowDown = state;
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
		if (user_id == this.player1.player_id) return this.getInput(this.player1);
		return this.getInput(this.player2);
	}
}
