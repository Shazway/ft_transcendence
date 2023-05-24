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
import { HomeComponent } from './home/home.component';
import { GlassdoorComponent } from './glassdoor/glassdoor.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

const routes: Routes = [
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
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
	{ path: 'friendRequests', component: FriendsComponent},
	{ path: 'block', component: FriendsComponent},
	{ path: 'glassdoor', component: GlassdoorComponent},
	{ path: 'home', component: HomeComponent},
	{ path: 'leaderboard', component: LeaderboardComponent},
	{ path: '**', redirectTo: '/home', pathMatch: 'full' },

];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
