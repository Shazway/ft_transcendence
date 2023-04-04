import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FetchService } from '../fetch.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
	users$: Observable<any> | undefined;

	constructor(private userService: FetchService) {}

	ngOnInit(): void {
		this.users$ = this.userService.getAllUsers();
	}

}
