import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { ResponseDto } from 'src/dtos/Response.dto';
import { UserDto } from 'src/dtos/UserDto.dto';
import { MessageDto } from 'src/dtos/message';
import { NewChanDto } from 'src/dtos/NewChan.dto';
import { ChannelDto } from 'src/dtos/Channel.dto'

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
		await axios.get('http://10.11.2.3:3001/leaderboard', this.getHeader())
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
		await axios.post<ResponseDto>('http://10.11.2.3:3001/users/create', param, this.getHeader())
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

	async getUser(param: UserDto) {
		let res;
		await axios.get<ResponseDto>('http://10.11.2.3:3001/users/' + param.login, this.getHeader())
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

	async getMessages(channel_id: number, page: number): Promise<MessageDto[]> {
		let res: MessageDto[] = [];
		await axios.get('http://10.11.2.3:3001/channels/' + channel_id + '/messages/' + page, this.getHeader())
		.then(function (response) {
		res = response.data;
		console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async createChannel(param: NewChanDto) {
		let res;
		console.log(param);
		await axios.post('http://10.11.2.3:3001/channels/create', param, this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async getChannels(): Promise<ChannelDto[]> {
		let res: ChannelDto[] = [];
		await axios.get('http://10.11.2.3:3001/channels/all', this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}
}
