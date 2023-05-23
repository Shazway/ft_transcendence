/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Req,
	Res
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../../services/users/users.service';
import { AuthService } from 'src/homepage/services/auth/auth.service';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { plainToClass } from 'class-transformer';
import { AnyProfileUser } from 'src/homepage/dtos/User.dto';
import { ChannelsService } from 'src/homepage/services/channels/channels.service';
import { IntraInfo } from 'src/homepage/dtos/Api.dto';

@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		private authService: AuthService,
		private itemsService: ItemsService,
		private tokenManager: TokenManagerService,
		private channelService: ChannelsService
	) {}

	@Post('change_name')
	async changeUsername(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: { username: string }
	) {
		const checkUser = await this.itemsService.getUserByUsername(body.username);
		const currentUser = await this.tokenManager.getUserFromToken(req);

		if (checkUser && checkUser.user_id == currentUser.sub)
			return res.status(HttpStatus.NOT_MODIFIED).send('Username taken');
		if (checkUser && checkUser.user_id != currentUser.sub)
			return res
				.status(HttpStatus.UNAUTHORIZED)
				.send('Trying to change someone elses username ?');
		this.usersService.changeUserName(body.username, currentUser.sub);
		return res.status(HttpStatus.ACCEPTED).send('Username changed');
	}

	@Post('create')
	async createUser(@Req() req: Request, @Res() res: Response, @Body() newUser: IntraInfo) {
		console.log(newUser);
		const check_username = await this.usersService.checkUserByName(newUser.login);

		if (check_username && check_username.user_id === newUser.id)
			return res.status(HttpStatus.FORBIDDEN).send("You can't use the same username");
		else if (check_username)
			return res.status(HttpStatus.FORBIDDEN).send('Username is already taken');
		const userEntity = await this.usersService.createUser(newUser);
		newUser.id = userEntity.user_id;
		return res.status(HttpStatus.OK).send({
			msg: 'User created',
			token: await this.authService.login(newUser, userEntity.user_id, ''),
			user_id: userEntity.user_id,
			username: userEntity.username
		});
	}

	@Get('add_friend/:id')
	async addFriend(
		@Param('id', ParseIntPipe) friend_id: number,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.tokenManager.getUserFromToken(req);
		console.log({ FriendToAdd: friend_id });
		this.itemsService.addFriendToUser(user.sub, friend_id);
		return res.status(HttpStatus.OK).send('Friend added');
	}
	@Get('block/:id')
	async blockUser(
		@Param('id', ParseIntPipe) target_id: number,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.tokenManager.getUserFromToken(req);

		console.log({ UserToBlock: target_id });
		if (await this.itemsService.blockUser(user.sub, target_id))
			res.status(HttpStatus.ACCEPTED).send('User blocked');
		else res.status(HttpStatus.FORBIDDEN).send('Failed to block user');
	}

	@Get('unblock/:id')
	async unblockUser(
		@Param('id', ParseIntPipe) target_id: number,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.tokenManager.getUserFromToken(req);

		console.log({ UserToBlock: target_id });
		if (await this.itemsService.unblockUser(user.sub, target_id))
			res.status(HttpStatus.ACCEPTED).send('User unblocked');
		else res.status(HttpStatus.FORBIDDEN).send('Failed to unblock user');
	}

	@Get('friends')
	async getFriends(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req);
		const friends = await this.itemsService.getFriends(user.sub);
		if (friends) {
			const userFriends = friends.map((user) => plainToClass(AnyProfileUser, user));
			res.status(HttpStatus.OK).send(userFriends);
		} else res.status(HttpStatus.NOT_FOUND).send({ msg: 'No friends found' });
	}

	@Get('friendRequests')
	async getFriendRequests(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req);
		const receivedRequests = await this.itemsService.getFriendRequestsReceived(user.sub);
		const sentRequests = await this.itemsService.getFriendRequestsSent(user.sub);

		console.log(receivedRequests);
		res.status(HttpStatus.OK).send({ received: receivedRequests, sent: sentRequests });
	}

	@Get('getBlockedUsers')
	async getBlockedUsers(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req);
		const userEntity = await this.itemsService.getUser(user.sub);

		if (!userEntity) return res.status(HttpStatus.BAD_REQUEST).send('User not found');
		res.status(HttpStatus.OK).send(userEntity.blacklistEntry);
	}

	@Get(':username')
	async getUser(@Param('username') us: string, @Req() req: Request, @Res() res: Response) {
		const user = await this.itemsService.getUserByUsername(us);
		const info = {
			id: user.intra_id,
			login: user.username
		};
		if (user)
			res.status(HttpStatus.OK).send({
				msg: 'User connected',
				token: await this.authService.login(
					plainToClass(IntraInfo, info),
					user.user_id,
					''
				),
				user_id: user.user_id,
				username: user.username
			});
		else res.status(HttpStatus.NOT_FOUND).send({ msg: 'User not found' });
	}
}
