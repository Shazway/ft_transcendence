import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}
	// async validateName(username: string, nickname: string): Promise<any> {
	// 	//TODO check names
	// }

	async login(user: UserEntity) {
		const payload = {
			name: user.username,
			sub: user.user_id,
		};

		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
