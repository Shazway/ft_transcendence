import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { AutoClose, Placement, PopoverConfig, Target } from '../dtos/Popover.dto';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from './notification.service';
import { NotificationRequest, NotificationResponse } from 'src/dtos/Notification.dto';
import { MyProfileUser } from 'src/dtos/User.dto';
import { FetchService } from './fetch.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NgbPopover],
  animations: [
	trigger('currencyFadeIn', [
		transition(':enter', [style({ opacity: '0' }), animate('300ms ease-out', style({ opacity: '1' }))]),
	])
  ],
})
export class AppComponent implements AfterViewInit {
	@ViewChild('popoverContent') profileTemplate!: TemplateRef<any>;
	@ViewChild('chatInteractionTemplate') chatInteractionTemplate!: TemplateRef<any>;
	@ViewChild('toastFriendRequest') toastFriendRequest!: TemplateRef<any>;
	@ViewChild('toastNewFriend') toastNewFriend!: TemplateRef<any>;
	@ViewChild('toastChallenge') toastChallenge!: TemplateRef<any>;
	@ViewChild('toastAchievement') toastAchievement!: TemplateRef<any>;
	@ViewChild('toastFailure') toastFailure!: TemplateRef<any>;
	@ViewChild('toastSuccess') toastSuccess!: TemplateRef<any>;
	@ViewChild('toastChannel') toastChannel!: TemplateRef<any>;
	title = 'Frontend';
	isExpanded = false;
	myProfile? : MyProfileUser | null;

	constructor(
		private elRef: ElementRef,
		private popover: NgbPopover,
		private notifService: NotificationService,
		private fetchService: FetchService,
	){
	}

	async ngOnInit() {
		if (this.isConnected())
			this.myProfile = await this.fetchService.getMyProfile();
	}

	ngAfterViewInit(): void {
		this.notifService.initTemplates(
			this.toastFriendRequest,
			this.toastNewFriend,
			this.toastChallenge,
			this.toastAchievement,
			this.toastFailure,
			this.toastSuccess,
			this.toastChannel)
	}

	disconnect() {
		localStorage.clear();
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

	updateThunes(newThunes: number)
	{
		if (this.myProfile)
			this.myProfile.currency = newThunes;
	}

	openPopover(popoverTemplate: string | TemplateRef<any>, config: PopoverConfig) {
		if (typeof popoverTemplate === 'string') {
			if (popoverTemplate == "profile")
			{
				this.popover.ngbPopover = this.profileTemplate;
			}
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

	openDropdown() {
		const dropDownElm = this.elRef.nativeElement.querySelector('.dropdown-menu');
		if(!dropDownElm)
			return;
		if (dropDownElm.classList.contains('show'))
			dropDownElm.classList.remove('show');
		else
			dropDownElm.classList.add('show');
	}

	notifDismiss(toast: any) {
		this.notifService.notifDismiss(toast);
	}

	getAvatar()
	{
		return localStorage.getItem('img_url');
	}

	getUsername()
	{
		return localStorage.getItem('username');
	}

	getBalance()
	{
		if (this.myProfile)
			return (this.myProfile.currency);
		return (1);
	}


	acceptFriendRequest(context : NotificationRequest, toast: any) {
		context.accepted = true;
		this.notifService.emit('inviteAnswer', context);
		console.log(context);
		this.notifDismiss(toast);
	}

	rejectFriendRequest(context : NotificationRequest, toast: any) {
		context.accepted = false;
		this.notifService.emit('inviteAnswer', context);
		console.log(context);

		this.notifDismiss(toast);
	}

	acceptChallenge(context : NotificationRequest, toast: any) {
		context.accepted = true;
		this.notifService.emit('challengeAnswer', context);
		console.log(context);
		this.notifDismiss(toast);
	}

	rejectChallenge(context : NotificationRequest, toast: any) {
		context.accepted = false;
		this.notifService.emit('challengeAnswer', context);
		console.log(context);

		this.notifDismiss(toast);
	}

}
