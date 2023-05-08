import { AfterViewInit, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
