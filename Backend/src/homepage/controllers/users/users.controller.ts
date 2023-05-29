/* eslint-disable prettier/prettier */
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

	@Post('changeName')
	async changeUsername(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: { username: string }
	) {
		const currentUser = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!currentUser) return;
		if (!body || !body.username || body.username.length > 20)
			return res.status(HttpStatus.UNAUTHORIZED).send('Name too long');
		const checkUser = await this.itemsService.getUserByUsername(body.username);

		if (checkUser && checkUser.user_id == currentUser.sub)
			return res.status(HttpStatus.NOT_MODIFIED).send('Username taken');
		if (checkUser && checkUser.user_id != currentUser.sub)
			return res
				.status(HttpStatus.UNAUTHORIZED)
				.send('Trying to change someone elses username ?');
		this.usersService.changeUserName(body.username, currentUser.sub);
		return res.status(HttpStatus.ACCEPTED).send('Username changed');
	}

	@Post('userBySubstring')
	async getUsersFromPrefix(@Req() req: Request, @Res() res: Response, @Body() body: { substring: string })
	{
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !body.substring || body.substring.length > 20)
			return res.status(HttpStatus.UNAUTHORIZED).send(null);
		const prefixedUsers = await this.itemsService.getUsersBySubstring(body.substring);
		res.status(HttpStatus.OK).send(prefixedUsers);
	}

	@Post('changeImg')
	async changeImg(@Req() req: Request, @Res() res: Response, @Body() body: { img_url: string }) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body) return res.status(HttpStatus.BAD_REQUEST).send('Error no body');
		if (await this.itemsService.changeImgUser(user.sub, body.img_url))
			return res.status(HttpStatus.ACCEPTED).send('Change img_url');
		return res.status(HttpStatus.NOT_MODIFIED);
	}

	@Post('changeChannelInviteAuth')
	async changeChanInvAuth(@Req() req: Request, @Res() res: Response, @Body() body: { newSetting: number }) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body || !body.newSetting) return res.status(HttpStatus.UNAUTHORIZED).send('No body or parameters provided');
		const userEntity = await this.itemsService.getUser(user.sub);
		const newSetting = body.newSetting;

		if (!userEntity || newSetting < 0 || newSetting > 2)
			return res.status(HttpStatus.UNAUTHORIZED).send('Not saved');
		userEntity.channelInviteAuth = newSetting;
		if (await this.itemsService.saveUserState(userEntity))
			return res.status(HttpStatus.OK).send('Success');
		return res.status(HttpStatus.UNAUTHORIZED).send('Not saved');
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

	@Get('block/:id')
	async blockUser(
		@Param('id', ParseIntPipe) target_id: number,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;

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
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;

		console.log({ UserToBlock: target_id });
		if (await this.itemsService.unblockUser(user.sub, target_id))
			res.status(HttpStatus.ACCEPTED).send('User unblocked');
		else res.status(HttpStatus.FORBIDDEN).send('Failed to unblock user');
	}

	@Get('friends')
	async getFriends(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const friends = await this.itemsService.getFriends(user.sub);
		let userFriends = new Array<AnyProfileUser>;
		if (friends)
			userFriends = friends.map((user) => plainToClass(AnyProfileUser, user));
		res.status(HttpStatus.OK).send(userFriends);
	}

	@Get('friendRequests')
	async getFriendRequests(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const receivedRequests = await this.itemsService.getFriendRequestsReceived(user.sub);
		const sentRequests = await this.itemsService.getFriendRequestsSent(user.sub);

		console.log(receivedRequests);
		res.status(HttpStatus.OK).send({ received: receivedRequests, sent: sentRequests });
	}

	@Get('removeFriendRequest/:id')
	async removeFriendRequest(@Param('id', ParseIntPipe) target_id: number, @Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!target_id)
			return res.status(HttpStatus.UNAUTHORIZED).send('No id given')
		if (!(await this.itemsService.deleteFriendRequest(target_id, user.sub)))
			return res.status(HttpStatus.UNAUTHORIZED).send('Something went wrong');
		res.status(HttpStatus.OK).send('Success');
	}

	@Get('getBlockedUsers')
	async getBlockedUsers(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const userEntity = await this.itemsService.getUser(user.sub);

		if (!userEntity) return res.status(HttpStatus.BAD_REQUEST).send('User not found');
		console.log(userEntity.blacklistEntry);
		res.status(HttpStatus.OK).send(userEntity.blacklistEntry);
	}

	@Get('removeFriend/:id')
	async removeFriend(
		@Param('id', ParseIntPipe) target_id: number,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;

		if (!(await this.itemsService.removeFriend(user.sub, target_id)))
			return res.status(HttpStatus.NOT_FOUND).send('Error');
		res.status(HttpStatus.ACCEPTED).send('User removed');
	}

	@Post('addToChannel')
	async addUserToChannel(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: { channel_id: number; target_id: number }
	) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		if (!body) return res.status(HttpStatus.BAD_REQUEST).send('Error no body');
		if (await this.channelService.addUserToChannel(user.sub, body.channel_id, body.target_id))
			return res.status(HttpStatus.BAD_REQUEST).send('Error adding this person to channel');
		res.status(HttpStatus.ACCEPTED).send('Success');
	}

	@Get('ongoingMatch/:id')
	async getOngoingMatch(
		@Param('id', ParseIntPipe) target_id: number,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const match = await this.itemsService.getCurrentMatch(target_id);
		if (!match) return res.status(HttpStatus.NOT_FOUND).send('Match not found');
		return res.status(HttpStatus.OK).send(match.match_id);
	}

	@Get(':username')
	async getUser(@Param('username') us: string, @Req() req: Request, @Res() res: Response) {
		const user = await this.itemsService.getUserByUsername(us);
		if (!user)
			return res.status(HttpStatus.BAD_REQUEST).send('CE USER EXISTE PAS :)');
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
