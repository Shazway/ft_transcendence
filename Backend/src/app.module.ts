import { Module } from '@nestjs/common';
import { HomepageModule } from './homepage/homepage.module';

@Module({
	imports: [HomepageModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
