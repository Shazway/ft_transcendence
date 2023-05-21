import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, TemplateRef, ElementRef, OnInit } from '@angular/core';
import { floor, ceil, random, round } from 'mathjs';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AppComponent } from '../app.component';
import { PopoverConfig } from 'src/dtos/Popover.dto';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { FetchService } from '../fetch.service';
import { AnyProfileUser } from 'src/dtos/User.dto';

interface MatchHistory {
	Player1: string;
	P1URL: string;
	P1score: number;
	Player2: string;
	P2URL: string;
	P2score: number;
	date: Date;
}

interface Pair {
	x: number;
	y: number;
}

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css'],
	animations: [
		trigger('settingWindow', [
			transition(':enter', [style({ height: '0', 'margin-bottom': '0' }), animate('300ms ease-out', style({ height: '*', 'margin-bottom': '*' }))]),
			transition(':leave', animate('300ms ease-out', style({ height: '0', 'margin-bottom': '0' }))),
		]),
		trigger('slideFarLeft', [
			state('right', style({ transform: 'translateX(340%) scale(2)' })),
			transition('none => right', animate('300ms ease-out'))
		]),
		trigger('slideLeft', [
			state('left', style({ transform: 'translateX(-235%) scale(0.5)' })),
			state('right', style({ transform: 'translateX(235%) scale(2)' })),
			transition('none => left, none => right', animate('300ms ease-out'))
		]),
		trigger('slideCenter', [
			state('left', style({ transform: 'translateX(-115%) scale(0.5)' })),
			state('right', style({ transform: 'translateX(115%) scale(0.5)' })),
			transition('none => left, none => right', animate('300ms ease-out'))
		]),
		trigger('slideRight', [
			state('left', style({ transform: 'translateX(-235%) scale(2)' })),
			state('right', style({ transform: 'translateX(235%) scale(0.5)' })),
			transition('none => left, none => right', animate('300ms ease-out'))
		]),
		trigger('slideFarRight', [
			state('left', style({ transform: 'translateX(-340%) scale(2)' })),
			transition('none => left', animate('300ms ease-out'))
		]),
	],
})
export class ProfileComponent implements AfterViewInit, OnInit {
	@ViewChild('userSettingsTemplate') userSettingsTemplate!: TemplateRef<any>;
	@ViewChild('profileCard') profileCard!: ElementRef;
	user!: AnyProfileUser;
	matchHistory!: Array<MatchHistory>;
	matchChart!: Chart;
	rankChart!: Chart;
	rank = 100;
	maxScore = 100;
	paddleSkins = [
		{ src: 'assets/raquette-baguette.png' },
		{ src: 'assets/raquette-eclairAuChocolat.png' },
		{ src: 'assets/raquette-poele.png' },
		{ src: 'assets/raquette-torti.png' },
		{ src: 'assets/Swirl.png' },
		{ src: 'assets/paddle-red-gradient.png' },
	];
	slideDirection = 'none';
	settingState = 'closed';

	constructor(
		private cdr: ChangeDetectorRef,
		private parent: AppComponent,
		private route: ActivatedRoute,
		private fetchService: FetchService,
	) {
		Chart.register(ChartDataLabels);
		this.matchHistory = new Array;
	}
	
	async ngOnInit() {
		const name = this.route.snapshot.queryParamMap.get('username');
		console.log(name);
		if (!name) {
			const newUser = await this.fetchService.getProfile(localStorage.getItem('username'));
			if (newUser)
				this.user = newUser;
		}
		else if (name == 'Mr.Connasse')
			this.generateMatches();
		else {
			const newUser = await this.fetchService.getProfile(localStorage.getItem(name));
			if (newUser)
				this.user = newUser;
		}
		if (this.user) {
			console.log('yipeeeee' + this.user.match_history.length);
			this.user.match_history.reverse().forEach(match => {
				console.log(match);
				this.matchHistory.push({
					Player1: match.user[0].username,
					P1URL: match.user[0].img_url,
					P1score: match.current_score[0],
					Player2: match.user[1].username,
					P2URL: match.user[1].img_url,
					P2score: match.current_score[1],
					date: new Date(match.date.setHours(match.date.getHours() + 2)),
				});
			});
			this.rank = this.user.rank_score;
		}
	}

	generateMatches() {
		const nbGenerate = 1000;
		this.matchHistory = new Array;
		let time = new Date();
		for (let index = 0; index < nbGenerate; index++) {
			const chooseWinner = round(random(0,1));
			const randScore = round(random(0,9));
			const randTime = random(20, 200);
			const min = floor(randTime % 60);
			const hour = floor((randTime / 60) % 24);
			const days = floor(randTime / 60 / 24);
			time = this.forgeDate(time, days, hour, min);
			this.matchHistory.push({
				Player1: 'Mr. Connasse',
				P1URL: 'https://i1.sndcdn.com/artworks-000329925816-3yu1fd-t500x500.jpg',
				P1score: chooseWinner ? 10 : randScore,
				Player2: 'Pedro',
				P2URL: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
				P2score: !chooseWinner ? 10 : randScore,
				date: time,
			});
		}
	}

	ngAfterViewInit(): void {
		this.cdr.detach();
		this.matchChart = new Chart(document.getElementById('matchChart') as HTMLCanvasElement, this.getMatchChartConfig());
		this.rankChart = new Chart(document.getElementById('rankChart') as HTMLCanvasElement, this.getRankedChartConfig());
		this.cdr.detectChanges();
		this.cdr.reattach();
	}
	
	panLeft() {
		this.slideDirection = 'left';
		setTimeout(() => {
			const shift = this.paddleSkins.shift();
			if (shift)
				this.paddleSkins.push(shift);
			this.slideDirection = 'none';
		}, 300);
	}
	
	panRight() {
		this.slideDirection = 'right';
		setTimeout(() => {
			const shift = this.paddleSkins.pop();
			if (shift)
				this.paddleSkins.unshift(shift);
			this.slideDirection = 'none';
		}, 300);
	}

	createSettingsPopup() {
		if (this.settingState == 'closed')
			this.settingState = 'open';
		else
			this.settingState = 'closed';
	}

	getRankedChartConfig(): ChartConfiguration {
		let delayed: boolean;
		const dateRange = this.getDateRange();
		return {
			type: 'line',
			data: {
				datasets: [
					{
						label: 'Data',
						data: this.getMatchRankData(),
						fill: false,
						borderColor: 'rgba(75, 192, 192, 1)',
						tension: 0,
						pointRadius: 1,
					},
				],
			},
			options: {
				responsive: true,
				aspectRatio: 1.6,
				scales: {
					x: {
						type: 'linear',
						min: 0,
						max: this.getMaxDate(),
						ticks: {
							stepSize: 1,
						},
						reverse: true,
					},
					y: {
						type: 'linear',
						min: 0,
						max: this.maxScore + 20,
						ticks: {
							stepSize: 20,
						},
					},
				},
				plugins: {
					legend: {
						display: false,
						position: 'center',
					},
					datalabels: {
						formatter: function (value, context) {
							return '';
						}
					},
					tooltip: {
						callbacks: {
							title: function(context) {
								const preValue: any = context[0].dataset.data[context[0].dataIndex];
								const value = Number(preValue.y);
								return 'Rank Score: ' + value;
							},
							label: function(context) {
								const preValue: any = context.dataset.data[context.dataIndex];
								const value = Number(preValue.x);
								const days = Math.floor(value);
								const hours = Math.floor((value - days) * 24);
								const minutes = Math.floor(((value - days) * 24 - hours) * 60);
								
								const secondDate = new Date(dateRange.today.getTime());
								secondDate.setDate(dateRange.today.getDate() - days);
								secondDate.setHours(dateRange.today.getHours() - hours);
								secondDate.setMinutes(dateRange.today.getMinutes() - minutes);
								const str_hours = secondDate.getHours().toString().padStart(2, '0');
								const str_minutes = secondDate.getMinutes().toString().padStart(2, '0');
								const str_day = secondDate.getDate().toString().padStart(2, '0');
								const str_month = (secondDate.getMonth() + 1).toString().padStart(2, '0');
								const str_year = secondDate.getFullYear().toString().slice(-2);
								return str_hours+':'+str_minutes+' '+str_day+'/'+str_month+'/'+str_year;
							},
							labelColor: function(context) { return; },
							labelPointStyle: function(context) {
								return {
									pointStyle: 'triangle',
									rotation: 0
								};
							}
						},
						displayColors: false,
					}
				},
				animation: {
					onComplete: () => {
						delayed = true;
					},
					delay: (context) => {
						let delay = 0;
						if (context.type === 'data' && context.mode === 'default' && !delayed) {
							delay = context.dataIndex * 30;
						}
						return delay;
					},
				},
			},
		}
	}

	getMatchRankData() {
		const dateRange = this.getDateRange();
		let ret = new Array<Pair>();
		this.matchHistory.reverse().forEach((match, index) => {
			if (ret.length == 0 && index != 0 && match.date.getTime() >= dateRange.past.getTime())
				ret.push({x: this.getRealTimeDiff(dateRange.past, dateRange.today), y: this.rank})
			if (this.isVictory(match)) this.rank += 10;
			else this.rank -= 10;
			if (this.rank < 0) this.rank = 0;
			if (match.date.getTime() >= dateRange.past.getTime()) {
				if (this.rank > this.maxScore) this.maxScore = this.rank;
				ret.push({x: this.getRealTimeDiff(match.date, dateRange.today), y: this.rank})
			}
		});
		this.matchHistory.reverse();
		return ret;
	}

	getStatus() {
		if (this.user)
			return this.user.activity_status ? 'online' : 'offline';
		else
			return 'online';
	}

	getMaxDate() {
		if (this.matchHistory.length < 1)
			return 1;
		const lastDate = this.matchHistory[this.matchHistory.length - 1].date;
		const diff = this.getRealTimeDiff(lastDate, this.getDateRange().today);
		if (diff > 30)
			return 30;
		return (ceil(diff));
	}

	getDateRange() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		today.setDate(today.getDate() + 1);
		const past = new Date(today);
		past.setDate(past.getDate() - 30);
		return {today: today, past: past};
	}

	getRealTimeDiff(date1: Date, date2: Date) {
		const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
		const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
		const roundedDiffInDays = Math.round(diffInDays * 10000) / 10000;
		return roundedDiffInDays;
	}

	getMatchChartConfig(): ChartConfiguration {
		let delayed: boolean;
		return {
			type: 'doughnut',
			data: {
				labels: [''],
				datasets: [
					{
						label: 'Scores',
						data: this.countScores(),
						backgroundColor: [
							'rgba(255, 20, 132, 1)',
							'rgba(255, 40, 132, 1)',
							'rgba(255, 60, 132, 1)',
							'rgba(255, 80, 132, 1)',
							'rgba(255, 100, 132, 1)',
							'rgba(255, 120, 132, 1)',
							'rgba(255, 140, 132, 1)',
							'rgba(255, 160, 132, 1)',
							'rgba(255, 180, 132, 1)',
							'rgba(255, 200, 132, 1)',
							'rgba(54, 20, 235, 1)',
							'rgba(54, 40, 235, 1)',
							'rgba(54, 60, 235, 1)',
							'rgba(54, 80, 235, 1)',
							'rgba(54, 100, 235, 1)',
							'rgba(54, 120, 235, 1)',
							'rgba(54, 140, 235, 1)',
							'rgba(54, 160, 235, 1)',
							'rgba(54, 180, 235, 1)',
							'rgba(54, 200, 235, 1)',
						],
						datalabels: {
							formatter: function (value, context) {
								const total = context.dataset.data.reduce((a, b) => ((a as number) + (b as number)), 0);
								if (!total || total == 0)
									return;
								const percentage = Math.round((value / (total as number)) * 100);
								return percentage + "%";
								// return context.dataIndex;
							},
						}
					},
					{
						label: 'Wins & Losses',
						data: this.getRatio(),
						backgroundColor: [
							'rgba(255, 20, 132, 1)',
							'rgba(54, 200, 235, 1)',
						],
						datalabels: {
							formatter: function (value, context) {
								if (context.dataIndex == 0)
									return 'Losses';
								return 'Wins';
							},
						}
					},
				]
			},
			options: {
				responsive: true,
				// aspectRatio: 1.5,
				layout: {
					padding: 20,
				},
				plugins: {
					legend: {
						display: false,
						position: 'center',
					},
					title: {
						display: false,
						text: 'Wins / Losses',
					},
					subtitle: {
						display: false,
						text: 'Custom Chart Subtitle'
					},
					tooltip: {
						callbacks: {
							label: function(context) {
								let label = context.dataset.label || '';
								if (label == 'Scores') {
									if (context.dataIndex >= 10)
										return context.dataset.data[context.dataIndex] + ' matches won with ' + (context.dataIndex - 10) + ' points for the opponent';
									return context.dataset.data[context.dataIndex] + ' matches lost with ' + context.dataIndex + ' points';
								}
								else {
									if (context.dataIndex == 0)
										return context.dataset.data[context.dataIndex] + ' losses'
									return context.dataset.data[context.dataIndex] + ' wins'
								}
								return label;
							},
							title: function(context) { return ''; },
							labelColor: function(context) { return; },
							labelPointStyle: function(context) {
								return {
									pointStyle: 'triangle',
									rotation: 0
								};
							}
						},
						displayColors: false,
					},
					datalabels: {
						anchor: 'center',
						display: function(context): boolean {
							return (context.dataset.data[context.dataIndex] != 0); // display labels with an odd index
						},
					}
				},
				animation: {
					onComplete: () => {
						delayed = true;
					},
					delay: (context) => {
						let delay = 0;
						if (context.type === 'data' && context.mode === 'default' && !delayed) {
							delay = context.dataIndex * 150 + context.datasetIndex * 50;
						}
						return delay;
					},
				},
			}
		};
	}

	countScores() {
		let ret = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.matchHistory.forEach(match => {
			if (match.Player1 == 'Mr. Connasse') {
				if (match.P1score == 10)
					ret[match.P2score + 10]++;
				else ret[match.P1score]++;
			}
			else {
				if (match.P2score == 10)
					ret[match.P1score + 10]++;
				else ret[match.P2score]++;
			}
		})
		return ret;
	}

	getRatio() {
		let ret = [0, 0];
		const score = this.countScores();
		for (let i = 0; i < 10; i++) {
			ret[0] += score[i];
		}
		ret[1] = (this.matchHistory.length - ret[0]);
		return ret;
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
		console.log(new Date().toString() + ' - ' + timestamp.toString());
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