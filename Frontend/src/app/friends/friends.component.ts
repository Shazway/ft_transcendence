import { Component, ElementRef } from '@angular/core';
import { FetchService } from '../fetch.service';
import { AnyProfileUser, FriendRequest } from 'src/dtos/User.dto';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmBlockPopup, ConfirmUnfriendPopup, PunishmentPopup } from '../popup-component/popup-component.component';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { NotificationRequest } from 'src/dtos/Notification.dto';
import { type } from 'jquery';
import { NotificationService } from '../notification.service';
import { boolean, compare } from 'mathjs';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent {
	user_id = localStorage.getItem("user_id");
	icone_list = {
		tick : "https://cdn.discordapp.com/attachments/1041104785870438521/1109161609621950464/Tick.png",
		cross : "https://cdn.discordapp.com/attachments/1041104785870438521/1109161609374474271/Cross.png",
		go_to_profile: "https://cdn.discordapp.com/attachments/1041104785870438521/1103760104278458468/user.png",
		go_to_messages: "https://cdn.discordapp.com/attachments/1041104785870438521/1103760105108930602/writing.png",
		remove_friend: "https://cdn.discordapp.com/attachments/1041104785870438521/1103760104559493130/unfriend.png",
		block_user: "https://cdn.discordapp.com/attachments/1041104785870438521/1103760104815349931/block.png"
	}

	friendsTabElm : any;
	requestsTabElm : any;
	blockedTabElm : any;
	sentTabElm : any;
	friendsElm : any;
	requestsElm : any;
	blockedElm : any;
	sentElm : any;

	public friends: AnyProfileUser[] = [];
	public friendshipRequests: {received: FriendRequest[], sent: FriendRequest[]} = {received: [], sent: []};
	public blockedUsers: AnyProfileUser[] = [];

	constructor(
		private elRef: ElementRef,
		private modalService: NgbModal,
		private fetchService: FetchService,
		private notifService: NotificationService,
		private router: Router,
		private parent: AppComponent,
	) {}

	async createPopup(title: string, label: string) {
		const modalRef = this.modalService.open(PunishmentPopup);
		modalRef.componentInstance.title = title;
		modalRef.componentInstance.label = label;
		return await modalRef.result;
	}
	
	async ngOnInit() {
		if (!this.parent.isConnected())
			this.router.navigateByUrl('login');
		this.blockedUsers = await this.fetchService.getBlockedUsers();
		this.blockedUsers.sort((a, b)=>{
			return (a.username.localeCompare(b.username));
		})
		this.friends = await this.fetchService.getFriends();
		this.friends.sort((a, b)=>{
			return (a.username.localeCompare(b.username));
		})
		this.friends.sort((a, b) => b.activity_status - a.activity_status);
		this.friendshipRequests = await this.fetchService.getFriendshipRequests();
	}
	
	async addSystemFriend() {
		await this.fetchService.addFriends(1);
		this.friends.splice(0);
		this.friends = await this.fetchService.getFriends();
	}

	goToProfile(user: AnyProfileUser)
	{
		this.router.navigateByUrl("profile?username=" + user.username);

	}

	goToMessages(user: AnyProfileUser)
	{

	}

	async unfriendPopup(user : AnyProfileUser) {
		const modalRef = this.modalService.open(ConfirmUnfriendPopup);
		modalRef.componentInstance.item = user;
		return await modalRef.result;
	}

	async removeFriend(user: AnyProfileUser)
	{
		const validate = await this.unfriendPopup(user);
		if (validate) {
			await this.fetchService.removeFriends(user.user_id);
			this.friends.splice(this.friends.indexOf(user), 1);
		}
	}

	async blockPopup(user : AnyProfileUser) {
		const modalRef = this.modalService.open(ConfirmBlockPopup);
		modalRef.componentInstance.item = user;
		return await modalRef.result;
	}

	async blockUser(user: AnyProfileUser)
	{
		const validate = await this.blockPopup(user);
		if (validate) {
			await this.fetchService.blockUser(user.user_id);
			this.friends.splice(this.friends.indexOf(user), 1);
			this.blockedUsers.push(user);
			this.blockedUsers.sort((a, b)=>{
				return (a.username.localeCompare(b.username));
			})
		}
	}

	async unblockUser(user: AnyProfileUser)
	{
		await this.fetchService.unblockUser(user.user_id);
		this.blockedUsers.splice(this.blockedUsers.indexOf(user), 1);		
	}

	async challenge(user: AnyProfileUser)
	{
		const test = await this.createPopup("Challenge", "friend");
	}

	async spectate(user: AnyProfileUser)
	{
		const test = await this.createPopup("Spectate", "friend");
	}

	friendRequestToNotificationRequest(friend : FriendRequest, bool : boolean) : NotificationRequest {
		return ({
			type : "friend",
			target_name : friend.sender.username,
			target_id : friend.sender.user_id,
			accepted : bool
		})

	}

	accept(request : FriendRequest)
	{
		this.friendshipRequests.received.splice(this.friendshipRequests.received.indexOf(request), 1);
		this.friends.push(request.sender);
		this.friends.sort((a, b)=>{
			return (a.username.localeCompare(b.username));
		})
		this.notifService.emit('inviteAnswer', this.friendRequestToNotificationRequest(request, true));
	}

	reject(request : FriendRequest)
	{
		this.friendshipRequests.received.splice(this.friendshipRequests.received.indexOf(request), 1);
		this.notifService.emit('inviteAnswer', this.friendRequestToNotificationRequest(request, false));
	}

	cancel(request : FriendRequest)
	{
		console.log("annuler la demande d'ami pour " + request.receiver.username)
	}

	switchToFriends() {
		this.friendsTabElm = this.elRef.nativeElement.querySelector("#friends-tab0");
		this.requestsTabElm = this.elRef.nativeElement.querySelector("#requests-tab0");
		this.blockedTabElm = this.elRef.nativeElement.querySelector("#blocked-tab0");
		this.sentTabElm = this.elRef.nativeElement.querySelector("#sent-tab0");
		this.friendsElm = this.elRef.nativeElement.querySelector("#friends0");
		this.requestsElm = this.elRef.nativeElement.querySelector("#requests0");
		this.blockedElm = this.elRef.nativeElement.querySelector("#blocked0");
		this.sentElm = this.elRef.nativeElement.querySelector("#sent0");
		this.friendsTabElm.classList.add('active');
		this.requestsTabElm.classList.remove('active');
		this.blockedTabElm.classList.remove('active');
		this.sentTabElm.classList.remove('active');

		this.friendsElm.classList.add('show');
		this.friendsElm.classList.add('active');
		this.requestsElm.classList.remove('show');
		this.requestsElm.classList.remove('active');
		this.blockedElm.classList.remove('show');
		this.blockedElm.classList.remove('active');
		this.sentElm.classList.remove('show');
		this.sentElm.classList.remove('active');
	}

	switchToRequests() {
		this.friendsTabElm = this.elRef.nativeElement.querySelector("#friends-tab0");
		this.requestsTabElm = this.elRef.nativeElement.querySelector("#requests-tab0");
		this.blockedTabElm = this.elRef.nativeElement.querySelector("#blocked-tab0");
		this.sentTabElm = this.elRef.nativeElement.querySelector("#sent-tab0");
		this.friendsElm = this.elRef.nativeElement.querySelector("#friends0");
		this.requestsElm = this.elRef.nativeElement.querySelector("#requests0");
		this.blockedElm = this.elRef.nativeElement.querySelector("#blocked0");
		this.sentElm = this.elRef.nativeElement.querySelector("#sent0");
		this.friendsTabElm.classList.remove('active');
		this.requestsTabElm.classList.add('active');
		this.blockedTabElm.classList.remove('active');
		this.sentTabElm.classList.remove('active');

		this.friendsElm.classList.remove('show');
		this.friendsElm.classList.remove('active');
		this.requestsElm.classList.add('show');
		this.requestsElm.classList.add('active');
		this.blockedElm.classList.remove('show');
		this.blockedElm.classList.remove('active');
		this.sentElm.classList.remove('show');
		this.sentElm.classList.remove('active');
	}

	switchToBlocked() {
		this.friendsTabElm = this.elRef.nativeElement.querySelector("#friends-tab0");
		this.requestsTabElm = this.elRef.nativeElement.querySelector("#requests-tab0");
		this.blockedTabElm = this.elRef.nativeElement.querySelector("#blocked-tab0");
		this.sentTabElm = this.elRef.nativeElement.querySelector("#sent-tab0");
		this.friendsElm = this.elRef.nativeElement.querySelector("#friends0");
		this.requestsElm = this.elRef.nativeElement.querySelector("#requests0");
		this.blockedElm = this.elRef.nativeElement.querySelector("#blocked0");
		this.sentElm = this.elRef.nativeElement.querySelector("#sent0");
		this.friendsTabElm.classList.remove('active');
		this.requestsTabElm.classList.remove('active');
		this.blockedTabElm.classList.add('active');
		this.sentTabElm.classList.remove('active');

		this.friendsElm.classList.remove('show');
		this.friendsElm.classList.remove('active');
		this.requestsElm.classList.remove('show');
		this.requestsElm.classList.remove('active');
		this.blockedElm.classList.add('show');
		this.blockedElm.classList.add('active');
		this.sentElm.classList.remove('show');
		this.sentElm.classList.remove('active');
	}

	switchToSent() {
		this.friendsTabElm = this.elRef.nativeElement.querySelector("#friends-tab0");
		this.requestsTabElm = this.elRef.nativeElement.querySelector("#requests-tab0");
		this.blockedTabElm = this.elRef.nativeElement.querySelector("#blocked-tab0");
		this.sentTabElm = this.elRef.nativeElement.querySelector("#sent-tab0");
		this.friendsElm = this.elRef.nativeElement.querySelector("#friends0");
		this.requestsElm = this.elRef.nativeElement.querySelector("#requests0");
		this.blockedElm = this.elRef.nativeElement.querySelector("#blocked0");
		this.sentElm = this.elRef.nativeElement.querySelector("#sent0");
		this.friendsTabElm.classList.remove('active');
		this.requestsTabElm.classList.remove('active');
		this.blockedTabElm.classList.remove('active');
		this.sentTabElm.classList.add('active');

		this.friendsElm.classList.remove('show');
		this.friendsElm.classList.remove('active');
		this.requestsElm.classList.remove('show');
		this.requestsElm.classList.remove('active');
		this.blockedElm.classList.remove('show');
		this.blockedElm.classList.remove('active');
		this.sentElm.classList.add('show');
		this.sentElm.classList.add('active');
	}
}
