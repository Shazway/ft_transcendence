import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { LessMessageDto, MessageDto } from '../../dtos/message'
import { ChannelDto } from '../../dtos/Channel.dto'
import { FetchService } from '../fetch.service';
import { WebsocketService } from '../websocket.service';
import { Socket, io } from 'socket.io-client';
import { fromEvent, lastValueFrom } from 'rxjs';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
	client: Socket;
	channels$: ChannelDto[] = [];
	msgs$: MessageDto[] = [];
	test_msgs$ = new Array<Array<MessageDto>>;
	icone_list = {
		add_friend: "https://static.vecteezy.com/system/resources/previews/020/936/584/original/add-friend-icon-for-your-website-design-logo-app-ui-free-vector.jpg",
		block_user: "https://static.thenounproject.com/png/45218-200.png",
		mute_user: "https://static.thenounproject.com/png/45218-200.png",
		kick_user: "https://static.thenounproject.com/png/45218-200.png",
		ban_user: "https://static.thenounproject.com/png/45218-200.png",
	}

	constructor(
		private fetchService: FetchService,
		private websocketService: WebsocketService,
		private elRef: ElementRef,
	) {
		this.client = io('ws://localhost:3002?channel_id=' + 1, websocketService.getHeader());
		if (!localStorage.getItem('Jwt_token'))
			return;
		if (!this.client)
			return;
		console.log('JWT token: ' + localStorage.getItem('Jwt_token'));
		this.client.on('onMessage', (event) => { console.log('Message reveived ' + event); this.sortMessage(event) });
		this.client.on('onError', (event) => { console.log('WebSocket error: ' + event); });
		this.client.on('connection', () => { console.log('Connected to WebSocket server'); });
		this.client.on('disconnect', () => { console.log('Disconnected from WebSocket server'); });
		return;
	}

	async ngOnInit() {
		this.msgs$ = await this.fetchService.getMessages(1, 0);
		if (!this.msgs$)
			return;
		for (let index = this.msgs$.length; index > 0; index--)
			this.sortMessage(this.msgs$[index - 1]);
		this.channels$ = await this.fetchService.getChannels();
	}

	slide() {
		const offscreenElm = this.elRef.nativeElement.querySelector('.offscreen');
		const offscreenBtn = this.elRef.nativeElement.querySelector('#chatBtn');
		if (!offscreenElm)
			return;
		if (offscreenElm.classList.contains('show')) {
			offscreenElm.classList.remove('show');
			offscreenBtn.textContent = 'Open chat';
		} else {
			offscreenElm.classList.add('show');
			offscreenBtn.textContent = 'Close chat';
		}
	}

	async  onDropdrownMessage(msg: MessageDto) {
		console.log("response");
		const addFriendElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-add');
		const blockUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-block');
		if (!addFriendElm)
			return;
		if (addFriendElm.classList.contains('show')) {
			addFriendElm.classList.remove('show');
			blockUserElm.classList.remove('show');
		} else {
			addFriendElm.classList.add('show');
			blockUserElm.classList.add('show');
		}
		this.client.emit('checkPrivileges', msg);
		fromEvent(this.client, 'answerPrivileges').subscribe((data) => {
			console.log(data);
		})
	}

	slideChan() {
		const offscreenChat = this.elRef.nativeElement.querySelector('.offscreen');
		const offscreenChatBtn = this.elRef.nativeElement.querySelector('#chatBtn');
		const offscreenElm = this.elRef.nativeElement.querySelector('.channel_pan');
		const onscreenElm = this.elRef.nativeElement.querySelector('.channel_unpan');
		const offscreenBtn = this.elRef.nativeElement.querySelector('#chanBtn');
		if (!offscreenElm)
			return;
		if (!offscreenChat.classList.contains('show')) {
			offscreenChat.classList.add('show');
			offscreenChatBtn.textContent = 'Close chat';
		}
		if (offscreenElm.classList.contains('show')) {
			offscreenElm.classList.remove('show');
			onscreenElm.classList.remove('hide');
		} else {
			offscreenElm.classList.add('show');
			onscreenElm.classList.add('hide');
		}
	}

	async openChannel(channelId: number) {
		this.client.close();
		this.msgs$.splice(0, this.msgs$.length);
		this.test_msgs$.splice(0, this.test_msgs$.length);
		this.msgs$ = await this.fetchService.getMessages(channelId, 0);
		if (!this.msgs$)
			return;
		for (let index = this.msgs$.length; index > 0; index--)
			this.sortMessage(this.msgs$[index - 1]);
		this.client = io('ws://localhost:3002?channel_id=' + channelId, this.websocketService.getHeader());
		this.client.on('onMessage', (event) => { console.log('Message reveived ' + event); this.sortMessage(event); });
		this.client.on('onError', (event) => { console.log('WebSocket error: ' + event); });
		this.client.on('connection', () => { console.log('Connected to WebSocket server'); });
		this.client.on('disconnect', () => { console.log('Disconnected from WebSocket server'); });
		this.slideChan();
	}

	createChannel() {
		this.fetchService.createChannel({ channel_name: 'chan2' });
	}

	sortMessage(new_msg: MessageDto) {
		console.log(new_msg)
		if (this.test_msgs$.length && this.test_msgs$[this.test_msgs$.length - 1][0].author.user_id == new_msg.author.user_id) {
			this.test_msgs$[this.test_msgs$.length - 1].push(new_msg);
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

	getName(msgList: Array<MessageDto>) {
		return (msgList[0].author.username);
	}

	isSystem(msg : MessageDto) {
		return (msg.author.user_id == 0)
	}

	async onClickChat(data: LessMessageDto) {
		if (!this.client || data.message_content.trim().length == 0)
			return false;
		const author = localStorage.getItem('username');
		const id = localStorage.getItem('id');
		if (id && author)
			this.client.emit('message', {
				message_content: data.message_content,
				author: {username: author, user_id: id}
			});
		return true;
	}
}
