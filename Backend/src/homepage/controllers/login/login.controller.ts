import { Controller, Post } from '@nestjs/common';
import { UsersService } from 'src/homepage/services/users/users.service';

@Controller('login')
export class LoginController {
	constructor(private userService: UsersService) {}

	@Post('login')
	login(): any {
		return {};
	}
}
