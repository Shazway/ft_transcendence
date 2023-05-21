import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Response } from 'src/dtos/Response.dto';
import { Message } from 'src/dtos/message';
import { NewChan } from 'src/dtos/NewChan.dto';
import { Channel } from 'src/dtos/Channel.dto'
import { AnyProfileUser, User, FriendRequest, MyProfileUser } from 'src/dtos/User.dto';
import { isUndefined } from 'mathjs';

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

	async getUser(login: string) {
		let res;
		await axios.get<Response>('http://localhost:3001/users/' + login, this.getHeader())
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

	async getProfile(login: string | null): Promise<AnyProfileUser | null> {
		let res: AnyProfileUser | undefined;
		console.log(login);
		if (!login)
			return null;
		await axios.get<AnyProfileUser>('http://localhost:3001/profile/' + login, this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		if (res)
			return res;
		return null;
	}

	async getMyProfile() : Promise<MyProfileUser | null> {
		let res: MyProfileUser | undefined;
		await axios.get<MyProfileUser>('http://localhost:3001/profile/' + localStorage.getItem('username'), this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		if (res)
			return res;
		return null;
	}

	async getFriends() {
		let res: AnyProfileUser[] = [];
		await axios.get<Array<AnyProfileUser>>('http://localhost:3001/users/friends', this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log("amis :" +res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}

	async getFriendshipRequests() {
		let res: {received: FriendRequest[], sent: FriendRequest[]} = {received: [], sent: []};
		await axios.get<{received: Array<FriendRequest>, sent: Array<FriendRequest>}>('http://localhost:3001/users/friendRequests', this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log("demandes :" +res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}
	
	async blockUser(block_id : number) {
		let res;
		await axios.get('http://localhost:3001/users/block/' + block_id, this.getHeader())
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

	async getChannel(id: number): Promise<Channel | undefined> {
		let res: Channel | undefined;
		await axios.get('http://localhost:3001/channels/' + id, this.getHeader())
		.then(function (response) {
			res = response.data;
			console.log(res);
		})
		.catch(function (error) { console.log(error); })
		.finally(function () {});
		return res;
	}
}
