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

	onClickSubmit(data: UserDto) {
		console.log(data);
		console.log(this.loginService.createUser(data));
	}
}
