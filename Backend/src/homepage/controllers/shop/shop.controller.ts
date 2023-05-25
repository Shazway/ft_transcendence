import { Request, Response } from 'express';
import { Controller, Get, HttpStatus, Req, Res, Param } from '@nestjs/common';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';

@Controller('shop')
export class ShopController {
	constructor(private itemsService: ItemsService, private tokenManager: TokenManagerService) {}

	@Get('availableItems')
	async getMissingSkins(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const skinsList = await this.itemsService.getAvailableSkins(user.sub);
		console.log(skinsList);
		if (!skinsList) return res.status(HttpStatus.NO_CONTENT).send({ msg: 'Content not found' });
		return res.status(HttpStatus.OK).send({ availableSkins: skinsList });
	}

	@Get('buy/:id')
	async buySkin(@Param('id') skinId: string, @Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;

		if (!(await this.itemsService.buySkin(user.sub, Number(skinId))))
			return res.status(HttpStatus.BAD_REQUEST).send('Refused');
		const skinsList = await this.itemsService.getAvailableSkins(user.sub);
		const userEntity = await this.itemsService.getUser(user.sub);
		return res
			.status(HttpStatus.ACCEPTED)
			.send({ newBalance: userEntity.currency, availableSkins: skinsList });
	}
}
