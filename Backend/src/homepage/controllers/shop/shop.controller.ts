import { Request, Response } from 'express';
import {
	Controller,
	Get,
	HttpStatus,
	Req,
	Res,
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

	@Get('availableItems')
	async getMissingSkins(@Req() req: Request, @Res() res: Response) {
		const user = this.tokenManager.getUserFromToken(req);
		const userEntity = await this.itemsService.getUser(user.sub);
		const skinsList = await this.itemsService.getSkins();

		if (!userEntity || !skinsList)
			return res.status(HttpStatus.NO_CONTENT).send({ msg: 'Content not found' });
		return res.status(HttpStatus.OK).send(skinsList.filter((skin) => !userEntity.skin.includes(skin)));
	}
}
