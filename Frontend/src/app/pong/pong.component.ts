import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { Application, Graphics, Texture } from 'pixi.js';
import { pongObject, ballObject, Move, VectorPos, ScoreChange, GameEnd} from 'src/dtos/Pong.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchSetting } from 'src/dtos/MatchSetting.dto';
import { Mutex } from 'async-mutex';
import { AssetManager, WowText } from 'src/dtos/GraphElem.dto';
import { AnyProfileUser } from 'src/dtos/User.dto';
import { FetchService } from '../fetch.service';
import { ShopItem } from 'src/dtos/ShopItem.dto';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AppComponent } from '../app.component';
import { NotificationService } from '../notification.service';
import { NotificationRequest } from 'src/dtos/Notification.dto';

@Component({
	selector: 'app-pong',
	templateUrl: './pong.component.html',
	styleUrls: ['./pong.component.css'],
	animations: [
		trigger('viewFadeIn', [
			transition(':enter', [style({ opacity: '0' }), animate('300ms ease-out', style({ opacity: '1' }))]),
		]),
	],
})
export class PongComponent implements OnDestroy {
	@ViewChild('pixiContainer') pixiContainer!: ElementRef;
	@ViewChild('arbiterContainer') arbiterContainer!: ElementRef;
	PLAYER_SCORED = 1;
	OPPONENT_SCORED = 0;
	LOSS = 0;
	WIN = 1;
	private client!: Socket;
	private app!: Application;
	private arbiter!: Application;
	public player!: pongObject;
	private ball!: ballObject;
	public opponent!: pongObject;
	private oldDate!: Date;
	private movespeed = 5;
	private gamespeed = 13;
	private timeoutId!: any;
	public gameSettings!: MatchSetting;
	private ballLock!: Mutex;
	private isMatchOngoing = true;
	public isSpectator = false;
	public specList!: Array<{username: string, img_url: string}>;
	private arbiterTimer = 1000;

	private scoreP1!: WowText;
	private scoreP2!: WowText;
	private fieldTexture!: Texture;
	private graphicElm!: Graphics;

	constructor(
		private websocketService: WebsocketService,
		private route: ActivatedRoute,
		private parent: AppComponent,
		private router: Router,
		private elRef: ElementRef,
		private assetManager: AssetManager,
		private fetchService: FetchService,
		private notifService: NotificationService
	) {
		this.fetchService.checkToken();
		if (!this.parent.isConnected())
			this.router.navigateByUrl('login');
		this.initApp()
	}

	ngOnDestroy(): void {
		if (this.client.connected)
			this.client.disconnect();
		this.app.ticker.stop();
	}

	ngAfterViewInit(): void {
		this.pixiContainer.nativeElement.appendChild(this.app.view);
		this.arbiterContainer.nativeElement.appendChild(this.arbiter.view);
	}

	initApp() {
		this.ballLock = new Mutex();
		this.app = new Application({
			height: 600,
			width: 1000,
			antialias: true,
		});

		this.initArbiter();
		this.specList = new Array();
		this.ball = new ballObject(this.app.view.width, this.app.view.height);
		this.player	= new pongObject(this.app.view.width, this.app.view.height);
		this.opponent = new pongObject(this.app.view.width, this.app.view.height);
		this.initObjects();
		this.setMatch(Number(this.route.snapshot.queryParamMap.get('match_id')));
		this.oldDate = new Date();
		this.app.ticker.add(() => {
			const date = new Date();
			this.update((date.getTime() - this.oldDate.getTime()) / this.gamespeed);
			this.oldDate = new Date();
		});
	}

	initArbiter() {
		this.arbiter = new Application({
			height: 100,
			width: 1000,
			antialias: true,
		});
	}

	setMatch(match_id: number) {
		if (this.client)
			this.client.close();
		this.client = io('ws://localhost:3005?match_id=' + match_id, this.websocketService.getHeader());
		this.client.on('onPlayerMove', (event) => { this.updatePlayer(event); });
		this.client.on('onOpponentMove', (event) => { this.updateOpponent(event); });
		this.client.on('onBallCollide', (event) => { this.updateBall(event); });
		this.client.on('startMatch', (event) => { this.startMatch(event); });
		this.client.on('onPlayerReady', (event) => { });
		this.client.on('onOpponentReady', (event) => { });
		this.client.on('onScoreChange', (event) => { this.updateScore(event); });
		this.client.on('onMatchEnd', (event) => {this.endMatch(event);});
		this.client.on('spectateMatch', (event) => { this.setSpectate(event); });
		this.client.on('onSpectateMatch', (event) => { this.addSpectate(event); });
		this.client.on('onUnspectateMatch', (event) => { this.removeSpectate(event); });
		this.client.on('onRecieveProfile', (event) => { this.setProfile(event); });
		this.client.emit('getProfiles');
	}

	setSpectate(event: any) {
		this.isSpectator = true;
		this.gameSettings = event.matchSetting;
		this.ball.setPos(event.ballPos);
		this.ball.direction = event.ballDir;
		this.player.setPos(event.playerPos.x, event.playerPos.y);
		this.player.score = event.playerScore;
		this.opponent.setPos(event.opponentPos.x, event.opponentPos.y);
		this.opponent.score = event.opponentScore;
		this.scoreP1.setText(this.player.score.toString());
		this.scoreP2.setText(this.opponent.score.toString());
	}

	async setProfile(event: {player: AnyProfileUser, opponent: AnyProfileUser}) {
		const skinRepo = await this.fetchService.getAllSkins();
		const skins = event.player.current_skins;
		this.player.user = event.player;
		this.player.setTexture(await this.getSkin(skins[0], skinRepo));
		this.ball.setTexture(await this.getSkin(skins[1], skinRepo));
		if (skins[2] != 3)
			this.fieldTexture = await this.getSkin(skins[2], skinRepo);
		this.drawBG();
		this.opponent.user = event.opponent;
		this.opponent.setTexture(await this.getSkin(this.opponent.user.current_skins[0], skinRepo));
	}

	async getSkin(skin_id: number, skinRepo: ShopItem[]): Promise<Texture> {
		let skin_name: string = '';
		skinRepo.forEach(skin => {
			if (skin.skin_id == skin_id)
				skin_name = skin.name;
		});
		if (skin_name.length > 0)
			return await this.assetManager.getAsset(skin_name);
		return await this.assetManager.getAsset('SkinDefault');
	}

	addSpectate(event: {username: string, img_url: string}) {
		this.specList.push(event);
	}

	removeSpectate(event: {username: string}) {
		this.specList = this.specList.filter((user) => user.username != event.username);
	}

	startMatch(settings: MatchSetting) {
		this.gameSettings = settings;
		this.assetManager.addCountdown(400);
	}

	setReady() {
		const removeElm = this.elRef.nativeElement.querySelector('#removable-ready');
		if (removeElm)
			removeElm.remove();
		this.client.emit('ready');
	}

	redirect(path: string) {
		this.router.navigateByUrl(path);
	}

	buildNotif(type: string, target_name: string, target_id: number) : NotificationRequest {
		return {type : type, target_id : target_id, target_name : target_name};
	}

	rematch() {
		this.notifService.client.emit('inviteRequest', this.buildNotif("match", this.opponent.user.username, this.opponent.user.user_id));
	}

	endMatch(event: GameEnd) {
		const profileElm = this.elRef.nativeElement.querySelector('#removable-profile');
		const matchElm = this.elRef.nativeElement.querySelector('#removable-match');
		const rematchElm = this.elRef.nativeElement.querySelector('#removable-rematch');
		profileElm.classList.add("show");
		if (matchElm) matchElm.classList.add("show");
		if (rematchElm) rematchElm.classList.add("show");
		if (event.state == this.WIN)
			this.assetManager.addEndMessage('You Win');
		if (event.state == this.LOSS)
			this.assetManager.addEndMessage('You Lose');
		if (event.reason == 'score') {
			if (event.state == this.WIN)
			{
				if (!this.isSpectator && this.parent && this.parent.myProfile && this.parent.myProfile.currency)
					this.parent.updateThunes(this.parent.myProfile?.currency + 10);
				this.scoreP1.setText("10");
				if (this.isSpectator)
					this.assetManager.addPanningText(this.player.user.username + " wins");
				else
					this.assetManager.addPanningText("You win ! Wow, you're such a CHAD * ੈ✩‧₊˚*˚(～ᗒ◡ᗕ)～˚* ੈ✩‧₊");
			}
			else if (event.state == this.LOSS)
			{
				this.scoreP2.setText("10");
				if (this.isSpectator)
					this.assetManager.addPanningText(this.opponent.user.username + " wins");
				else
					this.assetManager.addPanningText("You lost ! Oh well time for a drink ? ﾍ(ᗒ◡ᗕ)ﾉ c[_]");
			}
		}
		else {
			if (event.state == this.WIN)
				this.assetManager.addPanningText(this.opponent.user.username + " gave up the game, shame !");
			else
				this.assetManager.addPanningText(this.player.user.username + " gave up the game, shame !");
		}
		this.ballLock.waitForUnlock().then(() => {
			this.ballLock.acquire().then(() => {
				this.ball.setPos(this.ball.position(250, 150));
			})
			this.ballLock.release();
		});
		this.isMatchOngoing = false;
		if (this.client.connected)
			this.client.disconnect();
		const arrowElm = this.elRef.nativeElement.querySelector('.arrow-match');
		if (!arrowElm)
			return;
		if (arrowElm.classList.contains('right'))
			arrowElm.classList.remove('right');
		if (arrowElm.classList.contains('left'))
			arrowElm.classList.remove('left');
	}

	updateScore(event: ScoreChange) {
		this.arbiterTimer = 0;
		if (event.side == this.PLAYER_SCORED) {
			this.player.score++;
			if (this.player.score < 10) {
				this.slide(true);
				if (this.player.score + this.opponent.score == 1)
					this.assetManager.addPanningText(this.player.user.username + ' took the first point of the game ! (◕‿‿◕｡)');
				else if (this.player.score - this.opponent.score == 1)
					this.assetManager.addPanningText(this.player.user.username + ' takes the lead ! (～ᗒ◡ᗕ)～三二一');
				else if (this.opponent.score - this.player.score == 0)
					this.assetManager.addPanningText(this.player.user.username + ' is catching up ! (・◇・)');
				else if (this.player.score - this.opponent.score == 7)
					this.assetManager.addPanningText(this.opponent.user.username + ' is throwing the game ヽ(*´∀`)ﾉﾞ');
				else if (this.player.score - this.opponent.score == 5)
					this.assetManager.addPanningText(this.opponent.user.username + ' is weqwesting a pwoint (do you need a hug ?) ٩(⸝⸝⸝◕ั ௰ ◕ั⸝⸝⸝ )و');
				else if (this.player.score - this.opponent.score == 3)
					this.assetManager.addPanningText(this.player.user.username + ' is completely destroying the opposition ( ▀ 益 ▀ )');
				else
					this.assetManager.addPanningText(this.player.user.username + ' scored a point');
			}
		}
		else if (event.side == this.OPPONENT_SCORED) {
			this.opponent.score++;
			if (this.opponent.score < 10) {
				this.slide(false);
				if (this.opponent.score - this.player.score == 1)
					this.assetManager.addPanningText(this.opponent.user.username + ' takes the lead ! (～ᗒ◡ᗕ)～三二一');
				else if (this.opponent.score - this.player.score == 0)
					this.assetManager.addPanningText(this.player.user.username + ' lost the lead ! (╯°□°)╯︵ ┻━┻');
				else if (this.opponent.score - this.player.score == 1)
					this.assetManager.addPanningText(this.player.user.username + ' can\'t focus right now (╬●∀●)');
				else if (this.player.score - this.opponent.score == -5)
					this.assetManager.addPanningText(this.player.user.username + ' seems like you\'re losing it, cheer up ! ٩(⸝⸝⸝◕ั ௰ ◕ั⸝⸝⸝ )و');
				else if (this.player.score - this.opponent.score == -3)
					this.assetManager.addPanningText(this.player.user.username + ' is getting further behind (⊙…⊙ )');
				else
					this.assetManager.addPanningText(this.opponent.user.username + ' scored a point');
			}
		}
		this.ballLock.waitForUnlock().then(() => {
			this.ballLock.acquire().then(() => {
				this.ball.graphic.clear();
				this.ball.setPos(this.ball.position(250, 150));
				if (this.opponent.score < 10 && this.player.score < 10)
					this.assetManager.addCountdown(400);
				this.ball.speed = 0;
			})
			this.ballLock.release();
		});
		this.scoreP1.setText(this.player.score.toString());
		this.scoreP2.setText(this.opponent.score.toString());
	}

	update(delta: number) {
		if (!this.gameSettings)
			return;
		if (this.isMatchOngoing) {
			if (this.player.inputs.ArrowUp)
				this.player.moveObject(this.player.position(0, -this.movespeed * delta));
			if (this.player.inputs.ArrowDown)
				this.player.moveObject(this.player.position(0, this.movespeed * delta));
			if (this.opponent.inputs.ArrowUp)
				this.opponent.moveObject(this.opponent.position(0, -this.movespeed * delta));
			if (this.opponent.inputs.ArrowDown)
				this.opponent.moveObject(this.opponent.position(0, this.movespeed * delta));
			this.ballLock.waitForUnlock().then(() => {
				this.ballLock.acquire().then(() => {
					this.ball.moveObject(delta);
				})
				this.ballLock.release();
			});
		}
		if (this.arbiterTimer >= 3000)
		{
			this.assetManager.addPanningText('This match is getting boring...（；￣ェ￣） (￣□￣)');
			this.arbiterTimer = -1;
		}
		if (this.arbiterTimer != -1)
			this.arbiterTimer += delta;
		this.assetManager.updateArbiter(delta);
	}

	updatePlayer(event: Move) {
		this.player.setPos(event.posX, event.posY);
		this.player.inputs.ArrowUp = event.ArrowUp;
		this.player.inputs.ArrowDown = event.ArrowDown;
	}
	updateOpponent(event: Move) {
		this.opponent.setPos(event.posX + 490 - this.opponent.objDim.x / 2, event.posY);
		this.opponent.inputs.ArrowUp = event.ArrowUp;
		this.opponent.inputs.ArrowDown = event.ArrowDown;
	}
	async updateBall(event: VectorPos) {
		await this.ballLock.acquire().then(() => {
			this.ball.setPos(event.pos);
			this.ball.setDir(event.dir);
			this.ball.speed = 4;
		});
		this.ballLock.release();
	}

	async initObjects() {
		const style = await this.assetManager.initAssets();
		this.assetManager.setApp(this.arbiter);
		this.player.init(10, 250, 20, 100, 0x83d0c9);
		this.opponent.init(this.app.view.width - 30, 250, 20, 100, 0xFF0000);
		this.ball.init(500, 300, 10, 0xFFFFFF);
		this.graphicElm = new Graphics();
		this.drawBG();
		this.scoreP1 = new WowText('0', style.p1, 450, 50, this.app);
		this.scoreP1.setReverse(true);
		this.scoreP2 = new WowText('0', style.p2, 560, 50, this.app);
		this.app.stage.addChild(this.ball.graphic, this.player.graphic, this.opponent.graphic);
	}

	drawBG() {
		if (this.graphicElm)
			this.graphicElm.destroy();
		this.graphicElm = new Graphics();
		if (this.fieldTexture) {
			this.graphicElm.beginTextureFill({texture: this.fieldTexture});
			this.graphicElm.drawRect(0, 0, 1000, 600);
			this.graphicElm.endFill();
		}
		else {
			this.graphicElm.beginFill(0xFFFFFF, 0.8);
			this.graphicElm.drawRect(490, 0, 20, 250);
			this.graphicElm.drawRect(490, 350, 20, 250);
			this.graphicElm.endFill();
		}
		this.app.stage.addChildAt(this.graphicElm, 0);
	}

	@HostListener('window:keyup', ['$event'])
	handleKeyUp(event: KeyboardEvent) {
		if (this.isSpectator)
			return;
		const key = event.key;
		if (!this.client)
			return;
		if (key == 'ArrowUp' || key == 'z')
			this.client.emit('ArrowUp', false);
		if (key == 'ArrowDown' || key == 's')
			this.client.emit('ArrowDown', false);
	}

	@HostListener('window:keydown', ['$event'])
	handleKeyDown(event: KeyboardEvent) {
		if (this.isSpectator)
			return;
		const key = event.key;
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => {
			this.client.emit('ArrowUp', false);
			this.client.emit('ArrowDown', false);
		}, 500);
		if (!this.client)
			return;
		if ((key == 'ArrowUp' || key == 'z') && !this.player.inputs.ArrowUp)
			this.client.emit('ArrowUp', true);
		if ((key == 'ArrowDown' || key == 's') && !this.player.inputs.ArrowDown)
			this.client.emit('ArrowDown', true);
	}

	hideSpecWindow() {
		const specWin = this.elRef.nativeElement.querySelector('.specWindow');
		if (specWin.classList.contains('hide'))
			specWin.classList.remove('hide');
		else specWin.classList.add('hide');
	}

	slide(myTurn : boolean) {
		const arrowElm = this.elRef.nativeElement.querySelector('.arrow-match');
		if (!arrowElm)
			return;
		if (myTurn)
		{
			if (arrowElm.classList.contains('right'))
				arrowElm.classList.remove('right');
			if (!arrowElm.classList.contains('left'))
				arrowElm.classList.add('left');
		}
		else
		{
			if (arrowElm.classList.contains('left'))
				arrowElm.classList.remove('left');
			if (!arrowElm.classList.contains('right'))
				arrowElm.classList.add('right');
		}
	}
}
