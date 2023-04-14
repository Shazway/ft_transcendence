import { Component } from '@angular/core';
import { LessMessageDto, MessageDto } from '../../dtos/message'
import { FetchService } from '../fetch.service';
import { WebsocketService } from '../websocket.service';
import { Socket, io } from 'socket.io-client';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent {
	client: Socket;
	msgs$: Promise<any> | undefined;
	futur_msgs$ = new Array<MessageDto>;

	constructor(
		private fetchService: FetchService,
		private websocketService: WebsocketService
	) {
		this.msgs$ = this.fetchService.getMessages(1, 0);
		this.client = io('ws://localhost:3002?channel_id=' + 1, websocketService.getHeader());
		if (!localStorage.getItem('token'))
			return;
		if (!this.client)
			return;
		this.client.on('onMessage', (event) => { console.log('Message recieved' + event); this.futur_msgs$.push(event) });
		this.client.on('onError', (event) => { console.log('WebSocket error:', event); });
		this.client.on('connection', () => { console.log('Connected to WebSocket server'); });
		this.client.on('disconnect', () => { console.log('Disconnected from WebSocket server'); });
		return;
	}

	isMe(msg : MessageDto) : boolean {
		return (msg.author.user_id === Number(localStorage.getItem('id')));
	};

	async onClickChat(data: LessMessageDto) {
		if (!this.client)
			return false;
		const author = localStorage.getItem('username');
		const id = localStorage.getItem('id');
		if (id && author)
			this.client.emit('message', {message_content: data.message_content,
			author: {username: author, user_id: id}});
		return true;
	}
}
