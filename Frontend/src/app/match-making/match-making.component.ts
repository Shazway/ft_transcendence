import { Component, ElementRef } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { MatchMaking } from '../../dtos/MatchMaking.dto';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
	selector: 'app-match-making',
	templateUrl: './match-making.component.html',
	styleUrls: ['./match-making.component.css']
})
export class MatchMakingComponent {
	client: Socket;
	constructor(
		private websocketService: WebsocketService,
		private parent: AppComponent,
		private elRef: ElementRef,
		private router: Router
	) {
		if (!this.parent.isConnected())
			this.router.navigateByUrl('login');
		this.client = io('ws://localhost:3004', websocketService.getHeader());
		if (!localStorage.getItem('Jwt_token'))
			return;
		if (!this.client)
			return;
		this.client.on('foundMatch', (event) => { console.log(event); this.matchFound(event); });
		this.client.on('onError', (event) => { console.log('WebSocket error: ' + event);});
		this.client.on('connection', () => { console.log('Connected to WebSocket server'); });
		this.client.on('disconnect', () => { console.log('Disconnected from WebSocket server'); });
	}

	matchFound(match: MatchMaking) {
		const loadingText = this.elRef.nativeElement.querySelector('.loader');
		const loadingSpin = this.elRef.nativeElement.querySelector('.spinner-border');
		loadingSpin.classList.remove('spinner-border');
		loadingSpin.classList.add('spinner-grow');
		loadingText.textContent = "Starting match " + match.match_id + " against " + match.username;
		this.router.navigateByUrl('pong?match_id=' + match.match_id);
	}
}
