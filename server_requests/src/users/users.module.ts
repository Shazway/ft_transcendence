import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ValidateUserAccountMiddleware } from './controllers/middlewares/validate-user-account-middleware';
import { ValidateUserMiddleware } from './controllers/middlewares/validate-user.middleware';
import { UsersController } from './controllers/users/users.controller';
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
export class UsersModule implements NestModule {
	configure(user: MiddlewareConsumer) {
		user.apply(ValidateUserMiddleware, ValidateUserAccountMiddleware)
		.exclude(
		{
			path: '/api/users/create/',
			method: RequestMethod.GET,
		},
		{
			path: '/api/users/:username/',
			method: RequestMethod.GET,
		},)
		.forRoutes
		(UsersController);
	}
}
