import { Component, ElementRef } from '@angular/core';
import { FetchService } from '../fetch.service';
import { AnyProfileUser, FriendRequest } from 'src/dtos/User.dto';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PunishmentPopup } from '../popup-component/popup-component.component';

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

	public friends!: AnyProfileUser[];
	public friendshipRequests: {received: FriendRequest[], sent: FriendRequest[]} = {received: [], sent: []};
	constructor(
		private elRef: ElementRef,
		private modalService: NgbModal,
		private fetchService: FetchService
	) {}

	async createPopup(title: string, label: string) {
		const modalRef = this.modalService.open(PunishmentPopup);
		modalRef.componentInstance.title = title;
		modalRef.componentInstance.label = label;
		return await modalRef.result;
	}
	
	async ngOnInit() {
		this.friends = await this.fetchService.getFriends();
		this.friendshipRequests = await this.fetchService.getFriendshipRequests();
		console.log(this.friendshipRequests.received);
	}
	
	async addSystemFriend() {
		await this.fetchService.addFriends(1);
		this.friends.splice(0);
		this.friends = await this.fetchService.getFriends();
		console.log(this.friends);
	}

	async onClickFriend(friend: AnyProfileUser)
	{
		const goToProfileElm = this.elRef.nativeElement.querySelector("#img-" + friend.user_id + "-profile");
		const goToMessagesElm = this.elRef.nativeElement.querySelector("#img-" + friend.user_id + "-message");
		const removeFriendElm = this.elRef.nativeElement.querySelector('#img-' + friend.user_id + '-unfriend');
		const blockUserElm = this.elRef.nativeElement.querySelector('#img-' + friend.user_id + '-block');

		if (goToProfileElm.classList.contains('show')) {
			goToProfileElm.classList.remove('show');
			goToProfileElm.removeAttribute('title');
			goToMessagesElm.classList.remove('show');
			goToMessagesElm.removeAttribute('title');
			removeFriendElm.classList.remove('show');
			removeFriendElm.removeAttribute('title');
			blockUserElm.classList.remove('show');
			blockUserElm.removeAttribute('title');
		}
		else {
			goToProfileElm.classList.add('show');
			goToProfileElm.setAttribute('title', 'Profile');
			goToMessagesElm.classList.add('show');
			goToMessagesElm.setAttribute('title', 'Message');
			removeFriendElm.classList.add('show');
			removeFriendElm.setAttribute('title', 'Unfriend');
			blockUserElm.classList.add('show');
			blockUserElm.setAttribute('title', 'Block');
		}
	}

	goToProfile(friend: AnyProfileUser)
	{
		return("http://localhost/profile/" + friend.user_id);
	}

	goToMessages(friend: AnyProfileUser)
	{

	}

	removeFriend(friend: AnyProfileUser)
	{

		//add a pop-up to confirm
	}

	async blockUser(block: AnyProfileUser)
	{
		await this.fetchService.blockUser(block.user_id);
		//add a pop-up to confirm
		console.log("bloque " + block.username);
		
	}

	async challenge(friend: AnyProfileUser)
	{
		const test = await this.createPopup("Challenge", "friend");
	}

	async spectate(friend: AnyProfileUser)
	{
		const test = await this.createPopup("Spectate", "friend");
	}

	accept(request : FriendRequest)
	{
		console.log("demande acceptee");
		this.friendshipRequests.received.splice(this.friendshipRequests.received.indexOf(request), 1);
	}

	reject(request : FriendRequest)
	{
		console.log("demande rejetee");
		this.friendshipRequests.received.splice(this.friendshipRequests.received.indexOf(request), 1);

	}
}
