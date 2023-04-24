import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { AuthComponent } from './auth/auth.component';
import { ValidateComponent } from './validate/validate.component';
import { MatchMakingComponent } from './match-making/match-making.component';
import { PongComponent } from './pong/pong.component';

const routes: Routes = [
	{ path: 'users', component: UsersComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'chat', component: ChatComponent },
	{ path: 'auth', component: AuthComponent },
	{ path: 'validate', component: ValidateComponent },
	{ path: 'matchmaking', component: MatchMakingComponent },
	{ path: 'pong', component: PongComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
