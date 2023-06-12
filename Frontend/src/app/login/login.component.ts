import { Component, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FetchService } from '../fetch.service';
import { Router } from '@angular/router';
import { User } from 'src/dtos/User.dto';
import axios from 'axios';
import { NotificationService } from '../notification.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent {

	devModeElm : any;

	constructor(
			private loginService: FetchService,
			private elRef: ElementRef,
			private router: Router,
			private notifService: NotificationService,
		) {}

	async onClickSubmit(data: User) {
		data.image = { link: data.img_url, versions: { large: '' } };
		console.log(await this.loginService.createUser(data));
		this.notifService.initSocket();
	}

	async onClickSubmitLogin(data: User) {
		console.log(await this.loginService.getUser(data.login));
		this.notifService.initSocket();
	}

	async onClickAuth() {
		let uid;
		await axios.get<string>('http://10.14.3.3:3001/login/getUID')
		.then(function (response) {
			uid = response.data;
		});
		if (!uid)
			return;
		window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=' + uid + '&redirect_uri=http%3A%2F%2F10.14.3.3%3A4200%2Fauth&response_type=code';
	}

	showDevDoor() {
		this.devModeElm = this.elRef.nativeElement.querySelector("#modeDev");
		if (this.devModeElm.classList.contains('fade'))
			this.devModeElm.classList.remove('fade');
		else
			this.devModeElm.classList.add('fade');
	}
}
