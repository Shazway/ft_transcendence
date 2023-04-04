import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FetchService } from '../fetch.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

	constructor(private loginService: FetchService) {}

	onClickSubmit(data: JSON) {
		console.log(this.loginService.createUser(data));
	}
}
