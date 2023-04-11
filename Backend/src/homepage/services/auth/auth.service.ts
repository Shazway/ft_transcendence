import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NewUserDto } from 'src/homepage/dtos/UserDto.dto';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}
	// async validateName(username: string, nickname: string): Promise<any> {
	// 	//TODO check names
	// }

	async login(user: NewUserDto, user_id: number) {
		const payload = {
			name: user.username,
			sub: user_id,
			token_42: user.token_42,
			token_google: user.token_google,
		};

		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
