import { Component } from '@angular/core';
import { ShopItem } from 'src/dtos/ShopItem.dto';


//https://www.youtube.com/watch?v=Vy7ESjYNO_Y&list=PLrbLGOB571zeR7FUQifKmjUpT4ImldCPt&index=13

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent {

	items : Array<ShopItem>;
	
	
	constructor() {
		this.items = new Array<ShopItem>;
		this.items.push({id : 1, name : "test", description : "ceci est un item test", image : "https://img.passeportsante.net/1200x675/2021-06-01/i107848-eduquer-un-chaton.jpeg", type : "kitten"});
		this.items.push({id : 2, name : "test2", description : "ceci est un item test", image : "https://mag.bullebleue.fr/sites/mag/files/img/articles/chat/arrivee-chaton-maison-bons-reflexes.jpg", type : "kitten"});
		this.items.push({id : 3, name : "test3", description : "ceci est un item test", image : "https://www.zooplus.fr/magazine/wp-content/uploads/2019/06/arriv%C3%A9e-dun-chaton-%C3%A0-la-maison.jpeg", type : "kitten"});
	}
}
