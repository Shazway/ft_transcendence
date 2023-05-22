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
		const skinsList = await this.itemsService.getAvailableSkins(user.sub);

		console.log('Testavailable');
		if (!skinsList)
			return res.status(HttpStatus.NO_CONTENT).send({ msg: 'Content not found' });
		console.log({AvailableSkins: skinsList})
		return res.status(HttpStatus.OK).send({availableSkins: skinsList});
	}
	
	@Get('buy/:id')
	async buySkin(@Param('id') skinId: string, @Req() req: Request, @Res() res: Response) {
		const user = this.tokenManager.getUserFromToken(req);
		
		console.log('Testbuy');
		if (!(await this.itemsService.buySkin(user.sub, Number(skinId))))
			return res.status(HttpStatus.BAD_REQUEST).send('Refused');
		const skinsList = await this.itemsService.getAvailableSkins(user.sub);
		console.log({AvailableSkins: skinsList})
		return res.status(HttpStatus.ACCEPTED).send({availableSkins: skinsList});
	}
}
