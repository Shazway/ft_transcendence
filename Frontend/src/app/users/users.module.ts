import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';



@NgModule({
  declarations: [
	UsersComponent,
  ],
  exports: [
	UsersComponent,
  ],
  imports: [
    CommonModule
  ]
})
export class UsersModule { }
