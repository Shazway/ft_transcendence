import { Component} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AnyProfileUser } from 'src/dtos/User.dto';
import { FetchService } from '../fetch.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

	foundProfiles : AnyProfileUser[];

	constructor(
		private fetchService: FetchService,
	) {
		this.foundProfiles = [];
	}

	changeSearch(value : string) {
		if (value.length >= 3)
			this.onClickSearch(value);
	}

	async onClickSearch(value : string) {
		console.log("appel au back pour " + value);
		this.foundProfiles = await this.fetchService.searchingPrefix(value);
	}

}
