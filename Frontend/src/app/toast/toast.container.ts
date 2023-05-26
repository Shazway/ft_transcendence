import { Component, TemplateRef } from '@angular/core';

import { ToastService } from './toast.service';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-toasts',
	standalone: true,
	imports: [NgbToastModule, NgIf, NgTemplateOutlet, NgFor],
	templateUrl: './toast.container.html',
	host: { class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastsContainer {
	constructor(public toastService: ToastService) {

		console.log("constructeur de toast");
	}

	isTemplate(toast: { textOrTpl: any; }) {
		return toast.textOrTpl instanceof TemplateRef;
	}
}
