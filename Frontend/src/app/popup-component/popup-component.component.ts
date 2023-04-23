import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-my-popup',
	templateUrl: './popup-component.component.html',
})
export class PunishmentPopup {
  @Input() title = "string";
  @Input() label = "input";

  constructor(public activeModal: NgbActiveModal) {}

  onSubmit(pun: any) {
    this.activeModal.close(pun);
  }
}
