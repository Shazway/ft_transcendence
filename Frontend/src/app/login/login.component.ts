import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FetchService } from '../fetch.service';
import { UserDto } from 'src/dtos/UserDto.dto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

	constructor(private loginService: FetchService) {}

	async onClickSubmit(data: UserDto) {
		console.log(data);
		if (!data.rank_score)
			data.rank_score = 0;
		console.log(await this.loginService.createUser(data));
	}

	async onClickSubmitLogin(data: UserDto) {
		console.log(await this.loginService.getUser(data));
	}
}
