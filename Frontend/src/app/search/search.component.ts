import { Component } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {


	searching = "";

	
	onClickSearch(value: any)
	{
		this.searching = value;
		console.log(value);
		console.log("Le user cherche " + this.searching);
	}

}
