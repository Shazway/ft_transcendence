import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { HomepageModule } from './homepage/homepage.module';

@Module({
	imports: [UsersModule, HomepageModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
