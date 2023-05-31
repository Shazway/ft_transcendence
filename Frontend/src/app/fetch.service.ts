import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { AxiosError } from 'axios';
import { Response } from 'src/dtos/Response.dto';
import { Message } from 'src/dtos/message';
import { NewChan } from 'src/dtos/NewChan.dto';
import { Channel } from 'src/dtos/Channel.dto'
import { AnyProfileUser, User, FriendRequest, MyProfileUser } from 'src/dtos/User.dto';
import { isUndefined } from 'mathjs';
import { ShopItem } from 'src/dtos/ShopItem.dto';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
	constructor (private httpClient: HttpClient, private router: Router) { }
	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': this.getJwtToken(),
		})
	};

	isConnected() {
		return localStorage.getItem('Jwt_token') ? true : false;
	}

	getHeader() {
		return {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Authorization': 'Bearer ' + this.getJwtToken(),
			}
		}
	}

	teapotError(error: AxiosError, route: Router) {
		if (error && error.response?.status == 418)
		{
			localStorage.clear();
			route.navigateByUrl('glassdoor');
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
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get('http://localhost:3001/leaderboard', this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async createUser(param: User) {
		let res;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.post<Response>('http://localhost:3001/users/create', param, this.getHeader())
		.then(function (response) {
			res = response.data;
			localStorage.setItem('Jwt_token', res.token);
			localStorage.setItem('id', res.user_id);
			localStorage.setItem('username', res.username);
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async getUser(login: string) {
		let res;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get<Response>('http://localhost:3001/users/' + login, this.getHeader())
		.then(function (response) {
			res = response.data;
			localStorage.setItem('Jwt_token', res.token);
			localStorage.setItem('id', res.user_id);
			localStorage.setItem('username', res.username);
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async getProfile(login: string | null): Promise<AnyProfileUser | null> {
		let res: AnyProfileUser | undefined;
		const teaFunc = this.teapotError;
		const route = this.router;
		if (!login)
			return null;
		await axios.get<AnyProfileUser>('http://localhost:3001/profile/' + login, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		if (res)
			return res;
		return null;
	}

	async getMyProfile() : Promise<MyProfileUser | null> {
		let res: MyProfileUser | undefined;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get<MyProfileUser>('http://localhost:3001/profile/' + localStorage.getItem('username'), this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		if (res)
			return res;
		return null;
	}

	async getBalance() {
		let res: MyProfileUser | null;
		res = await this.getMyProfile();
		if (res)
			return (res.currency);
		return (-1);
	}

	async getBuyableSkins() {
		let res : ShopItem[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get<{availableSkins: ShopItem[]}>('http://localhost:3001/shop/availableItems', this.getHeader())
		.then(function (response) {
			if (response && response.data)
				res = response.data.availableSkins;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return (res);
	}

	async buy(item : ShopItem) {
		let res : {newBalance : number, availableSkins : ShopItem[]} | undefined;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get<{newBalance : number, availableSkins : ShopItem[]}>('http://localhost:3001/shop/buy/' + item.skin_id, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		if (res)
			return res;
		return null;
	}

	async getLeaderboard() {
		let res: AnyProfileUser[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get<Array<AnyProfileUser>>('http://localhost:3001/leaderboard', this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async getFriends() {
		let res: AnyProfileUser[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		if (!this.isConnected())
			return res;
		await axios.get<Array<AnyProfileUser>>('http://localhost:3001/users/friends', this.getHeader())
		.then(function (response) {
			if (response && response.data)
				res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async getFriendshipRequests() {
		let res: {received: FriendRequest[], sent: FriendRequest[]} = {received: [], sent: []};
		const teaFunc = this.teapotError;
		const route = this.router;
		if (!this.isConnected())
			return res;
		await axios.get<{received: Array<FriendRequest>, sent: Array<FriendRequest>}>('http://localhost:3001/users/friendRequests', this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async getBlockedUsers() {
		let res: AnyProfileUser[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		if (!this.isConnected())
			return res;
		await axios.get<Array<AnyProfileUser>>('http://localhost:3001/users/getBlockedUsers', this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}
	
	async blockUser(block_id : number) {
		let res;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get('http://localhost:3001/users/block/' + block_id, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async unblockUser(block_id : number) {
		let res;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get('http://localhost:3001/users/unblock/' + block_id, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async removeFriends(friend_id: number) {
		let res;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get('http://localhost:3001/users/removeFriend/' + friend_id, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async cancelFriendRequest(friend_id: number) {
		let res;
		const teaFunc = this.teapotError;
		const route = this.router;
		console.log("id = " + friend_id);
		await axios.get('http://localhost:3001/users/removeFriendRequest/' + friend_id, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}


	async getMessages(channel_id: number, page: number): Promise<Message[]> {
		let res: Message[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get('http://localhost:3001/channels/' + channel_id + '/messages/' + page, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async isRightPass(param: {channel_id: number, pass: string}) {
		let res;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.post('http://localhost:3001/channels/rightPass', param, this.getHeader())
		.then(function (response) {
			res = response.data.rightPass;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async createChannel(param: NewChan) {
		let res;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.post('http://localhost:3001/channels/create', param, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async getChannels(): Promise<Channel[]> {
		let res: Channel[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get('http://localhost:3001/channels/all', this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async getChannel(id: number): Promise<Channel | undefined> {
		let res: Channel | undefined;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get('http://localhost:3001/channels/' + id, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async obliterateChannel(chan : Channel) {
		let res: any;
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.post<Array<AnyProfileUser>>('http://localhost:3001/channels/delete', {channel_id: chan.channel_id}, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async searchingSubstring(value : string) {
		let res: AnyProfileUser[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.post<Array<AnyProfileUser>>('http://localhost:3001/users/userBySubstring', {substring: value}, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async inviteSubstring(value : string) {
		let res: AnyProfileUser[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.post<Array<AnyProfileUser>>('http://localhost:3001/channels/inviteBySubstring', {substring: value}, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async opSubstring(value : string) {
		let res: AnyProfileUser[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.post<Array<AnyProfileUser>>('http://localhost:3001/channels/opBySubstring', {substring: value}, this.getHeader()) //chemin actuellement inexistant
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async channelInvite(user : AnyProfileUser, channel_id : number) {
		let res: AnyProfileUser[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.post<Array<AnyProfileUser>>('http://localhost:3001/channels/invite', {channel_id : channel_id, username : user.username, targetId : user.user_id}, this.getHeader())
		.then(function (response) {
			res = response.data;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return res;
	}

	async getAllSkins() {
		let res : ShopItem[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get<{skins: ShopItem[]}>('http://localhost:3001/shop/all', this.getHeader())
		.then(function (response) {
			if (response && response.data)
				res = response.data.skins;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return (res);
	}

	async getUserSkins() {
		let res : ShopItem[] = [];
		const teaFunc = this.teapotError;
		const route = this.router;
		await axios.get<{skins: ShopItem[]}>('http://localhost:3001/shop/allUserSkins', this.getHeader())
		.then(function (response) {
			if (response && response.data)
				res = response.data.skins;
		})
		.catch(function (error) {
			teaFunc(error, route);
		})
		.finally(function () {});
		return (res);
	}

	async getSettings() {

	}
	
}
