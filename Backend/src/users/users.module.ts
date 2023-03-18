import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './service/users/users.service';

@Module({
	controllers: [UsersController],
	providers: [
		{
			provide: UsersService,
			useClass: UsersService,
		},
	],
})
export class UsersModule {}
