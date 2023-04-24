import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { Application, Graphics } from 'pixi.js';
import { Position, pongObjectDto } from 'src/dtos/Pong.dto';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css']
})
export class PongComponent {
	private client!: Socket;
	private app;
	private player; 
	
	constructor(
		private websocketService: WebsocketService,
		private pixiContainer: ElementRef,
		) {
			this.app = new Application({
				height: 600,
				width: 1000,
				antialias: true,
			});
		this.player	= new pongObjectDto(this.app.view.width, this.app.view.height);
		this.initObjects();
		this.pixiContainer.nativeElement.appendChild(this.app.view);
		this.app.ticker.add((delta) => this.update(delta));
	}


	update(delta: number) {
		if (this.player.inputs.ArrowUp)
			this.player.moveObject(this.player.position(0, -3 * delta));
		if (this.player.inputs.ArrowDown)
			this.player.moveObject(this.player.position(0, 3 * delta));
	}

	initObjects() {
		this.player.init(0, 0, 20, 100);
		this.app.stage.addChild(this.player.graphic);
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

	initSocket(match_id: number) {
		this.client = io('ws://localhost:3005?match_id=' + match_id, this.websocketService.getHeader());
	}

	@HostListener('window:keyup', ['$event']) 
	handleKeyUp(event: KeyboardEvent) {
		const key = event.key;
		// this.client.send("on sen fout" ,JSON.stringify({ type: 'keyEvent', key }));
		if (key == 'ArrowUp')
			this.player.inputs.ArrowUp = false;
		if (key == 'ArrowDown')
			this.player.inputs.ArrowDown = false;
	}

	@HostListener('window:keydown', ['$event']) 
	handleKeyDown(event: KeyboardEvent) {
		const key = event.key;
		// this.client.send("on sen fout" ,JSON.stringify({ type: 'keyEvent', key }));
		if (key == 'ArrowUp')
			this.player.inputs.ArrowUp = true;
		if (key == 'ArrowDown')
			this.player.inputs.ArrowDown = true;
	}
}
