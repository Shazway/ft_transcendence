import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { Application, Assets, Graphics, TextStyle, Text } from 'pixi.js';
import { pongObject, ballObject, Move, VectorPos } from 'src/dtos/Pong.dto';
import { ActivatedRoute } from '@angular/router';
import { MatchSetting } from 'src/dtos/MatchSetting.dto';
import { right } from '@popperjs/core';
import { PlainText, WowText } from 'src/dtos/GraphElem.dto';

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
	private scoreP1!: PlainText;
	private scoreP2!: PlainText;
	private funkyText!: WowText;
	private i = 0;
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
			this.ball = new ballObject(this.app.view.width, this.app.view.height);
			this.player	= new pongObject(this.app.view.width, this.app.view.height);
			this.opponent = new pongObject(this.app.view.width, this.app.view.height);
		this.initObjects();
		this.pixiContainer.nativeElement.appendChild(this.app.view);
		this.oldDate = new Date();
		this.app.ticker.add(() => {
			const date = new Date();
			this.update((date.getTime() - this.oldDate.getTime()) / this.gamespeed);
			this.oldDate = new Date();
		});
	}

	closeEnoughPlayer() {
		return this.ball.graphic.x <= this.player.upperRightCorner.x + (this.ball.DIAMETER)
	}

	closeEnoughOpponent() {
		return this.ball.graphic.x >= this.opponent.upperLeftCorner.x - (this.ball.DIAMETER)
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
		if (this.closeEnoughPlayer() && this.ball.collidesWithPlayer(this.player))
			this.ball.changeDirectionPlayer(this.player);
		else if (this.closeEnoughOpponent() && this.ball.collidesWithPlayer(this.opponent))
			this.ball.changeDirectionOpponent(this.opponent);
		this.ball.moveObject(delta);
		if (this.funkyText)
			this.funkyText.update();
	}

	async initAssets() {
		Assets.addBundle('fonts', {
			PixeloidSans: 'assets/PixeloidMono.ttf',
			PixeloidMono: 'assets/PixeloidMono.ttf',
			PixeloidSansBold: 'assets/PixeloidSansBold.ttf',
		});
		return await Assets.loadBundle('fonts').then(() => {
			return {
				p1: new TextStyle({ fontFamily: 'PixeloidSansBold', fontSize: 70, fill: 'white', align: 'right' }),
				p2: new TextStyle({ fontFamily: 'PixeloidSansBold', fontSize: 70, fill: 'white' }),
				funText: new TextStyle({ fontFamily: 'PixeloidSansBold' }),
			}
		});
	}


	async initObjects() {
		this.player.init(10, 250, 200, 100, 0x83d0c9);
		this.opponent.init(this.app.view.width - (10 + 200), 250, 200, 100, 0xFF0000);
		this.ball.init(500, 300, 10, 0xFFFFFF);
		const graphicElm = new Graphics();
		graphicElm.beginFill(0xFFFFFF, 0.8);
		graphicElm.drawRect(490, 0, 20, 250);
		graphicElm.drawRect(490, 350, 20, 250);
		graphicElm.endFill();
		const style = await this.initAssets();
		this.scoreP1 = new PlainText('0', style.p1, 402, 50, this.app);
		this.scoreP2 = new PlainText('0', style.p2, 550, 50, this.app);
		this.funkyText = new WowText('this is my fun text', style.funText, 100, 200, this.app);
		this.funkyText.setRGB(true, 5000, 20);
		this.funkyText.setWavy(true, 2000, 10, 10);
		this.app.stage.addChild(graphicElm, this.ball.graphic, this.player.graphic, this.opponent.graphic);
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
		if (key == '+' && !this.opponent.inputs.ArrowDown)
			this.scoreP1.text.text = (++this.i).toString();
	}
}
