import { Module } from '@nestjs/common';
import { HomepageModule } from './homepage/homepage.module';
import { HttpexceptionFilter } from './homepage/filters/httpexception/httpexception.filter';
import { APP_FILTER } from '@nestjs/core';
import { WsexceptionFilter } from './homepage/filters/wsexception/wsexception.filter';

@Module({
	imports: [HomepageModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
