import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FetchService } from '../fetch.service';
import { Router } from '@angular/router';
import { User } from 'src/dtos/User.dto';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent {

	constructor(
			private loginService: FetchService,
			private router: Router,
		) {}

	async onClickSubmit(data: User) {
		data.image = { link: data.img_url, versions: { large: '' } };
		console.log(await this.loginService.createUser(data));
	}

	async onClickSubmitLogin(data: User) {
		console.log(await this.loginService.getUser(data));
	}

	async onClickAuth() {
		window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-5884ecaa84483dd01eaaca762e24f49dfe690f780a65a0eb5e3b62b8ff55c714&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fauth&response_type=code';
	}
}
