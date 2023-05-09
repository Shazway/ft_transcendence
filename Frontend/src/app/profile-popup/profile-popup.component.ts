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
	user!: Promise<AnyProfileUser | null>;

	constructor(
		private fetchService: FetchService,
	) { }

	async ngOnInit() {
		this.user = this.fetchService.getProfile(this.data.author.username);
	}
}
