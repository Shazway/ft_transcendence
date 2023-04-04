import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FetchService {

	constructor(private httpClient: HttpClient) { }

	getAllUsers() {
		return this.httpClient.get('http://localhost:3001/leaderboard');
	}

	createUser(param: JSON) {
		return this.httpClient.post<any>('http://localhost:3001/users/create', param);
	}
}
