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
		updated = await this.fetchService.getProfile(newUser.username);
		if (updated)
			this.currentStatus = updated.activity_status;
		else
			this.currentStatus = newUser.activity_status;
	}

	async spectate(friend: AnyProfileUser)
	{
		//todo
		console.log("Tentative de spectate");
	}

	
}
