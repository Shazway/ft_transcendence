import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Response } from 'src/dtos/Response.dto';
import { Message } from 'src/dtos/message';
import { NewChan } from 'src/dtos/NewChan.dto';
import { Channel } from 'src/dtos/Channel.dto'
import { AnyProfileUser, User } from 'src/dtos/User.dto';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
	constructor (private httpClient: HttpClient) { }
	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': this.getJwtToken(),
		})
	};

	getHeader() {
		return {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Authorization': 'Bearer ' + this.getJwtToken(),
			}
		}
	}

	getJwtToken() {
		const token = localStorage.getItem('Jwt_token');
		if (!token)
			return '';
		return token;
	}

	async getAllUsers() {
		let res;
		await axios.get('http://localhost:3001/leaderboard', this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async createUser(param: User) {
		let res;
		await axios.post<Response>('http://localhost:3001/users/create', param, this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
			localStorage.setItem('Jwt_token', res.token);
			localStorage.setItem('id', res.user_id);
			localStorage.setItem('username', res.username);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async getUser(param: User) {
		let res;
		await axios.get<Response>('http://localhost:3001/users/' + param.login, this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
			localStorage.setItem('Jwt_token', res.token);
			localStorage.setItem('id', res.user_id);
			localStorage.setItem('username', res.username);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async getFriends() {
		let res: AnyProfileUser[] = [];
		await axios.get<Array<AnyProfileUser>>('http://localhost:3001/users/friends', this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async addFriends(friend_id: number) {
		let res;
		await axios.get('http://localhost:3001/users/add_friend/' + friend_id, this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async getMessages(channel_id: number, page: number): Promise<Message[]> {
		let res: Message[] = [];
		await axios.get('http://localhost:3001/channels/' + channel_id + '/messages/' + page, this.getHeader())
		.then(function (response) {
		res = response.data;
		console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async createChannel(param: NewChan) {
		let res;
		console.log(param);
		await axios.post('http://localhost:3001/channels/create', param, this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async getChannels(): Promise<Channel[]> {
		let res: Channel[] = [];
		await axios.get('http://localhost:3001/channels/all', this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}
}
