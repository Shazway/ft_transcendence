import { Module } from '@nestjs/common';
import { HomepageModule } from './homepage/homepage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { varFetchService } from './homepage/services/var_fetch/var_fetch.service';

@Module({
	imports: [
		HomepageModule,
		TypeOrmModule.forRootAsync(varFetchService.typeOrmAsyncConfig),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
