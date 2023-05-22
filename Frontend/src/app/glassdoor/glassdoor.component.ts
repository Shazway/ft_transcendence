import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-glassdoor',
  templateUrl: './glassdoor.component.html',
  styleUrls: ['./glassdoor.component.css']
})
export class GlassdoorComponent {
	
	constructor(
		private router: Router,
		private parent: AppComponent,
	) {}

	async ngOnInit() {
		if (this.parent.isConnected())
			this.router.navigateByUrl('home');
	}
}
