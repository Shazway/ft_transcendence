import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { LogInReturn } from 'src/dtos/Auth';
import { TwoFacAuth } from 'src/dtos/TwoFacAuth.dto';

@Component({
	selector: 'app-validate',
	templateUrl: './validate.component.html',
	styleUrls: ['./validate.component.css']
})
export class ValidateComponent {
		private bodyid: any;
		private code: any;
		private nbTrys = 3;
		constructor(
			private route: ActivatedRoute,
			private router: Router,
		) {}

	ngOnInit() {
		this.bodyid = this.route.snapshot.queryParamMap.get('bodyId');
		this.code = this.route.snapshot.queryParamMap.get('code');
	}

	async getCode(mdp: TwoFacAuth) {
		let statusCode = 0;
		let loginReturn: LogInReturn;
		await axios.post<LogInReturn>('http://10.11.3.2:3001/login/callback', {
			mail_code: mdp.code,
			id: this.bodyid,
			api_code: this.code
		})
		.then(function (response){
			statusCode = response.status;
			if (statusCode == 200)
			{
				loginReturn = response.data;
				localStorage.setItem('42_token', loginReturn.tokenInfo.access_token);
				localStorage.setItem('Jwt_token', loginReturn.jwt_token);
				localStorage.setItem('id', "" + loginReturn.user_id);
				localStorage.setItem('username', loginReturn.intraInfo.login);
				console.log("Jwt token: " + loginReturn.jwt_token);
				console.log("42 token: " + loginReturn.tokenInfo.access_token);
				console.log("Expires in: " + loginReturn.tokenInfo.expires_in);
				console.log("Intra ID: " + loginReturn.intraInfo.id);
				console.log("User login: " + loginReturn.intraInfo.login);
			}
		});
		if (statusCode == 200)
			return this.router.navigateByUrl('');
		if (statusCode == 401)
			this.nbTrys--;
		if (this.nbTrys <= 0)
			return this.router.navigateByUrl('');
		return;
	}
}
