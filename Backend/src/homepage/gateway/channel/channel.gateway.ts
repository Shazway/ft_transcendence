import { OnModuleInit } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageDto } from 'src/homepage/dtos/MessageDto.dto';
import { MessagesService } from 'src/homepage/services/messages/messages.service';

@WebSocketGateway(3002)
export class ChannelGateway implements OnModuleInit {
	constructor(private messageService: MessagesService) {}
	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log(socket.id);
			console.log('connected');
		});
	}

	@SubscribeMessage('message')
	async handleMessage(client: any, payload: any, @MessageBody() body: MessageDto[]) {
		await this.messageService.addMessageToChannel(body);
		this.server.emit('onMessage', body[0].content);
	}
}
