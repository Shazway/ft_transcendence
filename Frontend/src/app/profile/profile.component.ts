import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { NgbPopover, NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../app.component';
import { PopoverConfig } from 'src/dtos/Popover.dto';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
	@ViewChild('customId') target!: ElementRef;

	constructor(
		private parent: AppComponent,
	) {}

	showPopover() {
		this.parent.openPopover('profile', new PopoverConfig(
			this.target.nativeElement,
			'profile',
			'outside',
		));
	}
}