import { AfterViewInit, Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShopItem } from 'src/dtos/ShopItem.dto';
import { AnyProfileUser } from 'src/dtos/User.dto';

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
	selector: 'confirm-popup',
	templateUrl: './confirm-popup.html',
})
export class ConfirmPopup {
	@Input() title = "string";
	@Input() label = "input";

	constructor(public activeModal: NgbActiveModal) {}

	onSubmit(pun: any) {
		this.activeModal.close(pun);
	}
}

@Component({
	selector: 'password-popup',
	templateUrl: './password-popup.html',
})
export class PasswordPopup {
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

@Component({
	selector: 'confirmUnfriend-popup',
	templateUrl: './confirmUnfriend-popup.html',
})
export class ConfirmUnfriendPopup {
	@Input() user!: AnyProfileUser;

	constructor(public activeModal: NgbActiveModal) {
	}

	onSubmit(bool: boolean) {
		this.activeModal.close(bool);
	}
}

@Component({
	selector: 'confirmBlock-popup',
	templateUrl: './confirmBlock-popup.html',
})
export class ConfirmBlockPopup {
	@Input() user! : AnyProfileUser;

	constructor(public activeModal: NgbActiveModal) {
	}

	onSubmit(bool: boolean) {
		this.activeModal.close(bool);
	}
}

@Component({
	selector: 'changeAvatar-popup',
	templateUrl: './changeAvatar-popup.html',
})
export class ChangeAvatarPopup {
	@Input() user! : AnyProfileUser;

	constructor(
		public activeModal: NgbActiveModal,
		private elRef: ElementRef,
		) {
	}

	onSubmit(new_img: string) {
		this.activeModal.close(new_img);
	}


	inputFormElm : any;

	inputCheckList = {
		tooLong : true,
		tooShort : true,
		other : true
	};
	async checkInput(input: string) {
		if (!this.inputFormElm)
			this.inputFormElm = this.elRef.nativeElement.querySelector('#inputForm');

		if (input.length > 350)
			this.inputCheckList.tooLong = false;
		else
			this.inputCheckList.tooLong = true;

		if (this.inputCheckList.tooLong &&
			this.inputCheckList.tooShort &&
			this.inputCheckList.other)
		{
			if (this.inputFormElm.classList.contains('wrong-input'))
				this.inputFormElm.classList.remove('wrong-input');
			return (true);
			//input valide
		}
		else
		{
			if (!this.inputFormElm.classList.contains('wrong-input'))
				this.inputFormElm.classList.add('wrong-input');
			return (false)
			//input invalide

		}
	}

}
