import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { ResponseDto } from 'src/dtos/Response.dto';
import { UserDto } from 'src/dtos/UserDto.dto';

@Injectable({
  providedIn: 'root'
})
export class FetchService {

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
			  	'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY291Y291Iiwic3ViIjoxLCJpYXQiOjE2ODExNzk2NDAsImV4cCI6MTY4MTI2NjA0MH0.PT85fSZF_6dxQ3YxhHhvEkdOwTgELe2t4kd32HLH5Rg',
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

	createUser(param: JSON) {
		let resp;
		const res = this.httpClient.post<ResponseDto>('http://localhost:3001/users/create', param, this.httpOptions);
		res.subscribe((response) => {resp = response as ResponseDto});
		console.log(resp);
	}
}
