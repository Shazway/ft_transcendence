import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchMakingComponent } from './match-making.component';
import { ChatComponent } from '../chat/chat.component';
import { ChatModule } from '../chat/chat.module';



@NgModule({
  declarations: [
    MatchMakingComponent,
		ChatComponent,
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
