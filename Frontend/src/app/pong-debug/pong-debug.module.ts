import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PongDebugComponent } from './pong-debug.component';
import { AssetManager } from 'src/dtos/GraphElem.dto';



@NgModule({
  declarations: [
    PongDebugComponent
  ],
  imports: [
    CommonModule,
  ]
})
export class PongDebugModule { }
