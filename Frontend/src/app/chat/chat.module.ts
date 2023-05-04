import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// NO DELETE ZONE
import { PongModule } from '../pong/pong.module';
import { MatchMakingModule } from '../match-making/match-making.module';
import { FriendsModule } from '../friends/friends.module';



@NgModule({
	declarations: [
		ChatComponent,
	],
	exports: [
		ChatComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		NgbModule,
	]
})
export class ChatModule { }
