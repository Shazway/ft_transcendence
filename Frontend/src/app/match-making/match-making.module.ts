import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchMakingComponent } from './match-making.component';



@NgModule({
  declarations: [
    MatchMakingComponent,
  ],
  exports: [
    MatchMakingComponent,
  ],
  imports: [
    CommonModule,
  ]
})
export class MatchMakingModule { }
