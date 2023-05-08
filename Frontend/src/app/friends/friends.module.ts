import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsComponent } from './friends.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';



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
	]
})
export class FriendsModule { }
