import { Request, Response } from 'express';
import { Controller, Get, HttpStatus, Req, Res, Param } from '@nestjs/common';
import { ItemsService } from 'src/homepage/services/items/items.service';
import { TokenManagerService } from 'src/homepage/services/token-manager/token-manager.service';
import { NotificationsGateway } from 'src/homepage/gateway/notifications/notifications.gateway';

@Controller('shop')
export class ShopController {
	constructor(private itemsService: ItemsService,
				private tokenManager: TokenManagerService,
				private notifGateway: NotificationsGateway) {}

	@Get('availableItems')
	async getMissingSkins(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const skinsList = await this.itemsService.getAvailableSkins(user.sub);
		if (!skinsList) return res.status(HttpStatus.OK).send({ msg: 'Content not found' });
		return res.status(HttpStatus.OK).send({ availableSkins: skinsList });
	}

	@Get('buy/:id')
	async buySkin(@Param('id') skinId: string, @Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;

		if (!(await this.itemsService.buySkin(user.sub, Number(skinId), this.notifGateway)))
			return res.status(HttpStatus.BAD_REQUEST).send('Refused');
		const skinsList = await this.itemsService.getAvailableSkins(user.sub);
		const userEntity = await this.itemsService.getUser(user.sub);
		return res
			.status(HttpStatus.ACCEPTED)
			.send({ newBalance: userEntity.currency, availableSkins: skinsList });
	}

	@Get('allUserSkins')
	async getCurrentSkins(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const userEntity = await this.itemsService.getUser(user.sub);
		if (!userEntity)
			return res.status(HttpStatus.OK).send({ msg: 'Content not found' });
		return res.status(HttpStatus.OK).send({ skins: userEntity.skin });
	}

	@Get('all')
	async getSkins(@Req() req: Request, @Res() res: Response) {
		const user = await this.tokenManager.getUserFromToken(req, 'Http', res);
		if (!user) return;
		const skinsList = await this.itemsService.getSkins();
		if (!skinsList) return res.status(HttpStatus.OK).send({ msg: 'Content not found' });
		return res.status(HttpStatus.OK).send({ skins: skinsList });
	}
}
