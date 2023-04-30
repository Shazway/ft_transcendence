import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { LessMessageDto, MessageDto } from '../../dtos/message'
import { ChannelDto } from '../../dtos/Channel.dto'
import { FetchService } from '../fetch.service';
import { WebsocketService } from '../websocket.service';
import { Socket, io } from 'socket.io-client';
import { fromEvent, lastValueFrom } from 'rxjs';
import { NgbModal  } from '@ng-bootstrap/ng-bootstrap';
import { PunishmentPopup } from '../popup-component/popup-component.component';

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
		mute_user: "https://cdn.discordapp.com/attachments/982595990517334098/1099736272311959562/mind.png",
		kick_user: "https://cdn.discordapp.com/attachments/982595990517334098/1099728807658790992/kick-off.png",
		ban_user: "https://as1.ftcdn.net/v2/jpg/02/13/00/44/1000_F_213004467_Vf445gOqhpiIwRmrFQUBRUDxLuQbXw1s.jpg",
		del_message: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnP0pzY-gE90i0RyzqOh7n2QmSmRDnjzHurbizuxk&s",
	}

	constructor(
		private fetchService: FetchService,
		private websocketService: WebsocketService,
		private elRef: ElementRef,
		private modalService: NgbModal,
	) {
		this.client = io('ws://10.11.2.3:3002?channel_id=' + 1, websocketService.getHeader());
		if (!localStorage.getItem('Jwt_token'))
			return;
		if (!this.client)
			return;
		console.log('JWT token: ' + localStorage.getItem('Jwt_token'));
		this.setClientEvent();
		return;
	}

	setClientEvent() {
		this.client.on('onMessage', (event) => { console.log('Message reveived ' + event); this.sortMessage(event) });
		this.client.on('onError', (event) => { console.log('WebSocket error: ' + event); });
		this.client.on('connection', () => { console.log('Connected to WebSocket server'); });
		this.client.on('disconnect', () => { console.log('Disconnected from WebSocket server'); });
		this.client.on('delMessage', (event) => { console.log('Deleting message ' + event); this.deleteMessage(event); })
	}

	async ngOnInit() {
		this.msgs$ = await this.fetchService.getMessages(1, 0);
		if (!this.msgs$)
			return;
		for (let index = this.msgs$.length; index > 0; index--)
			this.sortMessage(this.msgs$[index - 1]);
		this.channels$ = await this.fetchService.getChannels();
	}

	deleteMessage(msg: MessageDto) {
		console.log('deleting message');
		this.test_msgs$.forEach(element => {
			const index = element.findIndex(mess => mess.message_id == msg.message_id)
			if (index != -1) {
				element.splice(index, 1);
				console.log('Message deleted');
				if (element.length <= 0) {
					const delGrpElm = this.elRef.nativeElement.querySelector('#group-' + msg.message_id);
					delGrpElm.remove();
				} else {
					const delMsgElm = this.elRef.nativeElement.querySelector('#message-' + msg.message_id);
					delMsgElm.remove();
				}
			}
			if (element.length <= 0)
				this.test_msgs$.splice(this.test_msgs$.findIndex(arr => arr.length <= 0), 1);
		});
		console.log('Message not deleted');
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

	onDropdownDel(msg: MessageDto) {
		const delMsgElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-del');
		if (!delMsgElm)
			return;
		if (msg.author.user_id == Number(localStorage.getItem('id'))) {
			if (delMsgElm.classList.contains('show')) {
				delMsgElm.classList.remove('show');
				delMsgElm.removeAttribute('title');
			}
			else {
				delMsgElm.classList.add('show');
				delMsgElm.setAttribute('title', 'Delete message');
			}
		}
		else {
			this.client.emit('checkPrivileges', msg);
			const sub = fromEvent(this.client, 'answerPrivileges').subscribe((data) => {
				if (!data) {
					if (delMsgElm.classList.contains('show')) {
						delMsgElm.classList.remove('show');
						delMsgElm.removeAttribute('title');
					}
					else {
						delMsgElm.classList.add('show');
						delMsgElm.setAttribute('title', 'Delete message');
					}
				}
				sub.unsubscribe();
			})
		}
	}

	async  onDropdrownMessage(msg: MessageDto) {
		const addFriendElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-add');
		const blockUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-block');
		const muteUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-mute');
		const kickUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-kick');
		const banUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-ban');
		if (!addFriendElm)
			return;
		if (addFriendElm.classList.contains('show')) {
			addFriendElm.classList.remove('show');
			addFriendElm.removeAttribute('title');
			blockUserElm.classList.remove('show');
			blockUserElm.removeAttribute('title');
			muteUserElm.classList.remove('show');
			muteUserElm.removeAttribute('title');
			kickUserElm.classList.remove('show');
			kickUserElm.removeAttribute('title');
			banUserElm.classList.remove('show');
			banUserElm.removeAttribute('title');
		}
		else {
			this.client.emit('checkPrivileges', msg);
			const sub = fromEvent(this.client, 'answerPrivileges').subscribe((data) => {
				addFriendElm.classList.add('show');
				addFriendElm.setAttribute('title', 'Add friend');
				blockUserElm.classList.add('show');
				blockUserElm.setAttribute('title', 'Block User');
				if (!data) {
					muteUserElm.classList.add('show');
					muteUserElm.setAttribute('title', 'Mute User');
					kickUserElm.classList.add('show');
					kickUserElm.setAttribute('title', 'Kick User');
					banUserElm.classList.add('show');
					banUserElm.setAttribute('title', 'Ban User');
				}
				sub.unsubscribe();
			})
		}
	}

	async createPopup(title: string, label: string) {
		const modalRef = this.modalService.open(PunishmentPopup);
		modalRef.componentInstance.title = title;
		modalRef.componentInstance.label = label;
		return await modalRef.result;
	}

	addFriend(msg: MessageDto) {}
	blockUser(msg: MessageDto) {}
	async muteUser(msg: MessageDto) {
		const muteUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-mute');
		if (!muteUserElm.classList.contains('show'))
			return;
		const muteTime = await this.createPopup("Mute", "Time");
		if (!muteTime)
			return;
		this.client.emit('mute', {
			target_id: msg.author.user_id,
			time: muteTime,
			message: "You have been muted",
		})
	}
	kickUser(msg: MessageDto) {
		const kickUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-kick');
		if (!kickUserElm.classList.contains('show'))
			return;
		this.client.emit('kick', {
			target_id: msg.author.user_id,
			message: "You have been kicked",
		})
	}
	async banUser(msg: MessageDto) {
		const banUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-ban');
		if (!banUserElm.classList.contains('show'))
			return;
		const banTime = await this.createPopup("Ban", "Time");
		if (!banTime)
			return;
		this.client.emit('ban', {
			target_id: msg.author.user_id,
			message: "You have been banned",
		})
	}
	delMsg(msg: MessageDto) {
		const banUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-del');
		if (!banUserElm.classList.contains('show'))
			return;
		this.client.emit('delMessage', msg)
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
		this.client = io('ws://10.11.2.3:3002?channel_id=' + channelId, this.websocketService.getHeader());
		this.setClientEvent();
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
