import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { FetchService } from '../fetch.service';
import { AuthCode, AuthDto, TokenDto } from 'src/dtos/AuthDto';
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
		let token: TokenDto;
		let user_data: UserDto;
		await axios.post<TokenDto>('http://localhost:3001/login', {code: code})
		.then(function (response) {
			token = response.data;
			localStorage.setItem('42_token', token.access_token);
			console.log(token);
		})
		const newToken = localStorage.getItem('42_token');
		if (newToken)
			await axios.get<UserDto>('https://api.intra.42.fr/v2/me', this.getHeader(newToken))
			.then(async function (response) {
				user_data = response.data;
				await axios.post<ResponseDto>('localhost:3001/users/create', user_data)
				.then(async function (response) {
					localStorage.setItem('token', response.data.token);
					localStorage.setItem('id', response.data.user_id);
					localStorage.setItem('username', response.data.username);
			})
		});
		this.router.navigateByUrl('');
	}
}
