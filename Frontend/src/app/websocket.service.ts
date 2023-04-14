import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client'
import { LessMessageDto } from 'src/dtos/message';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
	chanList: Map<number, Socket>;
	constructor() {
		this.chanList = new Map<number, Socket>;
	}

	getHeader() {
		return {
			withCredentials: false,
			extraHeaders: {
			  Authorization: this.getToken(),
			}
		}
	}

	getToken() {
		const token = localStorage.getItem('token');
		if (!token)
			return '';
		return token;	
	}

	async sendMessage(msg: LessMessageDto, channel_id: number) {
		const client = this.chanList.get(channel_id);
		if (!client)
			return false;
		client.emit(JSON.stringify(msg));
		return true;
	}

	async delChatSocket(channel_id: number) {
		const client = this.chanList.get(channel_id);
		if (!client)
			return false;
		client.close();
		this.chanList.delete(channel_id);
		return true;
	}

	async addChatSocket(channel_id: number) {
		if (!this.chanList.get(channel_id))
			return (false);
		const client = io('ws://localhost:3002?channel_id=' + channel_id, this.getHeader());
		if (!client)
			return false;
		client.on('onMessage', (event) => { console.log('Messaged recieved'); });
		client.on('onError', (event) => { console.log('WebSocket error:', event); });
		client.on('connection', (event) => { console.log('Connected to WebSocket server'); });
		client.on('disconnect', (event) => { console.log('Disconnected from WebSocket server'); });
		this.chanList.set(channel_id, client);
		return (true);
	}
}
