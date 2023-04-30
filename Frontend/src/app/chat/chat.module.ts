import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { FormsModule } from '@angular/forms';
import { PongModule } from '../pong/pong.module';
import { MatchMakingModule } from '../match-making/match-making.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



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
