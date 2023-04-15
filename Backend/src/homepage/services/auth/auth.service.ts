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
			name: user.login,
			sub: user_id,
		};

		return this.jwtService.sign(payload);
	}
}
