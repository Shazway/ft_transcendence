import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { LessMessage, Message } from '../../dtos/message'
import { Channel } from '../../dtos/Channel.dto'
import { FetchService } from '../fetch.service';
import { WebsocketService } from '../websocket.service';
import { Socket, io } from 'socket.io-client';
import { fromEvent } from 'rxjs';
import { NgbModal, NgbPopover, NgbPopoverConfig  } from '@ng-bootstrap/ng-bootstrap';
import { PunishmentPopup } from '../popup-component/popup-component.component';
import { NotificationRequest } from 'src/dtos/Notification.dto';
import { NotificationService } from '../notification.service';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
	@ViewChild('customPopoverTemplate') popoverTemplate!: NgbPopover;
	currentMessage!: Message;
	client: Socket;
	channels$: Channel[] = [];
	msgs$: Message[] = [];
	test_msgs$ = new Array<Array<Message>>;

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
		private popoverConfig: NgbPopoverConfig,
		private notificationService: NotificationService
	) {
		this.client = io('ws://localhost:3002?channel_id=' + 1, websocketService.getHeader());
		if (!localStorage.getItem('Jwt_token'))
			return;
		if (!this.client)
			return;
		console.log('JWT token: ' + localStorage.getItem('Jwt_token'));
		this.setClientEvent();
		this.initPopoverConfig();
		return;
	}

	initPopoverConfig() {
		this.popoverConfig.autoClose = "outside";
		this.popoverConfig.placement = "start";
		this.popoverConfig.container = "body";
		this.popoverConfig.popoverClass = "p-0";
	}

	setClientEvent() {
		this.client.on('onMessage', (event) => { console.log('Message received ' + event); this.sortMessage(event) });
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
		//this.notificationService.connectSocket();
	}

	deleteMessage(msg: Message) {
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
			offscreenBtn.classList.remove('reverse');
		} else {
			offscreenElm.classList.add('show');
			offscreenBtn.classList.add('reverse');
		}
	}

	onDropdownDel(msg: Message) {
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

	createChatPopup(msg: Message) {
		this.currentMessage = msg;
	}

	async createPopup(title: string, label: string) {
		const modalRef = this.modalService.open(PunishmentPopup);
		modalRef.componentInstance.title = title;
		modalRef.componentInstance.label = label;
		return await modalRef.result;
	}

	buildNotif(type: string, target_name: string, target_id: number) : NotificationRequest {
		return {type : type, target_id : target_id, target_name : target_name};
	}

	addFriend(msg: Message) {
		const addFriendElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-add');
		if (!addFriendElm.classList.contains('show'))
			return;
		this.client.emit('addFriend', this.buildNotif("friend", msg.author.username, msg.author.user_id));
	}

	blockUser(msg: Message) {}

	async muteUser(msg: Message) {
		const muteTime = await this.createPopup("Mute", "Time");
		if (!muteTime)
			return;
		this.client.emit('mute', {
			target_id: msg.author.user_id,
			time: muteTime,
			message: "You have been muted",
		})
	}
	kickUser(msg: Message) {
		const kickUserElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-kick');
		if (!kickUserElm.classList.contains('show'))
			return;
		this.client.emit('kick', {
			target_id: msg.author.user_id,
			message: "You have been kicked",
		})
	}
	async banUser(msg: Message) {
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
	delMsg(msg: Message) {
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
		const offCreateChan = this.elRef.nativeElement.querySelector('.channel_create_pan');
		if (!offscreenElm)
			return;
		if (!offscreenChat.classList.contains('show')) {
			offscreenChat.classList.add('show');
			offscreenChatBtn.classList.add('reverse');
			offCreateChan.classList.remove('show');
		}
		if (offscreenElm.classList.contains('show')) {
			offscreenElm.classList.remove('show');
			onscreenElm.classList.remove('hide');
			offCreateChan.classList.remove('show');
		} else {
			offscreenElm.classList.add('show');
			onscreenElm.classList.add('hide');
			offCreateChan.classList.remove('show');
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
		this.setClientEvent();
		this.slideChan();
	}

	createChannel() {
		const offCreateChan = this.elRef.nativeElement.querySelector('.channel_create_pan');
		const offscreenElm = this.elRef.nativeElement.querySelector('.channel_pan');
		if (!offCreateChan.classList.contains('show')) {
			offCreateChan.classList.remove('show');
			offscreenElm.classList.add('show');
		}
		else {
			offCreateChan.classList.add('show');
			offscreenElm.classList.remove('show');
		}
		this.fetchService.createChannel({ channel_name: 'chan2' });
	}

	sortMessage(new_msg: Message) {
		console.log(new_msg)
		if (this.test_msgs$.length && this.test_msgs$[this.test_msgs$.length - 1][0].author.user_id == new_msg.author.user_id) {
			this.test_msgs$[this.test_msgs$.length - 1].push(new_msg);
			return;
		}
		const arr = new Array<Message>;
		arr.push(new_msg);
		this.test_msgs$.push(arr);
		const chat = document.querySelector('scrollbar');
	}

	isMe(msg : Message) : boolean {
		return (msg.author.user_id === Number(localStorage.getItem('id')));
	};

	getTime(msgList: Array<Message>) {
		const newDate = new Date (msgList[msgList.length - 1].createdAt);
		const hour = newDate.getHours() < 10 ? '0' + newDate.getHours() : newDate.getHours();
		const min = newDate.getMinutes() < 10 ? '0' + newDate.getMinutes() : newDate.getMinutes();
		return (hour + ':' + min);
	}

	getName(msgList: Array<Message>) {
		return (msgList[0].author.username);
	}

	isSystem(msg : Message) {
		return (msg.author.user_id == 0)
	}

	async onClickChat(data: LessMessage) {
		if (!this.client || data.message_content.trim().length == 0)
			return false;
		this.elRef.nativeElement.querySelector('.text-input').value = '';
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
