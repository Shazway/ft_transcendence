import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { FetchService } from '../fetch.service';
import { Token } from '@angular/compiler';
import { Response } from 'src/dtos/Response.dto';
import { LogInReturn } from 'src/dtos/Auth';
import { User } from 'src/dtos/User.dto';
import { NotificationService } from '../notification.service';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.css']
})
export class AuthComponent {
	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private notifService: NotificationService,
		) {}

		getHeader(authorization : string) {
			return {
				headers: {
					Authorization: 'Bearer ' + authorization,
				}
				}
		}

	async ngOnInit() {
		const code = this.route.snapshot.queryParamMap.get('code');
		let loginReturn: LogInReturn;
		let statusCode = 0;
		let bodyId = 0;

		await axios.post<LogInReturn>('http://localhost:3001/login', {api_code: code})
		.then(function (response) {
			statusCode = response.status;
			loginReturn = response.data;
			if (statusCode == 201 || statusCode == 200)
			{
				localStorage.setItem('42_token', loginReturn.tokenInfo.access_token);
				localStorage.setItem('Jwt_token', loginReturn.jwt_token);
				localStorage.setItem('id', "" + loginReturn.user_id);
				localStorage.setItem('username', loginReturn.intraInfo.login);
				localStorage.setItem('img_url', loginReturn.intraInfo.image.link);
			} else if (statusCode == 202) {
				bodyId = loginReturn.user_id;
			}
		});
		if (statusCode == 202)
			this.router.navigateByUrl('validate?bodyId=' + bodyId + '&code=' + code);
		else
		{
			this.notifService.initSocket();
			this.router.navigateByUrl('profile');
		}
	}
}
