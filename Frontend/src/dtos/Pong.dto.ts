import { Graphics } from "pixi.js";

export interface Position {
	x: number;
	y: number;
}

export interface VectorPos {
	vec: Position;
	pos: Position;
}

export interface Move {
	ArrowUp: boolean;
	ArrowDown: boolean;
	posX: number;
	posY: number;
}

export class ballObjectDto {
	DIAMETER = 100;
	RADIUS = this.DIAMETER / 2;
	public speed = 2;
	public graphic = new Graphics();
	public color = 0xFFFFFF;
	public gameDim: Position;
	public vec: Position;
	constructor(
		private gameWidth: number,
		private gameHeight: number,
		) {
			this.vec = this.position(this.speed, this.speed);
			this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
	}

	position(newX: number, newY: number) : Position {
		return {x: newX, y: newY}
	}
	init(posX: number, posY: number, radius: number, color: number) {
		this.RADIUS = radius;
		this.DIAMETER = radius * 2;
		this.color = color;
		this.graphic.lineStyle(0);
		this.graphic.beginFill(color);
		this.graphic.drawCircle(posX, posY, this.RADIUS);
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
	checkXCollision(x: number) {
		if (x + this.RADIUS / 2 >= this.gameDim.x)
			this.vec.x = -this.speed;
		else if (x - this.RADIUS / 2 <= 0)
			this.vec.x = this.speed;
	}
	checkYCollision(y: number) {
		if (y + this.RADIUS / 2 >= this.gameDim.y)
			this.vec.y = -this.speed;
		else if (y - this.RADIUS / 2 <= 0)
			this.vec.y = this.speed;
	}

	checkWallCollision(newPos: Position) {
		this.checkXCollision(newPos.x);
		this.checkYCollision(newPos.y);
	}

	inRange(a : number, r1: number, r2: number)
	{
		return (a >= r1 && a <= r2)
	};

	collisionPaddle(player: pongObjectDto, opponent: pongObjectDto)
	{
		let pos: Position = {x: this.graphic.x, y: this.graphic.y};
		if (pos.x - (this.RADIUS / 2) <= player.objDim.x / 2 && this.inRange(pos.y, player.graphic.y, player.graphic.y + (player.objDim.y / 2)) )
			this.vec.x = this.speed;
		if (pos.x + (this.RADIUS / 2) >= this.gameDim.x - player.objDim.x / 2 && this.inRange(pos.y, opponent.graphic.y, opponent.graphic.y + (opponent.objDim.y / 2)) )
			this.vec.x = -this.speed;
	}

	setPos(pos: Position) {
		this.graphic.x = pos.x;
		this.graphic.y = pos.y;
	}

	setVec(pos: Position) {
		this.vec.x = pos.x;
		this.vec.y = pos.y;
	}

	moveObject(delta: number) { 
		let pos: Position = {x: this.graphic.x, y: this.graphic.y};

		this.checkWallCollision(this.position(pos.x, pos.y));
		this.applyMove(this.position(pos.x + (this.vec.x * delta), pos.y + (this.vec.y * delta)));
	}
}

export class pongObjectDto {
	public graphic = new Graphics();
	public inputs = {
		ArrowUp: false,
		ArrowDown: false,
	}
	public color = 0xFFFFFF;
	public gameDim: Position;
	public objDim: Position;
	constructor(
		private gameWidth: number,
		private gameHeight: number,
		) {
			this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
			this.objDim = this.position(this.graphic.width, this.graphic.height);
	}

	init(posX: number, posY: number, width: number, height: number, color: number) {
		this.objDim.x = width;
		this.objDim.y = height;
		this.color = color;
		this.graphic.beginFill(color);
		this.graphic.drawRect(posX, posY, width, height);
		this.graphic.endFill();
	}

	checkWallCollision(newPos: Position, playerDim: Position) {
		if (newPos.x < 0)
			newPos.x = 0;
		else if (newPos.x + playerDim.x > this.gameDim.x)
			newPos.x = this.gameDim.x - playerDim.x;
		if (newPos.y < 0)
			newPos.y = 0;
		else if (newPos.y + playerDim.y > this.gameDim.y)
			newPos.y = this.gameDim.y - playerDim.y;
		return newPos;
	}

	applyMove(newPos: Position, playerDim: Position) {
		this.graphic.clear();
		this.graphic.beginFill(this.color);
		this.graphic.drawRect(newPos.x, newPos.y, playerDim.x, playerDim.y);
		this.graphic.endFill();
		this.graphic.x = newPos.x;
		this.graphic.y = newPos.y;
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

		pos = this.checkWallCollision(this.position(pos.x + dir.x, pos.y + dir.y), this.position(width / 2, height / 2));
		this.applyMove(pos, this.objDim);
	}
}
