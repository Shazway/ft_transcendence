import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { ResponseDto } from 'src/dtos/Response.dto';
import { UserDto } from 'src/dtos/UserDto.dto';
import { MessageDto } from 'src/dtos/message';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
	constructor (private httpClient: HttpClient) { }
	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': this.getToken(),
		})
	};

	getHeader() {
		return {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			  	'Authorization': 'Bearer ' + this.getToken(),
			}
		  }
	}

	getToken() {
		const token = localStorage.getItem('token');
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

	async createUser(param: UserDto) {
		let res;
		await axios.post<ResponseDto>('http://localhost:3001/users/create', param, this.getHeader())
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
		await axios.get<ResponseDto>('http://localhost:3001/users/' + param.login, this.getHeader())
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

	async getMessages(channel_id: number, page: number): Promise<MessageDto[]> {
		let res: MessageDto[] = [];
		await axios.get('http://localhost:3001/channels/' + channel_id + '/messages/' + page, this.getHeader())
		.then(function (response) {
		res = response.data;
		console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}
}
