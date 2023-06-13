import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { LogInReturn } from 'src/dtos/Auth';
import { TwoFacAuth } from 'src/dtos/TwoFacAuth.dto';
import { AppComponent } from '../app.component';

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
			private parent: AppComponent,
		) {}

	ngOnInit() {
		this.bodyid = this.route.snapshot.queryParamMap.get('bodyId');
		this.code = this.route.snapshot.queryParamMap.get('code');
	}

	async getCode(mdp: TwoFacAuth) {
		let statusCode = 0;
		let loginReturn: LogInReturn;
		await axios.post<LogInReturn>('http://localhost:3001/login/callback', {
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
				localStorage.setItem('img_url', loginReturn.intraInfo.image.versions.small);
			}
		});
		if (statusCode == 200) {
			this.parent.getUser();
			return this.router.navigateByUrl('profile');
		}
		if (statusCode == 401)
			this.nbTrys--;
		if (this.nbTrys <= 0)
			return this.router.navigateByUrl('login');
		return;
	}
}
