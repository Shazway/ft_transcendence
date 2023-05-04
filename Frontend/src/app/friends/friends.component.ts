import { Component } from '@angular/core';
import { FetchService } from '../fetch.service';
import { AnyProfileUser } from 'src/dtos/User.dto';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent {
	user_id = localStorage.getItem("user_id");
	public friends: AnyProfileUser[] = [];
	constructor(
		private fetchService: FetchService
	) {}
	
	async ngOnInit() {
		this.friends = await this.fetchService.getFriends();
	}

	async addSystemFriend() {
		await this.fetchService.addFriends(1);
		this.friends.splice(0);
		this.friends = await this.fetchService.getFriends();
		console.log(this.friends);
	}
}
