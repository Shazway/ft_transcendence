import { AfterViewInit, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShopItem } from 'src/dtos/ShopItem.dto';

@Component({
	selector: 'chat-popup',
	templateUrl: './chat-popup.html',
})
export class ChatPopup {
	@Input() title = "string";
	@Input() label = "input";

	constructor(public activeModal: NgbActiveModal) {}

	onSubmit(pun: any) {
		this.activeModal.close(pun);
	}
}

@Component({
	selector: 'punishement-popup',
	templateUrl: './punishement-popup.html',
})
export class PunishmentPopup {
	@Input() title = "string";
	@Input() label = "input";

	constructor(public activeModal: NgbActiveModal) {}

	onSubmit(pun: any) {
		this.activeModal.close(pun);
	}
}

@Component({
	selector: 'confirmBuy-popup',
	templateUrl: './confirmBuy-popup.html',
})
export class ConfirmBuyPopup {
	@Input() item : ShopItem;

	constructor(public activeModal: NgbActiveModal) {
		this.item = {skin_id : -1, name : "", description : "", type : "", price : -1, img_url : ""};
	}

	onSubmit(bool: boolean) {
		this.activeModal.close(bool);
	}
}