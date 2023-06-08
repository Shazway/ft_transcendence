import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/dtos/message';
import { FetchService } from '../fetch.service';
import { AnyProfileUser } from 'src/dtos/User.dto';
import { Socket } from 'socket.io-client';
import { NotificationRequest } from 'src/dtos/Notification.dto';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';

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
export class ProfilePopupComponent implements OnInit, AfterViewInit {
	@Input() data!: any;
	user!: Promise<AnyProfileUser | null>;
	disable = true;

	constructor(
		private fetchService: FetchService,
		private router: Router,
	) { }

	async ngAfterViewInit() {
		const us = await this.user;
		if (us) {
			this.canChallenge(us);
		}
	}

	async ngOnInit() {
		this.user = this.fetchService.getProfile(this.data.name);
	}

	buildNotif(type: string, target_name: string, target_id: number) : NotificationRequest {
		return {type : type, target_id : target_id, target_name : target_name};
	}

	addFriend() {
		this.data.client.emit('inviteRequest', this.buildNotif("friend", this.data.name, this.data.id));
	}

	redirectProfil() {
		this.router.navigateByUrl('profile?username=' + this.data.name);
	}

	challenge() {
		this.data.client.emit('inviteRequest', this.buildNotif("match", this.data.name, this.data.id));
	}

	canChallenge(us : AnyProfileUser) {
		console.log(us);
		if (us.channelInviteAuth == 2)
		{
			this.disable = false;
			return ;
		}
		const username = localStorage.getItem('username');
		if (us.channelInviteAuth  == 1 && us.friend.some((a) => {return a.username == username}))
		{
			this.disable = false;
			return ;
		}
	}

	async goToProfile() {
		const us = await this.user;
		if (us) {
			this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigateByUrl("profile?username=" + us.username));
		}
	}
}
