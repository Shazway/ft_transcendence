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

	token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY291Y291Iiwic3ViIjoxLCJpYXQiOjE2ODEzOTc5ODIsImV4cCI6MTY4MTQ4NDM4Mn0.cHaDKWlZVt2-74wd6ICutNTuCgfTWdf8Y9KucvISAYE';

	constructor (private httpClient: HttpClient){}
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
			  	'Authorization': 'Bearer ' + this.token,
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

	async getMessages(channel_id: number, page: number) {
		let res;
		await axios.get('http://localhost:3001/channels/' + channel_id + '/messages/' + page, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			  	'Authorization': 'Bearer ' + this.token,
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
