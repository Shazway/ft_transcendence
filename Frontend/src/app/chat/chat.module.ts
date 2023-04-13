import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { FormsModule } from '@angular/forms';



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
