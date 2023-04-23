import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { FormsModule } from '@angular/forms';
import { MatchMakingModule } from '../match-making/match-making.module';



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
	]
})
export class ChatModule { }
