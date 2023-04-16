import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IntraInfo } from 'src/homepage/dtos/ApiDto.dto';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}
	// async validateName(username: string, nickname: string): Promise<any> {
	// 	//TODO check names
	// }

	async login(user: IntraInfo) {
		const payload = {
			name: user.login,
			sub: user.id,
		};
		return this.jwtService.sign(payload);
	}
}
