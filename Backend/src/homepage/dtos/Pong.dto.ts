export class Position {
	x: number;
	y: number;
}

export class Move {
	ArrowUp: boolean;
	ArrowDown: boolean;
	posX: number;
	posY: number;
}

export class pongObjectDto {
	public inputs = {
		ArrowUp: false,
		ArrowDown: false,
	}
	public gameDim = new Position;
	public objDim = new Position;
	public pos = new Position;
	public player_id: number;
	constructor(
		private gameWidth: number,
		private gameHeight: number,
	) {
		this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
		this.objDim = this.position(100, 20);
	}

	init(posX: number, posY: number, width: number, height: number, id: number) {
		this.objDim.x = width;
		this.objDim.y = height;
		this.pos.x = posX;
		this.pos.y = posY;
		this.player_id = id;
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
		this.pos.x = newPos.x;
		this.pos.y = newPos.y;
	}

	position(newX: number, newY: number) : Position {
		return {x: newX, y: newY}
	}

	moveObject(dir: Position) {
		let pos: Position = {x: this.pos.x, y: this.pos.y};
		const width = this.objDim.x;
		const height = this.objDim.y;

		pos = this.checkWallCollision(this.position(pos.x + dir.x, pos.y + dir.y), this.position(width / 2, height / 2));
		this.applyMove(pos, this.objDim);
	}
}
