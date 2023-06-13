import { Component, OnInit, ElementRef, ViewChild, TemplateRef, AfterViewInit, HostListener } from '@angular/core';
import { LessMessage, Message } from '../../dtos/message'
import { Channel } from '../../dtos/Channel.dto'
import { FetchService } from '../fetch.service';
import { WebsocketService } from '../websocket.service';
import { Socket, io } from 'socket.io-client';
import { fromEvent } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmPopup, PasswordPopup, PunishmentPopup } from '../popup-component/popup-component.component';
import { NotificationRequest } from 'src/dtos/Notification.dto';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { PopoverConfig } from 'src/dtos/Popover.dto';
import { AnyProfileUser } from 'src/dtos/User.dto';
import { isUndefined } from 'mathjs';
import { Mutex } from 'async-mutex';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit {
	@ViewChild('chatInteractionTemplate') chatInteractionTemplate!: TemplateRef<any>;
	@ViewChild('chanBody') chatBody!: ElementRef;
	@ViewChild('scrollbar') scrollbar!: ElementRef;
	currentMessage!: Message;
	client!: Socket;
	channels$: {servers: Channel[], dm: Channel[]} = {servers: [], dm: []};
	currentChannel!: Channel;
	msgs$: Message[] = [];
	test_msgs$ = new Array<Array<Message>>;
	is_admin = false;
	is_owner = false;
	potentialNewMembers! : AnyProfileUser[];
	potentialNewOp! : AnyProfileUser[];
	msg_page: number = 1;
	msgLock: Mutex;

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
		private router: Router,
		private parent: AppComponent,
	) {
		this.msgLock = new Mutex();
		this.client = io('ws://localhost:3002?channel_id=' + 1, websocketService.getHeader());
		if (!this.client)
		{
			this.router.navigateByUrl('login');
			return;
		}
		this.setClientEvent();
		return;
	}

	ngAfterViewInit(): void {
		const containerElement: HTMLElement = this.scrollbar.nativeElement;
		setTimeout(() => {
			containerElement.scrollTo({
				top: containerElement.scrollHeight,
				behavior: 'smooth',
			});
		}, 500);
	}

	disableLeave() {
		return (this.is_owner || (this.currentChannel?.channel_id == 1));
	}

	setClientEvent() {
		this.client.on('onMessage', (event) => { this.sortMessage(event); this.scrollBottom(event); });
		this.client.on('onError', (event) => { });
		this.client.on('connection', () => { });
		this.client.on('disconnect', () => { });
		this.client.on('delMessage', (event) => { this.deleteMessage(event); });
		this.client.on('onPromote', (event) => { this.promote(event); });
		this.client.on('onDemote', (event) => { this.demote(event); });
		this.client.on('onLeaveChannel', (event) => { this.redirectToGlobal() });
	}

	promote(event: Message) {
		const user = this.getUserFromCurrentChannel(event.message_content);
		if (!user)
			return;
		if (user.is_admin) {
			user.is_creator = true;
			if (this.isMe2(user.user_id))
				this.is_owner = true;
		}
		else {
			user.is_admin = true;
			if (this.isMe2(user.user_id))
				this.is_admin = true;
		}
	}

	demote(event: Message) {
		const user = this.getUserFromCurrentChannel(event.message_content);
		if (!user)
			return;
		if (user.is_creator) {
			user.is_creator = false;
			if (this.isMe2(user.user_id))
				this.is_owner = false;
		}
		else {
			user.is_admin = false;
			if (this.isMe2(user.user_id))
				this.is_admin = false;
		}
	}

	private prevScroll!: number;

	async onScroll(event: Event) {
		const containerElement: HTMLElement = this.scrollbar.nativeElement;

		if (!this.prevScroll) {
			this.prevScroll = containerElement.scrollTop;
			return
		}
		if (this.prevScroll > containerElement.scrollTop) {
			this.prevScroll = containerElement.scrollTop;
			if (this.msgLock.isLocked())
				return ;
			await this.msgLock.acquire().then(async () => {
				if ((containerElement.scrollTop) < 20 && this.test_msgs$.length > 1)
				{
					const prevMsg = "message-" + this.test_msgs$[0][0].message_id;
					const element = document.getElementById(prevMsg);
					this.msgs$ = await this.fetchService.getMessages(this.currentChannel.channel_id, this.msg_page);
					this.msgs$.forEach((msg) => {
						if (msg.author.user_id != this.test_msgs$[0][0].author.user_id)
							this.test_msgs$.unshift(new Array());
						this.test_msgs$[0].unshift(msg)
					});
					this.msg_page++;
					if (element && prevMsg != "message-" + this.test_msgs$[0][0].message_id)
						element.scrollIntoView({ behavior: 'auto' });
				}
			});
			this.msgLock.release();
		}
	}

	scrollBottom(msg?: Message) {
		const containerElement: HTMLElement = this.scrollbar.nativeElement;
		if ((containerElement.clientHeight + containerElement.scrollTop) > containerElement.scrollHeight - 20 || !msg || msg.author.username == localStorage.getItem('username'))
			setTimeout(() => {
				containerElement.scrollTo({
					top: containerElement.scrollHeight,
					behavior: 'smooth',
				});
			}, 5)
	}

	async ngOnInit() {
		if (!this.parent.isConnected())
			this.router.navigateByUrl('login');
		this.msgs$ = await this.fetchService.getMessages(1, 0);
		if (!this.msgs$)
			return;
		for (let index = this.msgs$.length; index > 0; index--)
			this.sortMessage(this.msgs$[index - 1]);
		this.sortChannels(await this.fetchService.getChannels());
		const chan = await this.fetchService.getChannel(1);
		if (chan)
			this.currentChannel = chan;
	}

	sortChannels(chanList: Channel[]) {
		this.channels$.servers.splice(0);
		this.channels$.dm.splice(0);
		chanList.forEach(channel => {
			if (channel.is_dm) this.channels$.dm.push(channel);
			else this.channels$.servers.push(channel);
		});
	}

	deleteMessage(msg: Message) {
		this.test_msgs$.forEach(element => {
			const index = element.findIndex(mess => mess.message_id == msg.message_id)
			if (index != -1) {
				element.splice(index, 1);
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
		if (msg.author.user_id == Number(localStorage.getItem('id')) || this.is_admin) {
			if (delMsgElm.classList.contains('show')) {
				delMsgElm.classList.remove('show');
				delMsgElm.removeAttribute('title');
			}
			else {
				delMsgElm.classList.add('show');
				delMsgElm.setAttribute('title', 'Delete message');
			}
		}
	}

	isAllowed(username: string) {
		if (!this.is_owner) {
			const target = this.getUserFromChannel(username, this.currentChannel);
			if (target.is_admin)
				return false;
		}
		return true;
	}

	createChatPopup(msg: Message, event: MouseEvent) {
		event.preventDefault();
		if (event.button == 2) {
			this.parent.openPopover(this.chatInteractionTemplate, new PopoverConfig(
				this.chatBody.nativeElement,
				'',
				'outside',
				'start',
				{msg, permission: this.isAllowed(msg.author.username)},
			));
		}
		else if (event.button == 0) {
			this.parent.openPopover('profile', new PopoverConfig(
				this.chatBody.nativeElement,
				'profile arrow-hide',
				'outside',
				'start',
				{name: msg.author.username, id: msg.author.user_id, client: this.parent.notifService.client},
			));
		}
	}

	async createPopup(title: string, label: string, className: string) {
		let modalRef;
		if (className == 'PunishmentPopup')
			modalRef = this.modalService.open(PunishmentPopup);
		else if (className == 'ConfirmPopup')
			modalRef = this.modalService.open(ConfirmPopup);
		else if (className == 'PasswordPopup')
			modalRef = this.modalService.open(PasswordPopup);
		else
			return false;
		modalRef.componentInstance.title = title;
		modalRef.componentInstance.label = label;
		return await modalRef.result;
	}

	buildNotif(type: string, target_name: string, target_id: number) : NotificationRequest {
		return {type : type, target_id : target_id, target_name : target_name};
	}

	addFriend(msg: Message) {
		this.client.emit('inviteRequest', this.buildNotif("friend", msg.author.username, msg.author.user_id));
	}

	blockUser(msg: Message) {
		this.fetchService.blockUser(msg.author.user_id);
		this.test_msgs$ = this.test_msgs$.filter(element => element[0].author.user_id != msg.author.user_id);
	}

	async muteUser(msg: Message) {
		const muteTime = await this.createPopup("Mute", "Time", 'PunishmentPopup');
		if (!muteTime)
			return;
		this.client.emit('mute', {
			target_id: msg.author.user_id,
			time: muteTime,
			message: "You have been muted",
		})
	}
	kickUser(msg: Message) {
		if (!this.is_admin)
			return;
		this.client.emit('kick', {
			target_id: msg.author.user_id,
			message: "You have been kicked",
		})
	}
	async banUser(msg: Message) {
		if (!this.is_admin)
			return;
		const banTime = await this.createPopup("Ban", "Time", 'PunishmentPopup');
		if (!banTime)
			return;
		this.client.emit('ban', {
			target_id: msg.author.user_id,
			message: "You have been banned",
		})
	}
	delMsg(msg: Message) {
		const delMsgElm = this.elRef.nativeElement.querySelector('#img-' + msg.message_id + '-del');
		if (!delMsgElm.classList.contains('show'))
			return;
		this.client.emit('delMessage', msg)
	}

	async slideChan() {
		this.hideAllDropdown();
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
			if (onscreenElm)
				onscreenElm.classList.remove('hide');
			offCreateChan.classList.remove('show');
		} else {
			offscreenElm.classList.add('show');
			if (onscreenElm)
				onscreenElm.classList.add('hide');
			offCreateChan.classList.remove('show');
			this.sortChannels(await this.fetchService.getChannels());
		}
	}

	async openChannel(channel: Channel) {
		let pwd;
		const checkPWD = !this.getUserFromChannel(localStorage.getItem("username"), channel) && channel.has_pwd;
		if (checkPWD) {
			pwd = await this.createPopup(channel.channel_name, 'Password', 'PasswordPopup');
			const mdp = await this.fetchService.isRightPass({channel_id: channel.channel_id, pass: pwd});
			if (isUndefined(mdp) || !mdp) {
				return;
			}
		}
		this.is_admin = false;
		this.is_owner = false;
		this.client.close();
		if (this.msgs$ && this.msgs$.length)
			this.msgs$.splice(0, this.msgs$.length);
		this.test_msgs$.splice(0, this.test_msgs$.length);
		this.msg_page = 1;
		this.msgs$ = await this.fetchService.getMessages(channel.channel_id, 0);
		if (this.msgs$)
		{
			for (let index = this.msgs$.length; index > 0; index--)
				this.sortMessage(this.msgs$[index - 1]);
		}
		this.client = io('ws://localhost:3002?channel_id=' + channel.channel_id, this.websocketService.getHeader());
		this.currentChannel = channel;
		this.setClientEvent();
		const us_channel = this.getUserFromCurrentChannel(localStorage.getItem('username'));
		this.is_admin = us_channel ? us_channel.is_admin : false;
		this.is_owner = us_channel ? us_channel.is_creator : false;
		const offscreenElm = this.elRef.nativeElement.querySelector('.channel_pan');
		if (offscreenElm.classList.contains('show'))
			this.slideChan();
		this.scrollBottom();
	}

	redirectToGlobal() {
		let chan: Channel | undefined;
		this.channels$.servers.forEach(channel => {
			if (channel.channel_id == 1) {
				chan = channel;
				return;
			}
		});
		if (chan)
			this.openChannel(chan);
		else
			return;
	}

	getUserFromCurrentChannel(name: string | null): any {
		if (!name)
			return null;
		let user;
		this.currentChannel.us_channel.forEach((us_channel: any) => {
			if (us_channel && us_channel.user && us_channel.user.username == name) {
				user = us_channel;
				return;
			}
		});
		return user;
	}

	getMeFromChannel(chan: Channel): any {
		return this.getUserFromChannel(localStorage.getItem("username"), chan);
	}

	getUserFromChannel(name: string | null, chan: Channel): any {
		if (!name)
			return null;
		let user;
		chan.us_channel.forEach((us_channel: any) => {
			if (us_channel && us_channel.user && us_channel.user.username == name) {
				user = us_channel;
				return;
			}
		});
		return user;
	}

	async createChannel(waiter?: Promise<undefined>) {
		const offCreateChan = this.elRef.nativeElement.querySelector('.channel_create_pan');
		const offscreenElm = this.elRef.nativeElement.querySelector('.channel_pan');
		if (offCreateChan.classList.contains('show')) {
			offCreateChan.classList.remove('show');
			offscreenElm.classList.add('show');
			if (waiter)
				await waiter;
			this.sortChannels(await this.fetchService.getChannels());
		}
		else {
			offCreateChan.classList.add('show');
			offscreenElm.classList.remove('show');
		}
	}

	togglePrivate(event: any) {
		const offscreenElm = this.elRef.nativeElement.querySelector('.chanPass');
		if (event.target.checked && offscreenElm.classList.contains('show')) {
			offscreenElm.classList.remove('show');
			offscreenElm.value = '';
		}
		else if (!event.target.checked && !offscreenElm.classList.contains('show'))
			offscreenElm.classList.add('show');
	}

	async onClickCreateChannel(data: any) {
		if (data.is_channel_private == '')
			data.is_channel_private = false;
		if (data.channel_password == '')
			data.channel_password = null;
		const waiter = await this.fetchService.createChannel({
			channel_name: data.channel_name,
			is_channel_private: data.is_channel_private,
			channel_password: data.channel_password,
		});
		this.elRef.nativeElement.querySelector('#exampleFormControlInput2').value = '';
		this.elRef.nativeElement.querySelector('#exampleFormControlInput3').value = '';
		this.elRef.nativeElement.querySelector('#exampleFormControlInput4').checked= false;
		this.togglePrivate({target: {checked: false}});
		this.createChannel(waiter);
	}

	getAvatar() {
		return localStorage.getItem('img_url');
	}

	sortMessage(new_msg: Message) {
		if (this.test_msgs$.length && this.test_msgs$[this.test_msgs$.length - 1][0].author.user_id == new_msg.author.user_id) {
			this.test_msgs$[this.test_msgs$.length - 1].push(new_msg);
			return;
		}
		const arr = new Array<Message>;
		arr.push(new_msg);
		this.test_msgs$.push(arr);
	}

	isMe(msg : Message) : boolean {
		return (msg.author.user_id === Number(localStorage.getItem('id')));
	};

	isMe2(userId: number) : boolean {
		return (userId === Number(localStorage.getItem('id')));
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

	sendSystemMessage(msg: string) {
		this.sortMessage({
			message_id : 0,
			author : {
				email: '',
				login: '',
				img_url: '',
				image: {
					link: '',
					versions: {
						large: '',
					}
				},
				username: 'System',
				user_id: 0,
			},
			createdAt : new Date(),
			message_content : msg,
		});
	}

	leaveChannel() {
		this.client.emit('kick', {
			username: localStorage.getItem('username'),
			message: "You left the channel",
		});
		this.redirectToGlobal();
		this.hideAllDropdown();
	}

	goToProfile(user: string) {
		this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigateByUrl("profile?username=" + user));
	}

	printHelp() {
		this.sendSystemMessage("/help : show system help");
		this.sendSystemMessage("/leave : leave the current channel");
		this.sendSystemMessage("/invite <username> : invite a user to a channel, admin only");
		this.sendSystemMessage("/kick <username> : kick a user from a channel, admin only");
		this.sendSystemMessage("/mute <username> <mutetime> : mute a user from a channel for x seconds, admin only");
		this.sendSystemMessage("/unmute <username> : unmute a user from a channel, admin only");
		this.sendSystemMessage("/ban <username> <bantime?> : ban a user from a channel for x seconds, indefinite if not precised, admin only");
		this.sendSystemMessage("/unban <username> : unban a user from a channel, admin only");
		this.sendSystemMessage("/obliterate : destroy the current channel, owner only");
		this.sendSystemMessage("/op <username> : promote a user, if target is admin, promote to owner, owner only");
		this.sendSystemMessage("/deop <username> : demote a user, owner only");
		this.scrollBottom();
	}

	emptyField(data: LessMessage) {
		const textRef = this.elRef.nativeElement.querySelector('#exampleFormControlInput1');
		textRef.value = '';
		data.message_content = '';
	}

	async onClickChat(data: LessMessage) {
		if (!this.client.connected)
			this.openChannel(this.currentChannel);
		if (!this.client || data.message_content.trim().length == 0)
			return false;
		

		if (data.message_content[0] == '/') {
			const split = data.message_content.split(' ');
			if (split[0] == '/leave') {
				if (!this.is_owner)
					this.leaveChannel();
			}
			else if (split[0] == '/obliterate') {
				this.obliterateChannel();
			}
			else if (split[0] == '/help') {
				this.printHelp();
			}
			else if (split.length < 2)
				return this.checkInputChat(data.message_content, 0, 255, '#exampleFormControlInput1', false, this.chatCheckList);
			else if (split[0] == '/kick') {
				this.client.emit('kick', {
					username: split[1],
					message: "You have been kicked",
				});
			}
			else if (split[0] == '/ban') {
				const time = split[2] ? Number(split[2]) : 0;
				this.client.emit('ban', {
					username: split[1],
					message: "You have been banned",
					time,
				});
			}
			else if (split[0] == '/unban') {
				this.client.emit('unban', {
					username: split[1],
					message: "You have been unbanned",
				});
			}
			else if (split[0] == '/mute') {
				const time = split[2] ? Number(split[2]) : 0;
				this.client.emit('mute', {
					username: split[1],
					message: "You have been muted",
					time,
				});
			}
			else if (split[0] == '/unmute') {
				this.client.emit('unmute', {
					username: split[1],
					message: "You have been unmuted",
				});
			}
			else if (split[0] == '/invite') {
				let userToAdd  = await this.fetchService.getUser(split[1]);
				if (userToAdd)
					this.addMember(userToAdd);
			}
			else if (split[0] == '/op') {
				this.addOp(split[1]);
			}
			else if (split[0] == '/deop') {
				this.deOp(split[1]);
			}
		}
		else {
			const author = localStorage.getItem('username');
			const id = localStorage.getItem('id');
	
			if (id && author)
				this.client.emit('message', {
					message_content: data.message_content,
					author: {username: author, user_id: id, img_url: localStorage.getItem('img_url')}
				});
		}

		this.emptyField(data);
		return true;
	}

	async changePotentialNewMembers(value : string) {
		if (value.length > 0)
		{
			let allResults = await this.fetchService.inviteSubstring(value);
			this.potentialNewMembers = this.sortSearched(allResults, value);
			this.potentialNewMembers = this.potentialNewMembers.slice(0, 10);
		}
		else
		this.potentialNewMembers = [];
	}

	addMember(newMember : AnyProfileUser) {
		this.fetchService.channelInvite(newMember, this.currentChannel.channel_id);
		this.openAddMember('.secDropUp');
	}

	addOp(newOp : string) {
		this.client.emit('promote', {
			username: newOp,
			message: "You have been promoted to OP",
		});
		this.openAddMember('.secDropUp'); //change
	}

	deOp(newOp : string) {
		this.client.emit('demote', {
			username: newOp,
			message: "You have been promoted to OP",
		});
		this.openAddMember('.secDropUp'); //change
	}

	openAddMember(className: string) {
		const dropDownElm = this.elRef.nativeElement.querySelector(className);
		if(!dropDownElm)
			return;
		if (dropDownElm.classList.contains('show')) {
			if (className == '.premDropUp')
				this.hideAllDropdown();
			else
				dropDownElm.classList.remove('show');
		}
		else
			dropDownElm.classList.add('show');
		this.potentialNewMembers = [];
	}

	hideAllDropdown() {
		const dropDownElm = this.elRef.nativeElement.querySelectorAll('.dropdown-menu');
		dropDownElm.forEach((element: any) => {
			if (element.classList.contains('show'))
				element.classList.remove('show');
		});
	}

	sortSearched(found : AnyProfileUser[], key : string) {
		found.sort(); //sort par ordre alphabetique
		found.sort((a, b)=> a.username.indexOf(key) - b.username.indexOf(key))
		return found;
	}

	async obliterateChannel() {
		if (this.is_owner) {
			const confirm = await this.createPopup("Obliterate channel", "", 'ConfirmPopup');
			if (confirm) {
				this.fetchService.obliterateChannel(this.currentChannel);
				this.redirectToGlobal();
				this.hideAllDropdown();
			}
		}
	}

	getRole(username: string, prefix: string = '') {
		const name = this.getUserFromCurrentChannel(username);
		if (!name)
			return;
		if (name.is_creator)
			return 'owner'
		if (name.is_admin)
			return 'admin'
		return prefix + '';
	}

	chatCheckList = { tooLong : true, tooShort : true, other : true };
	channelNameCheckList = { tooLong : true, tooShort : true, other : true };
	channelPwdCheckList = { tooLong : true, tooShort : true, other : true };
	async checkInputChat(input: string, minVal: number, maxVal: number, form: string, fromHTML: boolean, checkList: { tooLong : boolean, tooShort : boolean, other : boolean }) {
		const inputFormElm = this.elRef.nativeElement.querySelector(form);
		checkList.other = fromHTML;

		if (input.length < minVal)
			checkList.tooShort = false;
		else
			checkList.tooShort = true;

		if (input.length > maxVal)
			checkList.tooLong = false;
		else
			checkList.tooLong = true;

		if (checkList.tooLong &&
			checkList.tooShort &&
			checkList.other)
		{
			if (inputFormElm.classList.contains('wrong-input'))
				inputFormElm.classList.remove('wrong-input');
			return (true);
			//input valide
		}
		else
		{
			if (!inputFormElm.classList.contains('wrong-input'))
				inputFormElm.classList.add('wrong-input');
			return (false)
			//input invalide

		}
	}

}
