import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



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
	BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [ProfileComponent],
})
export class ProfileModule { }
