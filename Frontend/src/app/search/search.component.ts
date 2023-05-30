import { Component} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AnyProfileUser } from 'src/dtos/User.dto';
import { FetchService } from '../fetch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

	foundProfiles : AnyProfileUser[];

	constructor(
		private fetchService: FetchService,
		private router: Router,
	) {
		this.foundProfiles = [];
	}

	changeSearch(value : string) {
		if (value.length >= 3)
			this.onClickSearch(value);
	}

	async onClickSearch(value : string) {
		if (value.length > 0)
		{
			this.foundProfiles = await this.fetchService.searchingSubstring(value);
			this.foundProfiles = this.sortSearched(this.foundProfiles, value);
		}
	}

	goToProfile(user: AnyProfileUser)
	{
		console.log(user);
		this.router.navigateByUrl("profile?username=" + user.username);
	}

	sortSearched(found : AnyProfileUser[], key : string) {
		found.sort(); //sort par ordre alphabetique
		found.sort((a, b)=> a.username.indexOf(key) - b.username.indexOf(key))
		return found;
	}

}
