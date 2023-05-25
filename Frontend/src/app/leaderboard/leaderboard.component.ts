import { Component } from '@angular/core';
import { AnyProfileUser } from 'src/dtos/User.dto';
import { FetchService } from '../fetch.service';
import { AppComponent } from '../app.component';
import { PopoverConfig } from 'src/dtos/Popover.dto';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent {

	public users!: AnyProfileUser[];
	public currentUser!: AnyProfileUser;
	public currentStatus = 0;

	constructor(
		private parent: AppComponent,
		private fetchService: FetchService
	) {}

	async ngOnInit() {
		this.users = await this.fetchService.getLeaderboard();
		this.currentUser = this.users[0];
	}

	async updateCurrentUser(newUser : AnyProfileUser) {
		let updated :  AnyProfileUser | null;
		this.currentUser = newUser;
		this.currentStatus = this.currentUser.activity_status;
		updated = await this.fetchService.getProfile(newUser.username);
		if (updated) {
			if (updated.user_id == this.currentUser.user_id)
				this.currentStatus = updated.activity_status;
			newUser.activity_status = updated.activity_status;
		}
	}

	async spectate(friend: AnyProfileUser) {
		if (friend.activity_status != 2)
			return;
		//todo
		console.log("Tentative de spectate");
	}

	getCurrentStatus(status: number) {
		if (this.currentUser.username == localStorage.getItem('username'))
			return ['online', 'bg-success'];
		if (status == 0) return ['offline', 'bg-secondary'];
		if (status == 1) return ['online', 'bg-success'];
		if (status == 2) return ['playing', 'bg-primary'];
		return 'WTF?';
	}

	
}
