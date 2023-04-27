import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { Application } from 'pixi.js';
import { pongObjectDto, ballObjectDto, Move, VectorPos } from 'src/dtos/Pong.dto';
import { ActivatedRoute } from '@angular/router';
import { MatchSetting } from 'src/dtos/MatchSetting.dto';

@Component({
  selector: 'app-pong-debug',
  templateUrl: './pong-debug.component.html',
  styleUrls: ['./pong-debug.component.css']
})
export class PongDebugComponent {
	private client!: Socket;
	private app;
	private player;
	private ball;
	private opponent;
	private oldDate: Date;
	private movespeed = 5;
	private gamespeed = 13;
	private timeoutId!: any;
	private gameSettings!: MatchSetting;

	constructor(
		private pixiContainer: ElementRef,
		private route: ActivatedRoute,
		private elRef: ElementRef,
		) {
			this.app = new Application({
				height: 600,
				width: 1000,
				antialias: true,
			});
		this.ball = new ballObjectDto(this.app.view.width, this.app.view.height);
		this.player	= new pongObjectDto(this.app.view.width, this.app.view.height);
		this.opponent = new pongObjectDto(this.app.view.width, this.app.view.height);
		this.initObjects();
		this.pixiContainer.nativeElement.appendChild(this.app.view);
		this.oldDate = new Date();
		this.app.ticker.add(() => {
			const date = new Date();
			this.update((date.getTime() - this.oldDate.getTime()) / this.gamespeed);
			this.oldDate = new Date();
		});
	}

	update(delta: number) {
		if (this.player.inputs.ArrowUp)
			this.player.moveObject(this.player.position(0, -this.movespeed * delta));
		if (this.player.inputs.ArrowDown)
			this.player.moveObject(this.player.position(0, this.movespeed * delta));
		if (this.opponent.inputs.ArrowUp)
			this.opponent.moveObject(this.opponent.position(0, -this.movespeed * delta));
		if (this.opponent.inputs.ArrowDown)
			this.opponent.moveObject(this.opponent.position(0, this.movespeed * delta));
		//this.ball.collisionPaddle(this.player, this.opponent);
		this.ball.collisionMarina(this.player);
		this.ball.moveObject(delta);
	}

	initObjects() {
		this.player.init(10, 0, 10, 100, 0x83d0c9);
		this.opponent.init(this.app.view.width - 30, 0, 20, 100, 0xFF0000);
		this.ball.init(500, 300, 10, 0xFFFFFF);
		this.app.stage.addChild(this.ball.graphic, this.player.graphic, this.opponent.graphic);
		// const ruler = new Graphics();
		// for (let index = 0; index < 12; index++) {
		// 	for (let index2 = 0; index2 < 8; index2++) {
		// 		ruler.beginFill(0xFF0000);
		// 		ruler.drawRect(index * 100, index2 * 100, 2, 2);
		// 		ruler.endFill();
		// 	}
		// }
		// this.app.stage.addChild(ruler);
	}

	@HostListener('window:keyup', ['$event'])
	handleKeyUp(event: KeyboardEvent) {
		const key = event.key;
		if (key == 'ArrowUp')
			this.player.inputs.ArrowUp = false;
		if (key == 'ArrowDown')
			this.player.inputs.ArrowDown = false;
	}

	@HostListener('window:keydown', ['$event'])
	handleKeyDown(event: KeyboardEvent) {
		const key = event.key;
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => {
			this.player.inputs.ArrowUp = false;
			this.player.inputs.ArrowDown = false;
		}, 500);
		if (key == 'ArrowUp' && !this.player.inputs.ArrowUp)
			this.player.inputs.ArrowUp = true;
		if (key == 'ArrowDown' && !this.player.inputs.ArrowDown)
			this.player.inputs.ArrowDown = true;
	}
}
