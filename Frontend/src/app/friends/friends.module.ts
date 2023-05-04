import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsComponent } from './friends.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ChatModule } from '../chat/chat.module';



@NgModule({
	declarations: [
		FriendsComponent
	],
	exports: [
		FriendsComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		NgbModule,
		ChatModule,
	]
})
export class FriendsModule { }
