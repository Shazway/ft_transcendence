import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { FetchService } from '../fetch.service';
import { LogInReturnDto } from 'src/dtos/AuthDto';
import { Token } from '@angular/compiler';
import { UserDto } from 'src/dtos/UserDto.dto';
import { ResponseDto } from 'src/dtos/Response.dto';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.css']
})
export class AuthComponent {
	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private fetchService : FetchService
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
		let loginReturn: LogInReturnDto;
		let user_data: UserDto;
		await axios.post<LogInReturnDto>('http://localhost:3001/login', {code: code})
		.then(function (response) {
			loginReturn = response.data;
			localStorage.setItem('42_token', loginReturn.tokenInfo.access_token);
			localStorage.setItem('Jwt_token', loginReturn.jwt_token);
			localStorage.setItem('id', "" + loginReturn.intraInfo.id);
			localStorage.setItem('username', loginReturn.intraInfo.login);
			console.log("Jwt token: " + loginReturn.jwt_token);
			console.log("42 token: " + loginReturn.tokenInfo.access_token);
			console.log("	-Expires in: " + loginReturn.tokenInfo.expires_in);
			console.log("Intra ID: " + loginReturn.intraInfo.id);
			console.log("User login: " + loginReturn.intraInfo.login);
		});
		this.router.navigateByUrl('');
	}
}
