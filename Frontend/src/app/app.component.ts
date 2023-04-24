import { Component, ElementRef } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Frontend';
  isExpanded = false;

  constructor(
	private elRef: ElementRef
  ){}

  togglePlay() {
	const offscreenElm = this.elRef.nativeElement.querySelector('#play');
	if (!offscreenElm)
		return;
	if (offscreenElm.classList.contains('show')) {
		offscreenElm.classList.remove('show');
	} else {
		offscreenElm.classList.add('show');
	}
  }
}