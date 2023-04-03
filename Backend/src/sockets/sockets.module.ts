import { Module } from '@nestjs/common';
import { SocketGateway } from './gateway/gateway.gateway';

@Module({
	providers: [SocketGateway, SocketGateway],
})
export class SocketsModule {}
