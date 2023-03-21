import { Controller, Get, HttpStatus, Param, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../../services/users/users.service';

@Controller('profile')
export class ProfileController {
	constructor (private usersService: UsersService) {}
	@Get(':username')
	getUser(@Param('username') us: string, @Req() req: Request, res: Response) {
		const user = this.usersService.findUser(us);
		// Developper ce qu'on veut renvoyer comme info au frontend tel que /!\ //
		// Comme photo de profil, infos à display etc.. //
		if (user)
		res.send(us);
		else
			res.status(HttpStatus.ACCEPTED).send({msg: 'No user with this name.'});
	}
}
