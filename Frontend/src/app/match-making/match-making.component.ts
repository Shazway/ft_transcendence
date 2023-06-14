import { Component, ElementRef, OnDestroy } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { MatchMaking } from '../../dtos/MatchMaking.dto';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { FetchService } from '../fetch.service';

@Component({
	selector: 'app-match-making',
	templateUrl: './match-making.component.html',
	styleUrls: ['./match-making.component.css']
})
export class MatchMakingComponent implements OnDestroy{
	client: Socket;
	constructor(
		private websocketService: WebsocketService,
		private parent: AppComponent,
		private elRef: ElementRef,
		private router: Router,
		private fetchService: FetchService
	) {
		this.fetchService.checkToken();
		if (!this.parent.isConnected())
			this.router.navigateByUrl('login');
		this.client = io('ws://10.24.104.8:3004', websocketService.getHeader());
		if (!localStorage.getItem('Jwt_token'))
			return;
		if (!this.client)
			return;
		this.initEvent();
	}
	ngOnDestroy(): void {
		this.client.disconnect();
	}

	initEvent() {
		this.client.on('foundMatch', (event) => { this.matchFound(event); });
		this.client.on('onError', (event) => {});
		this.client.on('connection', () => { });
		this.client.on('disconnect', () => { });
		this.client.on('inMatch', () => this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigateByUrl("matchmaking")));
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
