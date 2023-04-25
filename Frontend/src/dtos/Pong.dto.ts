import { Graphics } from "pixi.js";

export interface Position {
	x: number;
	y: number;
}

export interface Move {
	ArrowUp: boolean;
	ArrowDown: boolean;
	posX: number;
	posY: number;
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
