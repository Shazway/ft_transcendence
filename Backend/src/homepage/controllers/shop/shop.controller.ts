import { Request, Response } from 'express';
import {
	Controller,
	Get,
	HttpStatus,
	Req,
	Res,
	Param,
} from '@nestjs/common';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { plainToClass } from 'class-transformer';
import { AvailableSkins } from 'src/homepage/dtos/User.dto';

@Controller('shop')
export class ShopController {

	constructor(
		private itemsService: ItemsService,
		private tokenManager: TokenManagerService,
		) {}

	//Make a function in services to fetch availableskins (shorter in the request)
	@Get('availableItems')
	async getMissingSkins(@Req() req: Request, @Res() res: Response) {
		const user = this.tokenManager.getUserFromToken(req);
		const userEntity = await this.itemsService.getUser(user.sub);
		const skinsList = await this.itemsService.getSkins();

		if (!userEntity || !skinsList)
			return res.status(HttpStatus.NO_CONTENT).send({ msg: 'Content not found' });
		return res.status(HttpStatus.OK).send(skinsList.filter((skin) => !userEntity.skin.includes(skin)));
	}

	@Get('buy/:id')
	async buySkin(@Param('id') skinId: string, @Req() req: Request, @Res() res: Response) {
		const user = this.tokenManager.getUserFromToken(req);
		const userEntity = await this.itemsService.getUser(user.sub);
		const skinsList = await this.itemsService.getSkins();
		const skin = skinsList.find((skin) => skin.skin_id == Number(skinId));

		if (!userEntity || !skinsList || !skin)
			return res.status(HttpStatus.NO_CONTENT).send({ msg: 'Content not found' });
		const newUser = (await this.itemsService.buyItem(user.sub, skin))
		if (!newUser)
			return res.status(HttpStatus.UNAUTHORIZED).send('Not enough currency');
		return res.status(HttpStatus.OK).send({newBalance: newUser.currency, availableSkins: skinsList.filter((skin) => !newUser.skin.includes(skin))});
	}
}
