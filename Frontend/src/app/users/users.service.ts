/* eslint-disable no-console */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private httpClient: HttpClient) { }

  getUsers() {
    console.log('pass getUser');
    let head = new HttpHeaders;

    return this.httpClient.get('http://10.11.6.1:3001/leaderboard', options: {header: });
  }
}
