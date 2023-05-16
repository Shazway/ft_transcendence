import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ShopItem } from 'src/dtos/ShopItem.dto';


//https://www.youtube.com/watch?v=Vy7ESjYNO_Y&list=PLrbLGOB571zeR7FUQifKmjUpT4ImldCPt&index=13

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent {

	items : Array<ShopItem>;
	existingTypes : Array<string>;
	chosenType = "";
	searching = "";
	
	playerWealth = 65;
	
	constructor() {
		this.items = new Array<ShopItem>;
		this.items.push({price : 500, id : 1, name : "test", description : "ceci est un item test", image : "https://img.passeportsante.net/1200x675/2021-06-01/i107848-eduquer-un-chaton.jpeg", type : "kitten"});
		this.items.push({price : 50, id : 2, name : "test2", description : "ceci est un item test", image : "https://mag.bullebleue.fr/sites/mag/files/img/articles/chat/arrivee-chaton-maison-bons-reflexes.jpg", type : "kitten"});
		this.items.push({price : 75, id : 3, name : "test3", description : "ceci est un item test", image : "https://www.zooplus.fr/magazine/wp-content/uploads/2019/06/arriv%C3%A9e-dun-chaton-%C3%A0-la-maison.jpeg", type : "kitten"});
		this.items.push({price : 20, id : 1, name : "test", description : "ceci est un item test", image : "https://img.passeportsante.net/1200x675/2021-06-01/i107848-eduquer-un-chaton.jpeg", type : "kitten"});
		this.items.push({price : 10, id : 2, name : "test2", description : "ceci est un item test", image : "https://mag.bullebleue.fr/sites/mag/files/img/articles/chat/arrivee-chaton-maison-bons-reflexes.jpg", type : "kitten"});
		this.items.push({price : 65, id : 3, name : "test3", description : "ceci est un item test", image : "https://www.zooplus.fr/magazine/wp-content/uploads/2019/06/arriv%C3%A9e-dun-chaton-%C3%A0-la-maison.jpeg", type : "kitten"});
		this.items.push({price : 40, id : 1, name : "test", description : "ceci est un item test", image : "https://img.passeportsante.net/1200x675/2021-06-01/i107848-eduquer-un-chaton.jpeg", type : "kitten"});
		this.items.push({price : 80, id : 2, name : "test2", description : "ceci est un item test", image : "https://mag.bullebleue.fr/sites/mag/files/img/articles/chat/arrivee-chaton-maison-bons-reflexes.jpg", type : "kitten"});
		this.items.push({price : 95, id : 3, name : "test3", description : "ceci est un titre", image : "https://www.zooplus.fr/magazine/wp-content/uploads/2019/06/arriv%C3%A9e-dun-chaton-%C3%A0-la-maison.jpeg", type : "Title"});
		
		this.existingTypes = new Array<string>;
		this.existingTypes.push("kitten");
		this.existingTypes.push("Skin");
		this.existingTypes.push("Title");
		this.existingTypes.push("Background");
	}

	onChange(value: any) {
        this.chosenType = value.target.value;
		console.log("Le user a choisi " + this.chosenType);
    }

	onClickSearch(value: any)
	{
		this.searching = value;
		console.log(value);
		console.log("Le user cherche " + this.searching);
	}

	filter(value: string)
	{
		if (this.chosenType=='' || value==this.chosenType) return false;
		return true
	}
}
