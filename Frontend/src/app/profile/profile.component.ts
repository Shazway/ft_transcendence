import { Component, ElementRef, ViewChild } from '@angular/core';
import { floor, random, round } from 'mathjs';

interface MatchHistory {
	Player1: string;
	P1URL: string;
	P1score: number;
	Player2: string;
	P2URL: string;
	P2score: number;
	date: Date;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
	matchHistory: Array<MatchHistory>;
	constructor() {
		this.matchHistory = new Array;
		let time = new Date();
		for (let index = 0; index < 20; index++) {
			const chooseWinner = round(random(0,1));
			const randScore = round(random(0,9));
			const randTime = random(20, 200);
			const min = floor(randTime % 60);
			const hour = floor((randTime / 60) % 24);
			const days = floor(randTime / 60 / 24);
			time = this.forgeDate(time, days, hour, min);
			this.matchHistory.push({
				Player1: 'Mr. Connasse',
				P1URL: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp',
				P1score: chooseWinner ? 10 : randScore,
				Player2: 'Pedro',
				P2URL: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
				P2score: !chooseWinner ? 10 : randScore,
				date: time,
			});
		}
	}

	forgeDate(date: Date, d: number, h: number, m: number) {
		const subTime = (d * 24 * 60 * 60 * 1000) + (h * 60 * 60 * 1000) + (m * 60 * 1000);
		return(new Date(date.getTime() - subTime));
	}

	isVictory(match: MatchHistory) {
		if (match.Player1 == 'Mr. Connasse')
			return (match.P1score == 10);
		return (match.P2score == 10);
	}

	getTimeDiff(timestamp: Date) {
		let str = new String();
		const time = new Date().getTime() - timestamp.getTime();

		const min = floor(time / (1000 * 60));
		const hour = floor(time / (1000 * 60 * 60));
		const days = floor(time / (1000 * 60 * 60 * 24));

		if (days > 0)
			str += days + ' day ';
		if (hour > 0)
			str += (hour - days * 24) + ' hour ';
		if (min > 0 && days < 1)
			str += (min - hour * 60) + ' min ';
		str += 'ago';
		return str;
	}
}