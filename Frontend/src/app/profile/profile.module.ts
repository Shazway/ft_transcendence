import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ProfileComponent,
  ],
  exports: [
	ProfileComponent,
  ],
  imports: [
    CommonModule,
	NgbModule,
	FormsModule,
	BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [ProfileComponent],
})
export class ProfileModule { }
