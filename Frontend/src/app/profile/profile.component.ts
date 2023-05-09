import { Component, ElementRef, ViewChild } from '@angular/core';
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