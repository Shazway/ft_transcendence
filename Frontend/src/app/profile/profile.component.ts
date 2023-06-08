import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { floor, ceil, random, round } from 'mathjs';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AppComponent } from '../app.component';
import { PopoverConfig } from 'src/dtos/Popover.dto';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchService } from '../fetch.service';
import { AnyProfileUser, MyProfileUser } from 'src/dtos/User.dto';
import { AchievementList } from 'src/dtos/Achievement.dto';
import { ShopItem } from 'src/dtos/ShopItem.dto';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeAvatarPopup } from '../popup-component/popup-component.component';
import { NotificationService } from '../notification.service';
import { NotificationRequest } from 'src/dtos/Notification.dto';
import { ChatComponent } from '../chat/chat.component';


interface MatchHistory {
	Player1: string;
	P1URL: string;
	P1score: number;
	P1Victory: boolean;
	P1ID: number;
	Player2: string;
	P2URL: string;
	P2score: number;
	P2Victory: boolean;
	P2ID: number;
	isRanked: boolean;
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
		trigger('viewFadeIn', [
			transition(':enter', [style({ opacity: '0' }), animate('300ms ease-out', style({ opacity: '1' }))]),
		]),
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
			state('right', style({ transform: 'translateX(235%) scale(1.8)' })),
			transition('none => left, none => right', animate('300ms ease-out'))
		]),
		trigger('slideCenter', [
			state('left', style({ transform: 'translateX(-115%) scale(0.5)' })),
			state('right', style({ transform: 'translateX(115%) scale(0.5)' })),
			transition('none => left, none => right', animate('300ms ease-out'))
		]),
		trigger('slideRight', [
			state('left', style({ transform: 'translateX(-235%) scale(1.8)' })),
			state('right', style({ transform: 'translateX(235%) scale(0.5)' })),
			transition('none => left, none => right', animate('300ms ease-out'))
		]),
		trigger('slideFarRight', [
			state('left', style({ transform: 'translateX(-340%) scale(2)' })),
			transition('none => left', animate('300ms ease-out'))
		]),
	],
})
export class ProfileComponent implements AfterViewInit {
	@ViewChild('userSettingsTemplate') userSettingsTemplate!: TemplateRef<any>;
	@ViewChild('profileCard') profileCard!: ElementRef;
	@ViewChild('matchBody') matchBody!: ElementRef;
	user!: AnyProfileUser;
	matchHistory!: Array<MatchHistory>;
	matchChart!: Chart;
	rankChart!: Chart;
	rank = 100;
	maxScore = 100;
	isLoaded = false;
	allSkins! : ShopItem[];
	paddleSkins! : any;
	windowPaddle : ShopItem[] = [];
	ballSkins! : ShopItem[];
	windowBall : ShopItem[] = [];
	backgroundSkins! : ShopItem[];
	windowBackground : ShopItem[] = [];
	slideDirectionPaddle = 'none';
	slideDirectionBall = 'none';
	slideDirectionBackground = 'none';
	settingState = 'closed';
	achievements: AchievementList = {unlockedAchievements: [], lockedAchievements: []};
	titles : string[] = [];

	changes : { skins : boolean, invite : boolean, doubleAuth : boolean, title : boolean } = {skins : false, invite : false, doubleAuth : false, title : false};

	nobodyChecked = false;
	friendsChecked = false;
	everyoneChecked = false;
	doubleAuthChecked = false;
	newTitle = '';

	constructor(
		private cdr: ChangeDetectorRef,
		private parent: AppComponent,
		private route: ActivatedRoute,
		private fetchService: FetchService,
		private elRef: ElementRef,
		private modalService: NgbModal,
		private router: Router,
	) {
		this.fetchService.checkToken();
		Chart.register(ChartDataLabels);
		this.matchHistory = new Array;
	}

	async getSkins() {
		this.allSkins = await this.fetchService.getUserSkins();
		this.paddleSkins = this.allSkins.filter((a)=>{return a.type == 'Paddle'});
		this.ballSkins = this.allSkins.filter((a)=>{return a.type == 'Ball'});
		this.backgroundSkins = this.allSkins.filter((a)=>{return a.type == 'Background'});
		for(let i = 0; i < 5; i++) {
			this.windowPaddle.push(this.paddleSkins[i % this.paddleSkins.length]);
			this.windowBall.push(this.ballSkins[i % this.ballSkins.length]);
			this.windowBackground.push(this.backgroundSkins[i % this.backgroundSkins.length]);
		}
		while (this.user.current_skins[0] != -1 && this.windowPaddle[2].skin_id != this.user.current_skins[0])
			this.autoRotate(this.windowPaddle, this.paddleSkins);
		while (this.user.current_skins[1] != -1 && this.windowBall[2].skin_id != this.user.current_skins[1])
			this.autoRotate(this.windowBall, this.ballSkins);
		while (this.user.current_skins[2] != -1 && this.windowBackground[2].skin_id != this.user.current_skins[2])
			this.autoRotate(this.windowBackground, this.backgroundSkins);
	}

	initToggles() {
		if (this.user.channelInviteAuth == 0)
			this.nobodyChecked = true;
		else if (this.user.channelInviteAuth == 1)
			this.friendsChecked = true;
		else
			this.everyoneChecked = true;

		if (this.user.double_auth)
			this.doubleAuthChecked = true;
	}

	getTitles() {
		this.user.achievements.unlockedAchievements.forEach(
			(value) => {
				if(value.achievement_reward && value.achievement_reward.length)
					this.titles.push(value.achievement_reward);
			})
	}

	async customOnInit() {
		if (!this.parent.isConnected())
			this.router.navigateByUrl('login');
		const name = this.route.snapshot.queryParamMap.get('username');
		if (!name) {
			const newUser = await this.fetchService.getMyProfile();
			if (newUser)
				this.user = newUser;
		}
		else if (name == 'Mr.Connasse')
			this.generateMatches();
		else {
			const newUser = await this.fetchService.getProfile(name);
			if (newUser)
				this.user = newUser;
			else this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigateByUrl("profile"));;
		}
		if (this.user && this.user.match_history) {
			this.user.match_history.reverse().forEach(match => {
				console.log(match);
				const date = new Date(match.date);
				this.matchHistory.push({
					Player1: match.user[0].username,
					P1URL: match.user[0].img_url,
					P1score: match.current_score[0],
					P1Victory: match.is_victory[0],
					P1ID: match.user[0].user_id,
					Player2: match.user[1].username,
					P2URL: match.user[1].img_url,
					P2score: match.current_score[1],
					P2Victory: match.is_victory[1],
					P2ID: match.user[1].user_id,
					isRanked: match.is_ranked,
					date: new Date(date.setHours(date.getHours() + 2)),
				});
			});
			this.rank = this.user.rank_score;
		}
		if (this.isMyProfile()) {
			this.initToggles();
			this.getSkins();
			this.getTitles();
		}
	}

	createChatPopup(username: string, UID: number) {
		if (UID == 0)
			return;
		this.parent.openPopover('profile', new PopoverConfig(
			this.matchBody.nativeElement,
			'profile arrow-hide',
			'outside',
			'start',
			{name: username, id: UID, client: this.parent.notifService.client},
		));
	}

	isMyProfile() {
		const name = this.route.snapshot.queryParamMap.get('username');
		if (!name)
			return true;
		if (name == 'Mr.Connasse')
			return false
		if (this.user && this.user.username == localStorage.getItem('username'))
			return true;
		return false;
	}

	isCurrentProfile(name: string) {
		const username = this.route.snapshot.queryParamMap.get('username');
		if (username)
			return (name == username);
		else
			return (name == localStorage.getItem('username'));
	}


	updateSkins() {
		if (this.user.current_skins[0] != this.windowPaddle[2].skin_id)
		{
			this.changes.skins = true;
			this.user.current_skins[0] = this.windowPaddle[2].skin_id;
		}
		if (this.user.current_skins[1] != this.windowBall[2].skin_id)
		{
			this.changes.skins = true;
			this.user.current_skins[1] = this.windowBall[2].skin_id;
		}
		if (this.user.current_skins[2] != this.windowBackground[2].skin_id)
		{
			this.changes.skins = true;
			this.user.current_skins[2] = this.windowBackground[2].skin_id;
		}
	}

	async updateSettings(newUsername : string) {
		let tmp : any;

		this.updateSkins();
		if (this.changes.skins)
			this.fetchService.applySkins(this.user.current_skins);
		if (this.changes.invite)
			this.fetchService.changeInvite(this.user.channelInviteAuth);
		if (this.changes.doubleAuth)
			this.fetchService.toggleDoubleAuth();
		if (this.changes.title && this.user.title != this.newTitle)
		{
			tmp = await this.fetchService.changeTitle(this.newTitle);
			if (tmp.status == 200)
				this.user.title = this.newTitle;
		}
		this.createSettingsPopup();
		let test = await this.checkInput(newUsername);
		if (newUsername.length > 0 && (test == true))
		{
			let res = await this.fetchService.changeUsername(newUsername);
			if (res.status == 202)
			{
				this.user.username = newUsername;
				localStorage.setItem('username', newUsername);
				localStorage.setItem('Jwt_token', res.data.newToken);
				this.router.navigateByUrl('profile');
			}
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
				Player1: 'Mr.Connasse',
				P1URL: 'https://i1.sndcdn.com/artworks-000329925816-3yu1fd-t500x500.jpg',
				P1score: chooseWinner ? 10 : randScore,
				P1Victory: Boolean(chooseWinner),
				P1ID: 0,
				Player2: 'Pedro',
				P2URL: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
				P2score: !chooseWinner ? 10 : randScore,
				P2Victory: !chooseWinner,
				P2ID: 0,
				isRanked: true,
				date: time,
			});
		}

		let index = 0
		for (; index < 5; index++) {
			this.achievements.unlockedAchievements.push({achievement_id: index, achievement_name: 'Achievement ' + index, achievement_description: 'Description ' + index});
		}
		for (; index < 15; index++) {
			this.achievements.lockedAchievements.push({achievement_id: index, achievement_name: 'Achievement ' + index, achievement_description: 'Description ' + index});
		}
	}

	async ngAfterViewInit() {
		this.cdr.detach();
		await this.customOnInit();
		this.isLoaded = true;
		this.cdr.detectChanges();
		if (this.matchHistory.length > 0) {
			this.matchChart = new Chart(document.getElementById('matchChart') as HTMLCanvasElement, this.getMatchChartConfig());
			this.rankChart = new Chart(document.getElementById('rankChart') as HTMLCanvasElement, this.getRankedChartConfig());
		}
		if (this.isMyProfile()) {
			let elAvatar = this.elRef.nativeElement.querySelector('#avatarPic');
			if (elAvatar)
				elAvatar.classList.add('my-avatar');
		}
		this.cdr.detectChanges();
		this.cdr.reattach();
	}

	panLeft(window : ShopItem[], skins : ShopItem[], slideDirection : string) {
		if (slideDirection == 'slideDirectionBall')
			this.slideDirectionBall = 'left';
		if (slideDirection == 'slideDirectionPaddle')
			this.slideDirectionPaddle = 'left';
		if (slideDirection == 'slideDirectionBackground') {
			let index = skins.indexOf(window[4]);
			if (index < skins.length - 1)
				index++;
			else
				index = 0;
			window.shift();
			window.push(skins[index]);
			return;
		}
		setTimeout(() => {
			let index = skins.indexOf(window[4]);
			if (index < skins.length - 1)
				index++;
			else
				index = 0;
			window.shift();
			window.push(skins[index]);
			if (slideDirection == 'slideDirectionBall')
				this.slideDirectionBall = 'none';
			if (slideDirection == 'slideDirectionPaddle')
				this.slideDirectionPaddle = 'none';
			if (slideDirection == 'slideDirectionBackground')
				this.slideDirectionBackground = 'none';
		}, 300);
	}

	autoRotate(window : ShopItem[], skins : ShopItem[]) {
		let index = skins.indexOf(window[0]);
		if (index > 0)
			index--;
		else
			index = skins.length - 1;
		window.pop();
		window.unshift(skins[index]);
	}

	panRight(window : ShopItem[], skins : ShopItem[], slideDirection : string) {
		if (slideDirection == 'slideDirectionBall')
			this.slideDirectionBall = 'right';
		if (slideDirection == 'slideDirectionPaddle')
			this.slideDirectionPaddle = 'right';
		if (slideDirection == 'slideDirectionBackground') {
			let index = skins.indexOf(window[0]);
			if (index > 0)
				index--;
			else
				index = skins.length - 1;
			window.pop();
			window.unshift(skins[index]);
			return;
		}

		setTimeout(() => {
			let index = skins.indexOf(window[0]);
			if (index > 0)
				index--;
			else
				index = skins.length - 1;
			window.pop();
			window.unshift(skins[index]);
			if (slideDirection == 'slideDirectionBall')
				this.slideDirectionBall = 'none';
			if (slideDirection == 'slideDirectionPaddle')
				this.slideDirectionPaddle = 'none';
			if (slideDirection == 'slideDirectionBackground')
				this.slideDirectionBackground = 'none';
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
		let pastRank = 100;
		this.matchHistory.reverse().forEach((match, index) => {
			if (!match.isRanked)
				return;
			if (ret.length == 0 && index != 0 && match.date.getTime() >= dateRange.past.getTime())
				ret.push({x: this.getRealTimeDiff(dateRange.past, dateRange.today), y: pastRank})
			if (this.isVictory(match)) pastRank += 10;
			else pastRank -= 10;
			if (pastRank < 0) pastRank = 0;
			if (match.date.getTime() >= dateRange.past.getTime()) {
				if (pastRank > this.maxScore) this.maxScore = pastRank;
				ret.push({x: this.getRealTimeDiff(match.date, dateRange.today), y: pastRank})
			}
		});
		this.matchHistory.reverse();
		return ret;
	}

	getPercentAchieved() {
		if (this.isCurrentProfile('Mr.Connasse')) {
			return '72%';
		}
		if (!this.user.achievements.unlockedAchievements.length)
			return '0%';
		const total = this.user.achievements.lockedAchievements.length + this.user.achievements.unlockedAchievements.length;
		const percent = round((this.user.achievements.unlockedAchievements.length / total) * 100);
		return (percent + '%');
	}

	getStatus() {
		if (this.user && !this.isMyProfile())
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
			if (this.isCurrentProfile(match.Player1)) {
				if (match.P1Victory)
					ret[match.P2score + 10]++;
				else ret[match.P1score]++;
			}
			else {
				if (match.P2Victory)
					ret[match.P1score + 10]++;
				else ret[match.P2score]++;
			}
		})
		return ret;
	}

	getRatio() {
		let ret = [0, 0];
		if (this.user) {
			ret[1] = this.user.wins;
			ret[0] = this.user.losses;
		}
		else if (this.isCurrentProfile('Mr.Connasse')) {
			const score = this.countScores();
			for (let i = 0; i < 10; i++) {
				ret[0] += score[i];
			}
			ret[1] = (this.matchHistory.length - ret[0]);
		}
		return ret;
	}

	forgeDate(date: Date, d: number, h: number, m: number) {
		const subTime = (d * 24 * 60 * 60 * 1000) + (h * 60 * 60 * 1000) + (m * 60 * 1000);
		return(new Date(date.getTime() - subTime));
	}

	isVictory(match: MatchHistory) {
		if (this.isCurrentProfile(match.Player1))
			return match.P1Victory;
		return match.P2Victory;
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
		if ((min > 0 || (min >= 0 && hour < 1)) && days < 1)
			str += (min - hour * 60) + ' min ';
		str += 'ago';
		return str;
	}

	getName(match: MatchHistory, player: string) {
		return this.isCurrentProfile(player) ? match.Player1 : match.Player2;
	}

	getId(match: MatchHistory, player: string) {
		return this.isCurrentProfile(player) ? match.P1ID : match.P2ID;
	}

	getScore(match: MatchHistory, player: string) {
		return (this.isCurrentProfile(player) ? match.P1score : match.P2score);
	}

	getImg(match: MatchHistory, player: string) {
		return (this.isCurrentProfile(player) ? match.P1URL : match.P2URL);
	}

	acceptChanInviteFrom(people : number) {
		this.changes.invite = true;
		this.user.channelInviteAuth = people;
	}

	toggleAuth() {
		this.changes.doubleAuth = !this.changes.doubleAuth;
		this.user.double_auth = !this.user.double_auth;
	}

	async popupAvatar() {
		const modalRef = this.modalService.open(ChangeAvatarPopup);
		modalRef.componentInstance.user = this.user;
		return await modalRef.result;
	}

	async openChangeAvatar() {
		if (!this.isMyProfile())
			return ;
		let newAvatar = await this.popupAvatar();
		if (newAvatar.length > 0)
		{
			const res = await this.fetchService.changeAvatar(newAvatar);
			if (res == 202)
			{
				this.user.img_url = newAvatar;
				localStorage.setItem('img_url', newAvatar);
			}
		}
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

		if (input.length > 0 && await this.fetchService.getProfile(input))
			this.inputCheckList.other = false;
		else
			this.inputCheckList.other = true;

		if (this.inputCheckList.tooLong &&
			this.inputCheckList.tooShort &&
			this.inputCheckList.other)
		{
			if (this.inputFormElm.classList.contains('wrong-input'))
				this.inputFormElm.classList.remove('wrong-input');
			return (true);
		}
		else
		{
			if (!this.inputFormElm.classList.contains('wrong-input'))
				this.inputFormElm.classList.add('wrong-input');
			return (false)

		}
	}

	setTitle(input : any) {
		this.changes.title = true;
		this.newTitle = input.target.value;
	}

	buildNotif(type: string, target_name: string, target_id: number) : NotificationRequest {
		return {type : type, target_id : target_id, target_name : target_name};
	}

	addFriend() {
		if (this.user)
			this.parent.notifService.client.emit('inviteRequest', this.buildNotif("friend", this.user.username, this.user.user_id));
	}

	challenge() {
		if (this.user)
			this.parent.notifService.client.emit('inviteRequest', this.buildNotif("match", this.user.username, this.user.user_id));
	}

}

