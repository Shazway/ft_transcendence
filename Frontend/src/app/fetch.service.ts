import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { ResponseDto } from 'src/dtos/Response.dto';
import { UserDto } from 'src/dtos/UserDto.dto';
import { Message } from 'src/dtos/message';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
	chanList: Map<number, WebSocket>;
	constructor (private httpClient: HttpClient){
		this.chanList = new Map<number, WebSocket>;
	}
	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': this.getToken(),
		})
	};


	getToken() {
		const token = localStorage.getItem('token');
		if (!token)
			return '';
		return token;	
	}

	async getAllUsers() {
		let res;
		await axios.get('http://localhost:3001/leaderboard', {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			  	'Authorization': 'Bearer ' + this.getToken(),
			}
		  })
		.then(function (response) {
		  res = response.data;
		  console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async sendMessage(content: string)
	{}
	async delchatSocket(channel_id: number)
	{
		const client = this.chanList.get(channel_id);
		if (!client)
			return false;
		client.close();
		this.chanList.delete(channel_id);
		return true;

	}
	async addchatSocket(channel_id: number)
	{
		if (!this.chanList.get(channel_id))
			return (false);
		const client = new WebSocket('ws://localhost:3002?channel_id=' + channel_id);
		if (!client)
			return false;
		client.addEventListener('onMessage', (event) => {console.log('Messaged recieved')});
		client.addEventListener('onError', (event) => {
		console.error('WebSocket error:', event)});

		client.onopen('open', () => {
			console.log('Connected to WebSocket server');
		});
		
		client.on('close', () => {
			console.log('Disconnected from WebSocket server');
		});
		this.chanList.set(channel_id, client);
		return (true);
	}

	async createUser(param: UserDto) {
		let res;
		await axios.post<ResponseDto>('http://localhost:3001/users/create', param, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			}
		  })
		.then(function (response) {
			res = response.data;
			console.log(res);
			localStorage.setItem('token', res.token);
			localStorage.setItem('id', res.user_id);
			localStorage.setItem('username', res.username);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async getUser(param: UserDto) {
		let res;
		await axios.get<ResponseDto>('http://localhost:3001/users/' + param.username, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			}
		  })
		.then(function (response) {
			res = response.data;
			console.log(res);
			localStorage.setItem('token', res.token);
			localStorage.setItem('id', res.user_id);
			localStorage.setItem('username', res.username);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async getMessages(channel_id: number, page: number) {
		let res;
		await axios.get('http://localhost:3001/channels/' + channel_id + '/messages/' + page, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			  	'Authorization': 'Bearer ' + this.getToken(),
			}
		  })
		.then(function (response) {
		  res = response.data;
		  console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}
}
