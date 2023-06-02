import { Component, ElementRef} from '@angular/core';
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
		private elRef: ElementRef,
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
		if (await this.checkInput(value))
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

	inputFormElm : any;

	inputCheckList = {
		tooLong : true,
		tooShort : true,
		other : true
	};
	async checkInput(input: string) {
		if (!this.inputFormElm)
			this.inputFormElm = this.elRef.nativeElement.querySelector('#inputForm');

		if (input.length > 20)
			this.inputCheckList.tooLong = false;
		else
			this.inputCheckList.tooLong = true;

		if (this.inputCheckList.tooLong &&
			this.inputCheckList.tooShort &&
			this.inputCheckList.other)
		{
			if (this.inputFormElm.classList.contains('wrong-input'))
				this.inputFormElm.classList.remove('wrong-input');
			return (true);
			//input valide
		}
		else
		{
			if (!this.inputFormElm.classList.contains('wrong-input'))
				this.inputFormElm.classList.add('wrong-input');
			return (false)
			//input invalide

		}
	}

}
