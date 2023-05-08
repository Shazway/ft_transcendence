import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PongComponent } from './pong.component';



@NgModule({
	declarations: [
		PongComponent
	],
	exports: [
		PongComponent,
	],
	imports: [
		CommonModule,
	]
})
export class PongModule { }
