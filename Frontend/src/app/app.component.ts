import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { AutoClose, Placement, PopoverConfig, Target } from '../dtos/Popover.dto';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from './notification.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NgbPopover],
})
export class AppComponent implements AfterViewInit {
	@ViewChild('popoverContent') profileTemplate!: TemplateRef<any>;
	@ViewChild('toastFriendRequest') toastFriendRequest!: TemplateRef<any>;
	@ViewChild('toastChallenge') toastChallenge!: TemplateRef<any>;
	@ViewChild('toastAchievement') toastAchievement!: TemplateRef<any>;
	title = 'Frontend';
	isExpanded = false;

	constructor(
		private elRef: ElementRef,
		private popover: NgbPopover,
		private notifService: NotificationService,
	){}

	ngAfterViewInit(): void {
		this.notifService.initTemplates(this.toastFriendRequest, this.toastChallenge, this.toastAchievement)
	}

	isConnected() {
		return localStorage.getItem('Jwt_token') ? true : false;
	}

	togglePlay() {
		const offscreenElm = this.elRef.nativeElement.querySelector('#play');
		if (!offscreenElm)
			return;
		if (offscreenElm.classList.contains('show')) {
			offscreenElm.classList.remove('show');
		} else {
			offscreenElm.classList.add('show');
		}
	}

	openPopover(popoverTemplate: string, config: PopoverConfig) {
		if (popoverTemplate == "profile") this.popover.ngbPopover = this.profileTemplate;
		else return;
		this.popover.placement = config.placement;
		this.popover.autoClose = config.autoClose;
		this.popover.popoverClass = config.classId;
		this.popover.popoverTitle = config.title;
		this.popover.positionTarget = config.positionTarget;
		this.popover.open({ data: config.data });
	}

	showFriendReq() {
		this.notifService.showFriendRequest();
	}

	notifDismiss(toast: any) {
		this.notifService.notifDismiss(toast);
	}
}
