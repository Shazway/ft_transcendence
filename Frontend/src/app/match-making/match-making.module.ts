import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchMakingComponent } from './match-making.component';
import { ChatModule } from '../chat/chat.module';



@NgModule({
  declarations: [
    MatchMakingComponent,
  ],
  exports: [
    MatchMakingComponent,
  ],
  imports: [
    CommonModule,
    ChatModule,
  ]
})
export class MatchMakingModule { }
