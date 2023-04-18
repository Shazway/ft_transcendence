import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IntraInfo } from 'src/homepage/dtos/ApiDto.dto';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}
	// async validateName(username: string, nickname: string): Promise<any> {
	// 	//TODO check names
	// }

	async login(user: IntraInfo, user_id: number) {
		const payload = {
			name: user.login,
			sub: user_id,
		};
		return this.jwtService.sign(payload);
	}
}
