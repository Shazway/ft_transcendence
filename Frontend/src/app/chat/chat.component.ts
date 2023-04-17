import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { LessMessageDto, MessageDto } from '../../dtos/message'
import { FetchService } from '../fetch.service';
import { WebsocketService } from '../websocket.service';
import { Socket, io } from 'socket.io-client';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
	client: Socket;
	msgs$: MessageDto[] = [];
	test_msgs$ = new Array<Array<MessageDto>>;
	@ViewChild('chatMsgs') chatMsgs: any;

	constructor(
		private fetchService: FetchService,
		private websocketService: WebsocketService
	) {
		this.client = io('ws://localhost:3002?channel_id=' + 1, websocketService.getHeader());
		if (!localStorage.getItem('Jwt_token'))
			return;
		if (!this.client)
			return;
		this.client.on('onMessage', (event) => { console.log('Message recieved ' + event); this.sortMessage(event) });
		this.client.on('onError', (event) => { console.log('WebSocket error: ' + event); });
		this.client.on('connection', () => { console.log('Connected to WebSocket server'); });
		this.client.on('disconnect', () => { console.log('Disconnected from WebSocket server'); });
		return;
	}

	async ngOnInit() {
		this.msgs$ = await this.fetchService.getMessages(1, 0);
		if (!this.msgs$)
			return;
		this.msgs$.forEach(async (element: MessageDto) => this.sortMessage(element));
	}

	ngAfterViewInit() {
		const chat = document.querySelector('scrollbar');
	}

	sortMessage(new_msg: MessageDto) {
		console.log(new_msg);
		if (this.test_msgs$.length && this.test_msgs$[this.test_msgs$.length - 1][0].author.user_id == new_msg.author.user_id) {
			this.test_msgs$[this.test_msgs$.length - 1].push(new_msg);
			this.chatMsgs.nativeElement.scrollTop = this.chatMsgs.nativeElement.scrollHeight;
			return;
		}
		const arr = new Array<MessageDto>;
		arr.push(new_msg);
		this.test_msgs$.push(arr);
		const chat = document.querySelector('scrollbar');
	}

	isMe(msg : MessageDto) : boolean {
		return (msg.author.user_id === Number(localStorage.getItem('id')));
	};

	getTime(msgList: Array<MessageDto>) {
		const newDate = new Date (msgList[msgList.length - 1].createdAt);
		const hour = newDate.getHours() < 10 ? '0' + newDate.getHours() : newDate.getHours();
		const min = newDate.getMinutes() < 10 ? '0' + newDate.getMinutes() : newDate.getMinutes();
		return (hour + ':' + min);
	}

	isSystem(msg : MessageDto) {
		return (msg.author.user_id == 0)
	}

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
