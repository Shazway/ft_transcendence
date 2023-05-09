import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

	public client: Socket;

	constructor(
		private websocketService: WebsocketService,

	) { 
		this.client = io('ws://10.11.3.2:3003', this.websocketService.getHeader());
		this.setClientEvent();
	}

	emit(event: string, ...args: any []) {
		if (args.length == 1)
			this.client.emit(event, args[0]);
		else
			this.client.emit(event, args);
	}

	setClientEvent() {
		this.client.on('friendAnswer', (event) => { console.log('Answer ' + event);});
		this.client.on('pendingRequest', (event) => { console.log('pendingRequest' + event); });
		this.client.on('friendInvite', (event) => { console.log('friendInvite ', event); });
	}
}
