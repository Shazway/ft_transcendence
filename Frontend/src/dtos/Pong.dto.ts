import { Graphics, Matrix, Texture } from "pixi.js";
import { distance } from "mathjs";
import { Socket } from "socket.io-client";
import { AnyProfileUser } from "./User.dto";

export interface Position {
	x: number;
	y: number;
}

export interface ScoreChange {
	side: number;
}

export interface GameEnd {
	state: number;
	reason: string;
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
	public speed = 0;
	public graphic = new Graphics();
	public color = 0xFFFFFF;
	public texture: Texture | undefined;
	public matrix!: Matrix;
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

	init(posX: number, posY: number, radius: number, color: number | Texture) {
		this.RADIUS = radius;
		this.DIAMETER = radius * 2;
		if (typeof color == 'number')
			this.color = color;
		else {
			this.texture = color;
			this.matrix = new Matrix();
			this.matrix.set(1, 0, 0, 1, posX / 2 - radius, posY / 2 - radius);
		}
		this.graphic.x = posX / 2;
		this.graphic.y = posY / 2;
		if (this.texture)
			this.graphic.beginTextureFill({texture: this.texture, matrix: this.matrix})
		else
			this.graphic.beginFill(this.color);
		this.graphic.drawCircle(posX / 2, posY / 2, this.RADIUS);
		this.graphic.endFill();
	}

	setTexture(tex: Texture) {
		this.texture = tex;
		this.matrix = new Matrix();
		this.matrix.set(1, 0, 0, 1, this.graphic.x, this.graphic.y);
		this.applyMove(this.position(this.graphic.x, this.graphic.y))
	}

	applyMove(newPos: Position) {
		this.graphic.clear();
		if (this.texture) {
			this.matrix.set(1, 0, 0, 1, newPos.x - this.RADIUS, newPos.y - this.RADIUS);
			this.graphic.beginTextureFill({texture: this.texture, matrix: this.matrix});
		}
		else
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

	goingUp(pos: Position) {
		return this.vec.y <= pos.y;
	}

	distancePos(pos1: Position, pos2: Position) { //Easier to write distance comparing
		return Number(distance([pos1.x, pos1.y], [pos2.x, pos2.y]));
	}

	setPos(pos: Position) {
		this.graphic.x = pos.x;
		this.graphic.y = pos.y;
	}

	setDir(dir: number) {
		this.direction = dir;
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
	public user!: AnyProfileUser;
	public inputs = {
		ArrowUp: false,
		ArrowDown: false,
	}
	public color = 0xFFFFFF;
	public texture: Texture | undefined;
	public matrix!: Matrix;
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

	init(posX: number, posY: number, width: number, height: number, color: number | Texture) {
		this.objDim.x = width;
		this.objDim.y = height;
		this.paddleSize = this.position(this.objDim.x / 2, this.objDim.y / 2);
		if (typeof color == 'number')
			this.color = color;
		else {
			this.texture = color;
			this.matrix = new Matrix();
			this.matrix.set(1, 0, 0, 1, posX / 2, posY / 2);
		}
		this.graphic.x = posX / 2;
		this.graphic.y = posY / 2;
		this.upperLeftCorner = this.position(this.graphic.x, this.graphic.y);
		this.upperRightCorner = this.position(this.graphic.x + this.paddleSize.x, this.graphic.y);
		this.lowerCorner = this.position(this.graphic.x + this.paddleSize.x, this.graphic.y + this.paddleSize.y);
		if (this.texture)
			this.graphic.beginTextureFill({texture: this.texture, matrix: this.matrix});
		else
			this.graphic.beginFill(this.color);
		this.graphic.drawRect(posX / 2, posY / 2, width, height);
		this.graphic.endFill();
	}

	setTexture(tex: Texture) {
		this.texture = tex;
		this.matrix = new Matrix();
		this.matrix.set(1, 0, 0, 1, this.graphic.x, this.graphic.y);
		this.applyMove(this.position(this.graphic.x, this.graphic.y))
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
		if (this.texture) {
			this.matrix.set(1, 0, 0, 1, newPos.x, newPos.y);
			this.graphic.beginTextureFill({texture: this.texture, matrix: this.matrix});
		}
		else
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
}
