import { Component } from '@angular/core';
import { Message } from '../../dtos/message'
import { FetchService } from '../fetch.service';
import { webSocket } from 'rxjs/webSocket';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent {
	msgs$: Promise<any> | undefined;
	constructor(private fetchService: FetchService,) {
		this.msgs$ = this.fetchService.getMessages(1, 0);
	}

	isMe(msg : Message) : boolean {
		return (msg.author.user_id === Number(localStorage.getItem('id')));
	};
}
