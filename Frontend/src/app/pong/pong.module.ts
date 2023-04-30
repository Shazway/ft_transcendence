import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PongComponent } from './pong.component';
import { ChatModule } from '../chat/chat.module';



@NgModule({
	declarations: [
		PongComponent
	],
	exports: [
		PongComponent,
	],
	imports: [
		CommonModule,
		ChatModule,
	]
})
export class PongModule { }
