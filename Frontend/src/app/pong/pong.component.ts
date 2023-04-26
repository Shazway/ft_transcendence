import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { Application, Graphics } from 'pixi.js';
import { Position, pongObjectDto, Move } from 'src/dtos/Pong.dto';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css']
})
export class PongComponent {
	private client!: Socket;
	private app;
	private player;
	private opponent;
	private i = 0;
	private oldDate: Date;
	private movespeed = 5;
	private gamespeed = 13;
	private timeoutId!: any;

	constructor(
		private websocketService: WebsocketService,
		private pixiContainer: ElementRef,
		private route: ActivatedRoute,
		) {
			this.app = new Application({
				height: 600,
				width: 1000,
				antialias: true,
			});
		this.player	= new pongObjectDto(this.app.view.width, this.app.view.height);
		this.opponent = new pongObjectDto(this.app.view.width, this.app.view.height);
		this.initObjects();
		this.setMatch(Number(this.route.snapshot.queryParamMap.get('match_id')));
		this.pixiContainer.nativeElement.appendChild(this.app.view);
		this.oldDate = new Date();
		this.app.ticker.add(() => {
			const date = new Date();
			this.update((date.getTime() - this.oldDate.getTime()) / this.gamespeed);
			this.oldDate = new Date();
		});
	}

	setMatch(match_id: number) {
		if (this.client)
			this.client.close();
		this.client = io('ws://localhost:3005?match_id=' + match_id, this.websocketService.getHeader());
		this.client.on('onPlayerMove', (event) => { console.log('Message received ' + event); this.updatePlayer(event); });
		this.client.on('onOpponentMove', (event) => { console.log('Message received ' + event); this.updateOpponent(event); });
		this.client.on('onBallMove', (event) => { console.log('Message received ' + event); this.updateBall(event); });
		this.client.on('startMatch', (event) => { console.log('Message received ' + event); this.updateBall(event); });
		this.client.on('waitMatch', (event) => { console.log('Message received ' + event); this.updateBall(event); });
	}

	update(delta: number) {
		// console.log(this.opponent);
		if (this.player.inputs.ArrowUp)
			this.player.moveObject(this.player.position(0, -this.movespeed * delta));
		if (this.player.inputs.ArrowDown)
			this.player.moveObject(this.player.position(0, this.movespeed * delta));
		if (this.opponent.inputs.ArrowUp)
			this.opponent.moveObject(this.opponent.position(0, -this.movespeed * delta));
		if (this.opponent.inputs.ArrowDown)
			this.opponent.moveObject(this.opponent.position(0, this.movespeed * delta));
	}

	updatePlayer(event: Move) {
		console.log('updatePlayer');
		this.player.setPos(event.posX, event.posY);
		this.player.inputs.ArrowUp = event.ArrowUp;
		this.player.inputs.ArrowDown = event.ArrowDown;
	}
	updateOpponent(event: Move) {
		console.log('updateOpponent');
		this.opponent.setPos(event.posX + 490, event.posY);
		this.opponent.inputs.ArrowUp = event.ArrowUp;
		this.opponent.inputs.ArrowDown = event.ArrowDown;
	}
	updateBall(event: any) {}

	initObjects() {
		this.player.init(0, 0, 20, 100, 0x83d0c9);
		this.app.stage.addChild(this.player.graphic);
		this.opponent.init(this.app.view.width - 20, 0, 20, 100, 0xFF0000);
		this.app.stage.addChild(this.opponent.graphic);
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
		console.log('You have presse keyup');
		if (!this.client)
			return;
		if (key == 'ArrowUp')
			this.client.emit('ArrowUp', false);
		if (key == 'ArrowDown')
			this.client.emit('ArrowDown', false);
	}

	@HostListener('window:keydown', ['$event'])
	handleKeyDown(event: KeyboardEvent) {
		const key = event.key;
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => {
			this.client.emit('ArrowUp', false);
			this.client.emit('ArrowDown', false);
		}, 500);
		if (!this.client)
			return;
		if (key == 'ArrowUp' && !this.player.inputs.ArrowUp)
			this.client.emit('ArrowUp', true);
		if (key == 'ArrowDown' && !this.player.inputs.ArrowDown)
			this.client.emit('ArrowDown', true);
	}
}
