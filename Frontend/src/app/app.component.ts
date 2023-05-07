import { Component, ElementRef } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from './websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Frontend';
  isExpanded = false;

  constructor(
	private elRef: ElementRef
  ){}

  isConnected() {
	return localStorage.getItem('Jwt_token') ? true : false;
  }

  togglePlay() {
	const offscreenElm = this.elRef.nativeElement.querySelector('#play');
	if (!offscreenElm)
		return;
	if (offscreenElm.classList.contains('show')) {
		offscreenElm.classList.remove('show');
	} else {
		offscreenElm.classList.add('show');
	}
  }
}
