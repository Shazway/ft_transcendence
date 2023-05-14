import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { AuthComponent } from './auth/auth.component';
import { ValidateComponent } from './validate/validate.component';
import { MatchMakingComponent } from './match-making/match-making.component';
import { PongComponent } from './pong/pong.component';
import { PongDebugComponent } from './pong-debug/pong-debug.component';
import { FriendsComponent } from './friends/friends.component';
import { ProfileComponent } from './profile/profile.component';
import { ShopComponent } from './shop/shop.component';

const routes: Routes = [
	{ path: 'users', component: UsersComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'chat', component: ChatComponent },
	{ path: 'auth', component: AuthComponent },
	{ path: 'validate', component: ValidateComponent },
	{ path: 'matchmaking', component: MatchMakingComponent },
	{ path: 'pong', component: PongComponent },
	{ path: 'pong_debug', component: PongDebugComponent },
	{ path: 'friends', component: FriendsComponent },
	{ path: 'profile', component: ProfileComponent },
	{ path: 'shop', component: ShopComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
