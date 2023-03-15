import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
	@Get()
	getUsers() {
		return { username: 'tmoragli', email: 'tmoragli@student.42.fr' };
	}

	@Get('posts')
	getUsersPosts() {
		return [
			{
				username: 'tmoragli',
				email: 'tmoragli@student.42.fr',
				posts: [
					{ id: 1, title: 'Post 1' },
					{ id: 2, title: 'Post 2' },
				],
			},
		];
	}
}
