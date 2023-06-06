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

	secret() {
		this.fetchService.secret();
	}
}
