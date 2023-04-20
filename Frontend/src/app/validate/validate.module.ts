import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidateComponent } from './validate.component';
import { FormsModule } from '@angular/forms';



@NgModule({
	declarations: [
    ValidateComponent,
  ],
  exports: [
    ValidateComponent,
  ],
	imports: [
		CommonModule,
		FormsModule,
	]
})
export class ValidateModule { }
