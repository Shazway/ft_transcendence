import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { WebsocketService } from '../websocket.service';
import { Application, Graphics } from 'pixi.js';
import { pongObject, ballObject, Move, VectorPos, ScoreChange, GameEnd, Player } from 'src/dtos/Pong.dto';
import { ActivatedRoute } from '@angular/router';
import { MatchSetting } from 'src/dtos/MatchSetting.dto';
import { Mutex } from 'async-mutex';
import { AssetManager, WowText } from 'src/dtos/GraphElem.dto';

@Component({
	selector: 'app-pong',
	templateUrl: './pong.component.html',
	styleUrls: ['./pong.component.css']
})
export class PongComponent {
	@ViewChild('pixiContainer') pixiContainer!: ElementRef;
	@ViewChild('arbiterContainer') arbiterContainer!: ElementRef;
	PLAYER_SCORED = 1;
	OPPONENT_SCORED = 0;
	LOSS = 0;
	WIN = 1;
	private client!: Socket;
	private app!: Application;
	private arbiter!: Application;
	private player!: pongObject;
	private ball!: ballObject;
	private opponent!: pongObject;
	private oldDate!: Date;
	private movespeed = 5;
	private gamespeed = 13;
	private timeoutId!: any;
	private gameSettings!: MatchSetting;
	private ballLock!: Mutex;
	private isMatchOngoing = true;
	public isSpectator = false;
	public specList!: Array<Player>;

	private scoreP1!: WowText;
	private scoreP2!: WowText;
	private funkyText!: WowText;

	constructor(
		private websocketService: WebsocketService,
		private route: ActivatedRoute,
		private elRef: ElementRef,
		private assetManager: AssetManager,
	) {
		this.initApp()
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
		this.client.on('onBallCollide', (event) => { this.updateBall(event); if (this.isSpectator) console.log('BallCollide')});
		this.client.on('startMatch', (event) => { console.log('Match is starting ' + event); this.startMatch(event); });
		this.client.on('onPlayerReady', (event) => { console.log('You are ready '); });
		this.client.on('onOpponentReady', (event) => { console.log('Opponent is ready '); });
		this.client.on('onScoreChange', (event) => { this.updateScore(event); });
		this.client.on('onMatchEnd', (event) => {this.endMatch(event);});
		this.client.on('spectateMatch', (event) => { this.setSpectate(event); console.log('You are spectating '); });
		this.client.on('onSpectateMatch', (event) => { this.addSpectate(event); console.log('You are spectating '); });
		this.client.on('onUnspectateMatch', (event) => { this.removeSpectate(event); console.log('You are spectating '); });
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
	}

	addSpectate(event: Player) {
		this.specList.push(event);
	}

	removeSpectate(event: Player) {
		let playerIndex;
		this.specList.forEach((spec, index) => {
			if (spec.user_id == event.user_id)
				playerIndex = index;
		});
		if (playerIndex)
			this.specList.splice(playerIndex, 1);
	}

	startMatch(settings: MatchSetting) {
		this.gameSettings = settings;
	}

	setReady() {
		const removeElm = this.elRef.nativeElement.querySelector('#removable');
		if (removeElm)
			removeElm.remove();
		this.client.emit('ready');
	}

	endMatch(event: GameEnd) {
		if (event.reason == 'score') {
			if (event.state == this.WIN)
			{
				this.scoreP1.setText("10");
				console.log('You win');
			} //<-- faire des trucs avec un affichage mieux
			else if (event.state == this.LOSS)
			{
				this.scoreP2.setText("10");
				console.log('You lose');
			} //<-- faire des trucs aussi x)
		}
		this.ballLock.waitForUnlock().then(() => {
			this.ballLock.acquire().then(() => {
				this.ball.setPos(this.ball.position(250, 150));
			})
			this.ballLock.release();
		});	
		this.isMatchOngoing = false;
	}

	updateScore(event: ScoreChange) {
		if (event.side == this.PLAYER_SCORED)
			this.player.score++;
		else if (event.side == this.OPPONENT_SCORED)
			this.opponent.score++;
		this.ballLock.waitForUnlock().then(() => {
			this.ballLock.acquire().then(() => {
				this.ball.graphic.clear();
				this.ball.setPos(this.ball.position(250, 150));
				this.ball.speed = 0;
			})
			this.ballLock.release();
		});
		this.scoreP1.setText(this.player.score.toString());
		this.scoreP2.setText(this.opponent.score.toString());
	}

	closeEnoughPlayer() {
		return this.ball.graphic.x <= this.player.upperRightCorner.x + (this.ball.DIAMETER)
	}

	closeEnoughOpponent() {
		return this.ball.graphic.x >= this.opponent.upperLeftCorner.x - (this.ball.DIAMETER)
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
		this.player.init(10, 250, 20, 100, 0x83d0c9);
		this.opponent.init(this.app.view.width - 30, 250, 20, 100, 0xFF0000);
		this.ball.init(500, 300, 10, 0xFFFFFF);
		const graphicElm = new Graphics();
		graphicElm.beginFill(0xFFFFFF, 0.8);
		graphicElm.drawRect(490, 0, 20, 250);
		graphicElm.drawRect(490, 350, 20, 250);
		graphicElm.endFill();
		const style = await this.assetManager.initAssets();
		this.scoreP1 = new WowText('0', style.p1, 450, 50, this.app);
		this.scoreP1.setReverse(true);
		this.scoreP2 = new WowText('0', style.p2, 560, 50, this.app);
		// this.funkyText = new WowText('this is my fun text', style.funText, 100, 200, this.app);
		// this.funkyText.setRGB(true, 5000, 20);
		// this.funkyText.setWavy(true, 50, 50);
		this.app.stage.addChild(graphicElm, this.ball.graphic, this.player.graphic, this.opponent.graphic);
		// this.assetManager.addRuler(this.app);
	}

	@HostListener('window:keyup', ['$event'])
	handleKeyUp(event: KeyboardEvent) {
		if (this.isSpectator)
			return;
		const key = event.key;
		if (!this.client)
			return;
		if (key == 'ArrowUp')
			this.client.emit('ArrowUp', false);
		if (key == 'ArrowDown')
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
		if (key == 'ArrowUp' && !this.player.inputs.ArrowUp)
			this.client.emit('ArrowUp', true);
		if (key == 'ArrowDown' && !this.player.inputs.ArrowDown)
			this.client.emit('ArrowDown', true);
	}

	//DISPLAY FUNCTION
	hideSpecWindow() {
		const specWin = this.elRef.nativeElement.querySelector('.specWindow');
		if (specWin.classList.contains('hide'))
			specWin.classList.remove('hide');
		else specWin.classList.add('hide');
	}
}
