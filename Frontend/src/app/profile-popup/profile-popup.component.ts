import { Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/dtos/message';
import { FetchService } from '../fetch.service';
import { AnyProfileUser } from 'src/dtos/User.dto';

@Component({
  selector: 'app-profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.css']
})
export class ProfilePopupComponent implements OnInit {
	@Input() data!: Message;
	user!: AnyProfileUser | null;
	userConfirmed: AnyProfileUser;

	constructor(
		private fetchService: FetchService,
	) {
		this.userConfirmed = {
			username: '',
			img_url: '',
			match_history: [],
			rank_score: 0,
			activity_status: 0,
			createdAt: new Date(),
			wins: 0,
			losses: 0,
			achievements: [],
			friend: [],
			user_id: 0,
			intra_id: 0,
		};
	}

	async ngOnInit() {
		this.user = await this.fetchService.getProfile(this.data.author.username);
		if (this.user) {
			this.userConfirmed = this.user;
		}
	}
}
