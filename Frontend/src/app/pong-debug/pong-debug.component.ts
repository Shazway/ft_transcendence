import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { Application, Graphics } from 'pixi.js';
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
	bouncenumber: number = 0;

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
		if (this.ball.collidesWithPlayer(this.player))
			this.ball.changeDirectionPlayer(this.player);
		if (this.ball.collidesWithOpponent(this.opponent))
			this.ball.changeDirectionOpponent(this.opponent);
		this.ball.moveObject(delta);
	}

	initObjects() {
		this.player.init(10, 200, 250, 20, 0x83d0c9);
		this.opponent.init(this.app.view.width - 230, 250, 200, 20, 0xFF0000);
		this.ball.init(500, 300, 10, 0xFFFFFF);
		const graphicElm = new Graphics();
		graphicElm.beginFill(0xFFFFFF, 0.3);
		graphicElm.drawRect(490, 0, 20, 250);
		graphicElm.drawRect(490, 350, 20, 250);
		graphicElm.endFill();
		this.ball.graphic.zIndex = 1;
		graphicElm.zIndex = -5;
		this.app.stage.addChild(this.ball.graphic, this.player.graphic, this.opponent.graphic, graphicElm);
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
		if (key == 'z')
			this.opponent.inputs.ArrowUp = false;
		if (key == 's')
			this.opponent.inputs.ArrowDown = false;
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
		if (key == 'z' && !this.opponent.inputs.ArrowUp)
			this.opponent.inputs.ArrowUp = true;
		if (key == 's' && !this.opponent.inputs.ArrowDown)
			this.opponent.inputs.ArrowDown = true;
	}
}
