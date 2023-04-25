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
		this.app.ticker.add((delta) => this.update(delta));
	}

	setMatch(match_id: number) {
		if (this.client)
			this.client.close();
		this.client = io('ws://localhost:3005?match_id=' + match_id, this.websocketService.getHeader());
		this.client.on('onPlayerMove', (event) => { console.log('Message reveived ' + event); this.updatePlayer(event); });
		this.client.on('onOpponentMove', (event) => { console.log('Message reveived ' + event); this.updateOpponent(event); });
		this.client.on('onBallMove', (event) => { console.log('Message reveived ' + event); this.updateBall(event); });
	}

	update(delta: number) {
		this.i += delta;
		console.log(this.i);
		if (this.player.inputs.ArrowUp)
			this.player.moveObject(this.player.position(0, -3 * delta));
		if (this.player.inputs.ArrowDown)
			this.player.moveObject(this.player.position(0, 3 * delta));
		if (this.opponent.inputs.ArrowUp)
			this.opponent.moveObject(this.opponent.position(0, -3 * delta));
		if (this.opponent.inputs.ArrowDown)
			this.opponent.moveObject(this.opponent.position(0, 3 * delta));
	}

	updatePlayer(event: Move) {
		console.log('updatePlayer');
		this.player.setPos(event.posX, event.posY);
		this.player.inputs.ArrowUp = event.ArrowUp;
		this.player.inputs.ArrowDown = event.ArrowDown;
	}
	updateOpponent(event: Move) {
		console.log('updateOpponent');
		this.opponent.setPos(event.posX, event.posY + 980);
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
		if (!this.client)
			return;
		if (key == 'ArrowUp')
			this.client.emit('ArrowUp', true);
	if (key == 'ArrowDown')
			this.client.emit('ArrowDown', true);
	}
}
