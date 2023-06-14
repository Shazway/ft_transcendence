import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { NotificationService } from '../notification.service';
import { FetchService } from '../fetch.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

	secretBool : boolean = false;

	constructor(
		private router: Router,
		private fetchService: FetchService,
		private parent: AppComponent,
		private notifService: NotificationService,
	) {}

	async ngOnInit() {
		if (!this.parent.isConnected())
			this.router.navigateByUrl('glassdoor');
	}

	navTo(route : string) {
		this.router.navigateByUrl(route);
	}

	getUsername()
	{
		return(localStorage.getItem('username'));
	}

	async secret() {
		const user = this.parent.myProfile;
		if (!user)
			return ;
		if (this.secretBool || (user.achievements.unlockedAchievements.find((achievement) => achievement.achievement_name == 'Easter Egg')))
			return ;
		this.secretBool = true;
		this.parent.updateThunes(user.currency + 250);
		this.fetchService.secret();
	}
}
