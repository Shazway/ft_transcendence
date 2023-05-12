import { Injectable, TemplateRef, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from './websocket.service';
import { ToastService } from './toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
	public client: Socket;
	toastFriendRequest!: TemplateRef<any>;
	toastChallenge!: TemplateRef<any>;
	toastAchievement!: TemplateRef<any>;

	constructor(
		private websocketService: WebsocketService,
		private toastService: ToastService,
	) { 
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
		this.client.on('friendInvite', (event) => { this.showFriendRequest(); console.log('friendInvite ', event); });
	}

	showFriendRequest() {
		this.toastService.show(this.toastFriendRequest, { classname: 'bg-success text-light p-0', delay: 10000, context: 'Nyehehe' });
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
