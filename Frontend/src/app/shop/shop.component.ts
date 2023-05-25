import { AfterViewInit, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { string } from 'mathjs';
import { ShopItem } from 'src/dtos/ShopItem.dto';
import { ConfirmBuyPopup } from '../popup-component/popup-component.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../app.component';
import { FetchService } from '../fetch.service';
import { Router } from '@angular/router';


//https://www.youtube.com/watch?v=Vy7ESjYNO_Y&list=PLrbLGOB571zeR7FUQifKmjUpT4ImldCPt&index=13

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements AfterViewInit {

	items : Array<ShopItem> = [];
	filteredItems : Array<ShopItem>;
	existingTypes : Array<string>;
	chosenType = "" ;
	searching = "";
	
	playerWealth = 0;
	
	constructor(
		private modalService: NgbModal,
		private parent: AppComponent,
		private fetchService: FetchService,
		private router: Router
	) {
		this.getMoney();
		
		this.filteredItems = new Array<ShopItem>;
		

		this.existingTypes = new Array<string>;
		this.existingTypes.push("kitten");
		this.existingTypes.push("Skin");
		this.existingTypes.push("Title");
		this.existingTypes.push("Background");
	}

	async ngAfterViewInit() {
		await this.customOnInit();
		if (this.items)
			this.filteredItems = this.items;
		this.filterItems(this.searching);
	}
	async customOnInit() {
		if (!this.parent.isConnected())
			this.router.navigateByUrl('login');
		const availableSkins = await this.fetchService.getBuyableSkins();
		if (availableSkins)
			this.items = availableSkins;
	}

	onChange(value: any) {
        this.chosenType = value.target.value;
		console.log("Le user a choisi " + this.chosenType);
		this.filterItems("");
    }

	onClickSearch(value: any)
	{
		this.searching = value;
		console.log(value);
		console.log("Le user cherche " + this.searching);
		this.filterItems("");

	}

	filter(element : ShopItem, index : number)
	{
		console.log("fonction filter");
		if ((this.chosenType == '' || element.type===this.chosenType) && (this.searching == '' || element.name.search(this.searching) != -1 || element.description.search(this.searching) != -1))
			return true;
		return false
	}

	filterItems(value: string)
	{
		console.log("filtering");
		if (this.items)
			this.filteredItems = this.items.filter(this.filter.bind(this));
	}

	async confirmBuy(item : ShopItem) {
		let res : {newBalance : number, availableSkins : ShopItem[]} | null;
		const validate = await this.createPopup(item);
		console.log(validate);
		if (validate)
		{
			res = await this.fetchService.buy(item);
			if (res)
			{
				console.log("validated");
				this.playerWealth = res.newBalance;
				this.items = res.availableSkins;
				this.filterItems(this.searching);
				console.log(res.availableSkins);
				this.parent.updateThunes(this.playerWealth);
			}
			else
				console.log("failed");
		}
		else
			console.log("canceled");
	}
	
	async createPopup(item : ShopItem) {
		const modalRef = this.modalService.open(ConfirmBuyPopup);
		modalRef.componentInstance.item = item;
		return await modalRef.result;
	}

	async getMoney()
	{
		this.playerWealth = await this.fetchService.getBalance();
		console.log("thune " + this.playerWealth);
	}
}
