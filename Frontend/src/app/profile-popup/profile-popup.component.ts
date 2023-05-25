import { Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/dtos/message';
import { FetchService } from '../fetch.service';
import { AnyProfileUser } from 'src/dtos/User.dto';
import { Socket } from 'socket.io-client';
import { NotificationRequest } from 'src/dtos/Notification.dto';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.css'],
  animations: [
	trigger('viewFadeIn', [
		transition(':enter', [style({ opacity: '0' }), animate('300ms ease-out', style({ opacity: '1' }))]),
	])
  ],
})
export class ProfilePopupComponent implements OnInit {
	@Input() data!: any;
	msg!: Message;
	client!: Socket;
	user!: Promise<AnyProfileUser | null>;

	constructor(
		private fetchService: FetchService,
	) { }

	async ngOnInit() {
		this.msg = this.data.msg;
		this.client = this.data.client;
		this.user = this.fetchService.getProfile(this.data.msg.author.username);
	}

	buildNotif(type: string, target_name: string, target_id: number) : NotificationRequest {
		return {type : type, target_id : target_id, target_name : target_name};
	}

	addFriend() {
		this.data.client.emit('addFriend', this.buildNotif("friend", this.data.msg.author.username, this.data.msg.author.user_id));
	}
}
