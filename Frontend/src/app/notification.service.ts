import { Injectable, TemplateRef, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from './websocket.service';
import { ToastService } from './toast/toast.service';
import { NotificationRequest, NotificationResponse } from '../dtos/Notification.dto';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
	public client!: Socket;
	toastFriendRequest!: TemplateRef<any>;
	toastChallenge!: TemplateRef<any>;
	toastAchievement!: TemplateRef<any>;

	constructor(
		private websocketService: WebsocketService,
		private toastService: ToastService,
	) {
		if (!this.client || (this.client && !this.client.connected))
			this.client = io('ws://localhost:3003', this.websocketService.getHeader());
		this.setClientEvent();
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
		this.client.on('friendAnswer', (event) => { console.log('Answer ' + event);});
		this.client.on('pendingRequest', (event) => {  console.log('pendingRequest' + event); });
		this.client.on('friendInvite', (event) => { this.showNotificationInvite(event.notification); console.log('friendInvite ', event); });
		this.client.on('channelInvite', (event) => { this.showNotificationInvite(event.notification); console.log('channelInvite ', event); });
	}

	showNotificationInvite(notification: NotificationRequest) {
		this.toastService.show(this.toastFriendRequest, { classname: 'p-0', delay: 10000, context: notification });
	}

	showAchievements() {
		this.toastService.show(this.toastAchievement, { classname: 'p-0', delay: 10000, context: 'Nyehehe' });
	}

	showChallenge() {
		this.toastService.show(this.toastChallenge, { classname: 'bg-primary text-light p-0', delay: 10000, context: 'Nyehehe' });
	}

	initTemplates(toastFriendRequest: TemplateRef<any>, toastChallenge: TemplateRef<any>, toastAchievement: TemplateRef<any>) {
		this.toastFriendRequest = toastFriendRequest;
		this.toastChallenge = toastChallenge;
		this.toastAchievement = toastAchievement;
	}

	notifDismiss(toast: any) {
		this.toastService.remove(toast);
	}
}
