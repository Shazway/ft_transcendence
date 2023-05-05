import { Graphics } from "pixi.js";
import * as math from "mathjs"

export interface Position {
	x: number;
	y: number;
}

export interface ScoreChange {
	side: number;
	dir: number;
}

export interface GameEnd {
	state: number;
}

export interface VectorPos {
	pos: Position;
	dir: number;
}

export interface Move {
	ArrowUp: boolean;
	ArrowDown: boolean;
	posX: number;
	posY: number;
}

export class ballObject {
	DIAMETER!: number;
	RADIUS!: number;
	public speed = 4;
	public graphic = new Graphics();
	public color = 0xFFFFFF;
	public gameDim: Position;
	public direction: number;
	public vec: Position;
	constructor(
		private gameWidth: number,
		private gameHeight: number,
	) {
		this.direction = Math.PI/4;
		this.vec = this.updateVec(1);
		this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
	}

	position(newX: number, newY: number) : Position {
		return {x: newX, y: newY}
	}

	init(posX: number, posY: number, radius: number, color: number) {
		this.RADIUS = radius;
		this.DIAMETER = radius * 2;
		this.color = color;
		this.graphic.x = posX / 2;
		this.graphic.y = posY / 2;
		this.graphic.lineStyle(0);
		this.graphic.beginFill(color);
		this.graphic.drawCircle(posX / 2, posY / 2, this.RADIUS);
		this.graphic.endFill();
	}

	applyMove(newPos: Position) {
		this.graphic.clear();
		this.graphic.lineStyle(0);
		this.graphic.beginFill(this.color);
		this.graphic.drawCircle(newPos.x, newPos.y, this.RADIUS);
		this.graphic.endFill();
		this.graphic.x = newPos.x;
		this.graphic.y = newPos.y;
	}


	checkWallCollision(newPos: Position) {
		if (newPos.x - (this.RADIUS / 2) <= 0 || newPos.x + (this.RADIUS / 2) >= this.gameDim.x)
		this.direction = Math.PI -this.direction;

		if (newPos.y - (this.RADIUS / 2) <= 0 || newPos.y + (this.RADIUS / 2) >= this.gameDim.y)
		this.direction = -this.direction;
	}

	hypothenuse(x : number, y : number)
	{
		let res : number;
		res = x * x + y * y;
		return (Math.sqrt(res));
	}

	inRange(a : number, r1: number, r2: number)
	{
		return (a >= r1 && a <= r2)
	}

	goingUp(pos: Position) {
		return this.vec.y <= pos.y;
	}

	distancePos(pos1: Position, pos2: Position) { //Easier to write distance comparing
		return Number(math.distance([pos1.x, pos1.y], [pos2.x, pos2.y]));
	}

	collidesWithPlayer(player: pongObject): boolean { //Check collision for player (left side player)
		const pos: Position = {x: this.graphic.x, y: this.graphic.y};

		const ret = (pos.x >= player.upperLeftCorner.x - (this.RADIUS / 2)
					&& pos.x <= player.upperRightCorner.x + (this.RADIUS / 2)
					&& pos.y >= player.upperRightCorner.y - (this.RADIUS / 2)
					&& pos.y <= player.lowerCorner.y + (this.RADIUS / 2));
		return ret;
	}

	changeDirectionOpponent(opponent: pongObject)
	{
		const maxSinus = -0.8;
		const minSinus = -maxSinus;
		const paddleSize = this.position(opponent.objDim.x / 2, opponent.objDim.y / 2);
		const pos: Position = {x: this.graphic.x, y: this.graphic.y};
		const upperCorner : Position = {x: opponent.graphic.x, y: opponent.graphic.y}
		const lowerCorner : Position = {x: opponent.graphic.x, y: opponent.graphic.y + paddleSize.y}
		const middleFace : Position = {x: opponent.graphic.x, y: opponent.graphic.y + paddleSize.y / 2}

		let sinus = 1;
		if ((pos.x >= upperCorner.x && pos.x <= upperCorner.x + paddleSize.x)) //Checking if the ball is in the range of the paddle slice
		{
			if ((this.goingUp(pos) && this.distancePos(pos, lowerCorner) < this.distancePos(pos, upperCorner)) ||
			(!this.goingUp(pos)) && this.distancePos(pos, lowerCorner) > this.distancePos(pos, upperCorner)) //Checking if the ball is going towards the slice (lower or upper)
				this.direction = -this.direction; //Applying same direction change as wall, like the original pong
			return ;
		}
		if (this.inRange(pos.y, upperCorner.y - (this.RADIUS / 2), upperCorner.y)) // Upper corner direction change
		{
			if (this.hypothenuse(pos.x - upperCorner.x, pos.y - upperCorner.y) < (this.RADIUS / 2))
				sinus = maxSinus;
		}
		else if (this.inRange(pos.y, lowerCorner.y, lowerCorner.y + (this.RADIUS / 2))) // Lower corner direction change
		{
			if (this.hypothenuse(pos.x - lowerCorner.x, pos.y - lowerCorner.y) < (this.RADIUS / 2))
				sinus = minSinus;
		}
		else
			sinus = (middleFace.y - pos.y) * (maxSinus * 2) / (opponent.objDim.y / 2); // The rest of the paddle (front face)
		if (sinus >= 1 || sinus <= -1)
			return ;
		this.direction = Math.PI - Math.asin(sinus);
	}

	printGameState(key: string) {
		console.error("Key: " + key);
		console.log("dir: " + this.direction);
		console.log("posX: " + this.graphic.x);
		console.log("posY: " + this.graphic.y);
		console.log("vexX: " + this.vec.x);
		console.log("vexY: " + this.vec.y);
	}

	changeDirectionPlayer(player: pongObject)
	{
		//if (Number.isNaN(this.direction)) this.printGameState('1');
		const maxSinus = 0.8;
		const minSinus = -maxSinus;
		const paddleSize = this.position(player.objDim.x / 2, player.objDim.y / 2);
		const pos: Position = {x: this.graphic.x, y: this.graphic.y};
		const upperCorner : Position = {x: player.graphic.x + paddleSize.x, y: player.graphic.y}
		const lowerCorner : Position = {x: player.graphic.x + paddleSize.x, y: player.graphic.y + paddleSize.y}
		const middleFace : Position = {x: player.graphic.x + paddleSize.x, y: player.graphic.y + paddleSize.y / 2}

		let sinus = 1;
		if ((pos.x <= upperCorner.x && pos.x >= upperCorner.x - paddleSize.x)) //Checking if the ball is in the range of the paddle slice
		{
			if ((this.goingUp(pos) && this.distancePos(pos, lowerCorner) < this.distancePos(pos, upperCorner)) || //Checking if the ball is going towards the slice (lower or upper)
			(!this.goingUp(pos)) && this.distancePos(pos, lowerCorner) > this.distancePos(pos, upperCorner))
			{
				this.direction = -this.direction; //Applying same direction change as wall, like the original pong
				//if (Number.isNaN(this.direction)) this.printGameState('2');
			}
			return ;
		}
		if (this.inRange(pos.y, upperCorner.y - (this.RADIUS / 2), upperCorner.y)) // Upper corner direction change
		{
			if (this.hypothenuse(pos.x - upperCorner.x, pos.y - upperCorner.y) < (this.RADIUS / 2))
				sinus = maxSinus;
		}
		else if (this.inRange(pos.y, lowerCorner.y, lowerCorner.y + (this.RADIUS / 2))) // Lower corner direction change
		{
			if (this.hypothenuse(pos.x - lowerCorner.x, pos.y - lowerCorner.y) < (this.RADIUS / 2))
					sinus = minSinus;
		}
		else
			sinus = (middleFace.y - pos.y) * (maxSinus * 2) / (player.objDim.y / 2); // The rest of the paddle (front face)
		if (sinus >= 1 || sinus <= -1)
			return ;
		this.direction = -Math.asin(sinus); // New angle to apply
	//	if (Number.isNaN(this.direction)) this.printGameState('3');
	}

	setPos(pos: Position) {
		this.graphic.x = pos.x;
		this.graphic.y = pos.y;
	}

	setDir(dir: number) {
		this.direction = dir;
		//if (Number.isNaN(this.direction)) this.printGameState('4');
	}

	updateVec(delta: number): Position {
		this.vec = this.position(this.graphic.x + (this.speed * delta * Math.cos(this.direction)), this.graphic.y + (this.speed * delta * Math.sin(this.direction)));
		return this.vec;
	}

	moveObject(delta: number) {
		this.checkWallCollision(this.updateVec(delta));
		this.applyMove(this.updateVec(delta));
		this.updateVec(delta);
	}
}

export class pongObject {
	public graphic = new Graphics();
	public paddleSize: Position = this.position(0, 0);
	public upperRightCorner: Position = this.position(0, 0);
	public upperLeftCorner: Position = this.position(0, 0);
	public lowerCorner: Position = this.position(0, 0);
	public inputs = {
		ArrowUp: false,
		ArrowDown: false,
	}
	public color = 0xFFFFFF;
	public gameDim: Position;
	public objDim: Position;
	public score: number;
	constructor(
		private gameWidth: number,
		private gameHeight: number,
	) {
		this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
		this.objDim = this.position(this.graphic.width, this.graphic.height);
		this.score = 0;
	}

	init(posX: number, posY: number, width: number, height: number, color: number) {
		this.objDim.x = width;
		this.objDim.y = height;
		this.paddleSize = this.position(this.objDim.x / 2, this.objDim.y / 2);
		this.color = color;
		this.graphic.x = posX / 2;
		this.graphic.y = posY / 2;
		this.upperLeftCorner = this.position(this.graphic.x, this.graphic.y);
		this.upperRightCorner = this.position(this.graphic.x + this.paddleSize.x, this.graphic.y);
		this.lowerCorner = this.position(this.graphic.x + this.paddleSize.x, this.graphic.y + this.paddleSize.y);
		this.graphic.beginFill(color);
		this.graphic.drawRect(posX / 2, posY / 2, width, height);
		this.graphic.endFill();
	}

	checkWallCollision(newPos: Position, playerDim: Position) {
		if (newPos.y < 0)
			newPos.y = 0;
		else if (newPos.y + playerDim.y > this.gameDim.y)
			newPos.y = this.gameDim.y - playerDim.y;
		return newPos;
	}

	applyMove(newPos: Position) {
		this.graphic.clear();
		this.graphic.beginFill(this.color);
		this.graphic.drawRect(newPos.x, newPos.y, this.objDim.x, this.objDim.y);
		this.graphic.endFill();
		this.graphic.x = newPos.x;
		this.graphic.y = newPos.y;
		this.upperLeftCorner = this.position(this.graphic.x, this.graphic.y);
		this.upperRightCorner = this.position(this.graphic.x + this.paddleSize.x, this.graphic.y);
		this.lowerCorner = this.position(this.graphic.x + this.paddleSize.x, this.graphic.y + this.paddleSize.y);
	}

	position(newX: number, newY: number) : Position {
		return {x: newX, y: newY}
	}

	setPos(posX: number, posY: number) {
		this.graphic.x = posX;
		this.graphic.y = posY;
	}

	moveObject(dir: Position) {
		let pos: Position = {x: this.graphic.x, y: this.graphic.y};
		const width = this.objDim.x;
		const height = this.objDim.y;

		pos = this.checkWallCollision(
			this.position(pos.x + dir.x, pos.y + dir.y),
			this.position(width / 2, height / 2)
		);
		this.applyMove(pos);
	}

	inRange(a : number, r1: number, r2: number)
	{
		return (a >= r1 && a <= r2);
	}
}
