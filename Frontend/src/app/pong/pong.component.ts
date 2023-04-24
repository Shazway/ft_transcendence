import { Component, HostListener } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css']
})
export class PongComponent {
	client!: Socket;

	constructor(
		private websocketService: WebsocketService,
	) {}

	initSocket(match_id: number) {
		this.client = io('ws://localhost:3005?match_id=' + match_id, this.websocketService.getHeader());
	}

	@HostListener('window:keyup', ['$event'])
	handleKeyUp(event: KeyboardEvent) {
		const key = event.key;
		// this.client.send("on sen fout" ,JSON.stringify({ type: 'keyEvent', key }));
		console.log(event.key);
	}
}
