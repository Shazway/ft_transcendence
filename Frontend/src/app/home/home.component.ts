import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

	constructor(
		private router: Router,
		private parent: AppComponent,
		private notifService: NotificationService,
	) {}

	async ngOnInit() {
		if (!this.parent.isConnected())
			this.router.navigateByUrl('glassdoor');
	}

	getUsername()
	{
		return(localStorage.getItem('username'));
	}

	printToast()
	{
		let test = {
			source_id : 0,
			type : "friend",
			source_name : "test0",
			sent_at : new Date(),
			accepted : false};
		this.notifService.showFriendRequest({test});
	}

}
