import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Frontend';
  isExpanded = false;

  toggleSidebar() {
	console.log("Toggling the sidebar");
	console.log(this.isExpanded);
	this.isExpanded = !this.isExpanded
  }
}