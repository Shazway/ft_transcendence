import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
	users$: Observable<any> | undefined;

	constructor(private userService: UsersService) {}

	ngOnInit(): void {
		this.users$ = this.userService.getUsers();
		console.log(this.users$);
	}

}
