import { Injectable, TemplateRef, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from './websocket.service';
import { ToastService } from './toast/toast.service';
import { NotificationRequest, NotificationResponse } from '../dtos/Notification.dto';
import { AppComponent } from './app.component';
import { FriendRequest } from 'src/dtos/User.dto';
import { FetchService } from './fetch.service';


@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	public client!: Socket;
	toastFriendRequest!: TemplateRef<any>;
	toastNewFriend!: TemplateRef<any>;
	toastChallenge!: TemplateRef<any>;
	toastAchievement!: TemplateRef<any>;
	toastFailure!: TemplateRef<any>;
	toastSuccess!: TemplateRef<any>;
	toastChannel!: TemplateRef<any>;

	public friendshipRequests: {received: FriendRequest[], sent: FriendRequest[]} = {received: [], sent: []};

	constructor(
		private websocketService: WebsocketService,
		private fetchService: FetchService,
		private toastService: ToastService,
	) {
		if (!this.client || (this.client && !this.client.connected))
			this.client = io('ws://localhost:3003', this.websocketService.getHeader());
		this.setClientEvent();
		this.updateFriendRequests();
	}

	initSocket() {
		if (!this.client || (this.client && !this.client.connected))
			this.client = io('ws://localhost:3003', this.websocketService.getHeader());
		this.setClientEvent();
	}

	emit(event: string, ...args: any []) {
		if (args.length == 1)
			this.client.emit(event, args[0]);
		else
			this.client.emit(event, args);
	}

	setClientEvent() {
		this.client.on('friendAnswer', (event) => { this.showNewFriend(event.notification); console.log('friendAnswer ' + event); this.updateFriendRequests();});
		this.client.on('pendingRequest', (event) => {  console.log('pendingRequest' + event); this.updateFriendRequests(); });
		this.client.on('friendInvite', (event) => { this.showNotificationInvite(event.notification); console.log('friendInvite ', event); this.updateFriendRequests();});
		this.client.on('challenge', (event) => { this.showChallenge(event.notification); console.log('challenge ', event);});
		this.client.on('failure', (event) => { this.showFailure(event.notification); console.log('failure ', event); this.updateFriendRequests(); });
		this.client.on('success', (event) => { this.showSuccess(event.notification); console.log('success ', event); this.updateFriendRequests(); });
		this.client.on('channel', (event) => { this.showChannel(event.notification); console.log('channel ', event); });
		this.client.on('onError', (event) => { console.log('erreur + ' + event); });
	}

	showNotificationInvite(notification: NotificationRequest) {
		this.toastService.show(this.toastFriendRequest, { classname: 'bg-light p-0', delay: 10000, context: notification });
	}

	showNewFriend(notification: NotificationRequest) {
		this.toastService.show(this.toastNewFriend, { classname: 'bg-light p-0', delay: 10000, context: notification });
	}

	showAchievements(notification: NotificationRequest) {
		this.toastService.show(this.toastAchievement, { classname: 'bg-light p-0', delay: 10000, context: notification });
	}

	showChallenge(notification: NotificationRequest) {
		this.toastService.show(this.toastChallenge, { classname: 'bg-light p-0', delay: 10000, context: notification });
	}

	showFailure(notification: NotificationRequest) {
		this.toastService.show(this.toastFailure, { classname: 'bg-danger p-0', delay: 1000, context: notification });
	}

	showSuccess(notification: NotificationRequest) {
		this.toastService.show(this.toastSuccess, { classname: 'bg-success p-0', delay: 1000, context: notification });
	}

	showChannel(notification: NotificationRequest) {
		this.toastService.show(this.toastChannel, { classname: 'bg-light p-0', delay: 10000, context: notification });
	}

	initTemplates(
		toastFriendRequest: TemplateRef<any>,
		toastNewFriend: TemplateRef<any>,
		toastChallenge: TemplateRef<any>,
		toastAchievement: TemplateRef<any>,
		toastFailure: TemplateRef<any>,
		toastSuccess: TemplateRef<any>,
		toastChannel: TemplateRef<any>)
	{
		this.toastFriendRequest = toastFriendRequest;
		this.toastNewFriend = toastNewFriend;
		this.toastChallenge = toastChallenge;
		this.toastAchievement = toastAchievement;
		this.toastFailure = toastFailure;
		this.toastSuccess = toastSuccess;
		this.toastChannel = toastChannel;
	}

	notifDismiss(toast: any) {
		this.toastService.remove(toast);
	}

	async updateFriendRequests() {
		this.friendshipRequests = await this.fetchService.getFriendshipRequests();
	}
}
