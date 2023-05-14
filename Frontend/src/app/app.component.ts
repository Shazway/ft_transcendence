import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { AutoClose, Placement, PopoverConfig, Target } from '../dtos/Popover.dto';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from './notification.service';
import { NotificationResponse } from 'src/dtos/Notification.dto';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NgbPopover],
})
export class AppComponent implements AfterViewInit {
	@ViewChild('popoverContent') profileTemplate!: TemplateRef<any>;
	@ViewChild('chatInteractionTemplate') chatInteractionTemplate!: TemplateRef<any>;
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

	openPopover(popoverTemplate: string | TemplateRef<any>, config: PopoverConfig) {
		if (typeof popoverTemplate === 'string') {
			if (popoverTemplate == "profile") this.popover.ngbPopover = this.profileTemplate;
			else return;
		}
		else this.popover.ngbPopover = popoverTemplate;
		this.popover.placement = config.placement;
		this.popover.autoClose = config.autoClose;
		this.popover.popoverClass = config.classId;
		this.popover.popoverTitle = config.title;
		this.popover.positionTarget = config.positionTarget;
		this.popover.open({ data: config.data });
	}

	showFriendReq(notif : {notification: NotificationResponse}) {
		console.log(notif);
		this.notifService.showFriendRequest(notif.notification);
	}

	showAchievements() {
		this.notifService.showAchievements();
	}

	showChallenge() {
		this.notifService.showChallenge();
	}

	notifDismiss(toast: any) {
		this.notifService.notifDismiss(toast);
	}
}
