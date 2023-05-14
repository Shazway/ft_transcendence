import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { UsersModule } from './users/users.module';
import { LoginModule } from './login/login.module';
import { FormsModule } from '@angular/forms';
import { FetchService } from './fetch.service';
import { ChatModule } from './chat/chat.module';
import { WebsocketService } from './websocket.service';
import { AuthModule } from './auth/auth.module';
import { ValidateModule } from './validate/validate.module';
import { MatchMakingComponent } from './match-making/match-making.component';
import { ChatPopup, PunishmentPopup } from './popup-component/popup-component.component';
import { NotificationService } from './notification.service';
import { ProfileModule } from './profile/profile.module';
import { ProfilePopupModule } from './profile-popup/profile-popup.module';
import { ToastComponent } from './toast/toast.component';
import { ToastsContainer } from './toast/toast.container';
import { ShopComponent } from './shop/shop.component';

@NgModule({
  declarations: [
    AppComponent,
    PunishmentPopup,
    ChatPopup,
    ShopComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    UsersModule,
    LoginModule,
    ChatModule,
	FormsModule,
    AuthModule,
    ValidateModule,
	ProfileModule,
	ProfilePopupModule,
	ToastComponent,
	ToastsContainer,
  ],
  providers: [
    FetchService,
    WebsocketService,
	NotificationService,
  ],
  bootstrap: [
	AppComponent,
]
})
export class AppModule { }
