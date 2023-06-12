import { Injectable, TemplateRef, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from './websocket.service';
import { ToastService } from './toast/toast.service';
import { NotificationRequest, NotificationResponse } from '../dtos/Notification.dto';
import { AppComponent } from './app.component';
import { FriendRequest } from 'src/dtos/User.dto';
import { FetchService } from './fetch.service';
import { Router } from '@angular/router';


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
		private router: Router,
	) {
		if (this.isConnected()) {
			if (!this.client || (this.client && !this.client.connected))
				this.client = io('ws://localhost:3003', this.websocketService.getHeader());
			this.setClientEvent();
			this.updateFriendRequests();
		}
	}

	initSocket() {
		if (this.isConnected()) {
			if (!this.client || (this.client && !this.client.connected))
				this.client = io('ws://localhost:3003', this.websocketService.getHeader());
			this.setClientEvent();
			this.updateFriendRequests();
		}
	}

	isConnected() {
		return localStorage.getItem('Jwt_token') ? true : false;
	}

	emit(event: string, ...args: any []) {
		if (args.length == 1)
			this.client.emit(event, args[0]);
		else
			this.client.emit(event, args);
	}

	setClientEvent() {
		this.client.on('friendAnswer', (event) => { this.showNewFriend(event.notification); this.updateFriendRequests(); });
		this.client.on('pendingRequest', (event) => { this.updateFriendRequests(); });
		this.client.on('friendInvite', (event) => { this.showNotificationInvite(event.notification); this.updateFriendRequests(); });
		this.client.on('matchInvite', (event) => { this.showChallenge(event.notification); });
		this.client.on('failure', (event) => { this.showFailure(event); this.updateFriendRequests(); });
		this.client.on('success', (event) => { this.showSuccess(event); this.updateFriendRequests(); });
		this.client.on('channel', (event) => { this.showSuccess(event); });
		this.client.on('onError', (event) => { this.showFailure(event); });
		this.client.on('newAchievement', (event) => { this.showAchievements(event); });
		this.client.on('offline', (event)=> {this.showFailure(event); })
		this.client.on('casualMatch', (event)=> {this.launchMatch(event);})
	}

	launchMatch(notification: number) {
		if (notification && !Number.isNaN(notification))
			this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigateByUrl('pong?match_id=' + notification));
	}

	showNotificationInvite(notification: NotificationRequest) {
		this.toastService.show(this.toastFriendRequest, { classname: 'bg-light p-0', delay: 10000, context: notification });
	}

	showNewFriend(notification: NotificationRequest) {
		if (notification.accepted)
			this.toastService.show(this.toastNewFriend, { classname: 'bg-light p-0', delay: 5000, context: notification });
	}

	showAchievements(notification: string) {
		this.toastService.show(this.toastAchievement, { classname: 'bg-light p-0', delay: 10000, context: notification });
		//if (notification.includes('Easter Egg'))
		//	this.parent
	}

	showChallenge(notification: NotificationRequest) {
		this.toastService.show(this.toastChallenge, { classname: 'bg-light p-0', delay: 10000, context: notification });
	}

	showFailure(notification: string) {
		this.toastService.show(this.toastFailure, { classname: 'bg-danger p-0', delay: 2000, context: notification });
	}

	showSuccess(notification: string) {
		this.toastService.show(this.toastSuccess, { classname: 'bg-success p-0', delay: 2000, context: notification });
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
