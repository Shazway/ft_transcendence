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

	constructor(
		private parent: AppComponent,
		private fetchService: FetchService
	) {}

	async ngOnInit() {
		this.users = await this.fetchService.getLeaderboard();
		this.currentUser = this.users[0];
	}

	updateCurrentUser(newUser : AnyProfileUser) {
		this.currentUser = newUser;
	}

	
}
