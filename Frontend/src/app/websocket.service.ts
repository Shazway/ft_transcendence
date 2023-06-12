import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client'
import { LessMessage } from 'src/dtos/message';

@Injectable({
	providedIn: 'root'
})
export class WebsocketService {
	chanList: Map<number, Socket>;
	constructor() {
		this.chanList = new Map<number, Socket>;
	}

	getHeader() {
		return {
				withCredentials: false,
				extraHeaders: {
				Authorization: this.getJwtToken(),
			}
		}
	}

	getJwtToken() {
		const token = localStorage.getItem('Jwt_token');
		if (!token)
			return '';
		return token;
	}
}
