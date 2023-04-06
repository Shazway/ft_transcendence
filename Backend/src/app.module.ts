import { Module } from '@nestjs/common';
import { HomepageModule } from './homepage/homepage.module';
import { ChannelsService } from './services/channels/channels.service';

@Module({
	imports: [HomepageModule],
	controllers: [],
	providers: [ChannelsService],
})
export class AppModule {}
