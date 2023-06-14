import { Component } from '@angular/core';
import axios from 'axios';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent {
	constructor() {}

	async onClickAuth() {
		let uid;
		await axios.get<string>('http://10.24.104.8:3001/login/getUID')
		.then(function (response) {
			uid = response.data;
		});
		if (!uid)
			return;
		window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=' + uid + '&redirect_uri=http%3A%2F%2F10.24.104.8%3A4200%2Fauth&response_type=code';
	}
}
