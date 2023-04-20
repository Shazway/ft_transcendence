import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';



@NgModule({
	declarations: [
    AuthComponent,
  ],
  exports: [
    AuthComponent,
  ],
	imports: [
		CommonModule
	]
})
export class AuthModule { }
