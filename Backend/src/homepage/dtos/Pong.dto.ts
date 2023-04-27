/* eslint-disable prettier/prettier */
import { Player } from './Matchmaking.dto';

export class Position {
	x: number;
	y: number;
}

export class VectorPos {
	vec: Position;
	pos: Position;
}

export class Move {
	ArrowUp: boolean;
	ArrowDown: boolean;
	posX: number;
	posY: number;
}

export class ballObjectDto {
	DIAMETER = 100;
	RADIUS = this.DIAMETER / 2;
	public speed = 2;
	public pos = new Position();
	public color = 0xffffff;
	public gameDim: Position;
	public vec: Position;
	constructor(private gameWidth: number, private gameHeight: number) {
		this.vec = this.position(this.speed, this.speed);
		this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
	}

	position(newX: number, newY: number): Position {
		return { x: newX, y: newY };
	}

	init(posX: number, posY: number, radius: number) {
		this.RADIUS = radius;
		this.DIAMETER = radius * 2;
		this.pos.x = posX;
		this.pos.y = posY;
	}

	applyMove(newPos: Position) {
		this.pos.x = newPos.x;
		this.pos.y = newPos.y;
	}

	checkXCollision(x: number) {
		if (x + this.RADIUS / 2 >= this.gameDim.x) {
			this.vec.x = -this.speed;
			return true;
		} else if (x - this.RADIUS / 2 <= 0) {
			this.vec.x = this.speed;
			return true;
		}
		return false;
	}

	checkYCollision(y: number) {
		if (y + this.RADIUS / 2 >= this.gameDim.y) {
			this.vec.y = -this.speed;
			return true;
		} else if (y - this.RADIUS / 2 <= 0) {
			this.vec.y = this.speed;
			return true;
		}
		return false;
	}

	checkWallCollision(newPos: Position) {
		const ret1 = this.checkXCollision(newPos.x);
		const ret2 = this.checkYCollision(newPos.y);
		return ret1 || ret2;
	}

	getMovement(): VectorPos {
		return {
			vec: this.vec,
			pos: this.pos
		};
	}

	getMovementMirrored(): VectorPos {
		return {
			vec: this.position(this.vec.x * -1, this.vec.y),
			pos: this.position(this.gameDim.x - this.pos.x, this.pos.y)
		};
	}

	inRange(a: number, r1: number, r2: number) {
		return a >= r1 && a <= r2;
	}

	collisionPaddle(player: pongObjectDto, opponent: pongObjectDto) {
		let ret = false;
		if (
			this.pos.x - this.RADIUS / 2 <= player.objDim.x / 2 &&
			this.inRange(this.pos.y, player.pos.y, player.pos.y + player.objDim.y / 2)
		) {
			this.vec.x = this.speed;
			ret = true;
		}
		else if (
			this.pos.x + this.RADIUS / 2 >= this.gameDim.x - player.objDim.x / 2 &&
			this.inRange(this.pos.y, opponent.pos.y, opponent.pos.y + opponent.objDim.y / 2)
		) {
			this.vec.x = -this.speed;
			ret = true;
		}
		if (
			this.pos.y - this.RADIUS / 2 <= player.objDim.y / 2 &&
			this.inRange(this.pos.x, player.pos.x, player.pos.x + player.objDim.x / 2)
		)
		{
			this.vec.y = this.speed;
			ret = true;
		}
		else if (
			this.pos.y + this.RADIUS / 2 >= this.gameDim.y - player.objDim.y / 2 &&
			this.inRange(this.pos.x, opponent.pos.x, opponent.pos.x + opponent.objDim.x / 2)
		) {
			this.vec.y = -this.speed;
			ret = true;
		}
		return ret;
	}

	hypothenuse(x : number, y : number)
	{
		const res = x * x + y * y;
		return (Math.sqrt(res));
	}

	collisionMarina(player: pongObjectDto)
	{
		const pos: Position = {x: this.pos.x, y: this.pos.y};
		const upperCorner : Position = {x: player.pos.x + (player.objDim.x / 2), y: player.pos.y}
		const lowerCorner : Position = {x: player.pos.x + (player.objDim.x / 2), y: player.pos.y + (player.objDim.y / 2)}
		const middleFace : Position = {x: player.pos.x + (player.objDim.x / 2), y: player.pos.y + (player.objDim.y / 2) / 2}

		if (!(pos.x > middleFace.x && pos.x <= middleFace.x + this.vec.x))
			return false;
		
		let sinus = 1;

		//n'est pas dans la zone raquette elargie (+radius)
		if (!this.inRange(pos.y, player.pos.y - (this.RADIUS / 2), player.pos.y + (player.objDim.y / 2) + (this.RADIUS / 2)))
			return false;
		//est dans la zone ou ca risque de toucher le coin superieur
		if (this.inRange(pos.y, player.pos.y - (this.RADIUS / 2), player.pos.y))
		{
			//il y a collision acvec le coin du haut
			if (this.hypothenuse(pos.x - upperCorner.x + this.vec.x, pos.y - upperCorner.y + this.vec.y) < (this.RADIUS / 2) / 2)
				sinus = 0.5;
		}
		//est dans la zone ou ca risque de toucher le coin inferieur
		else if (this.inRange(pos.y, player.pos.y - (this.RADIUS / 2), player.pos.y))
		{
			//il y a collision acvec le coin du haut
			if (this.hypothenuse(pos.x - lowerCorner.x + this.vec.x, pos.y - lowerCorner.y + this.vec.y) < (this.RADIUS / 2) / 2)
				sinus = -0.5;
		}
		//est 100% dans la raquette, donc sinus compris entre -0.5 et 0.5
		else
			sinus = (middleFace.y - pos.y) / (player.objDim.y / 2);
		if (sinus == 1)
			return false;
		const angle = Math.asin(sinus);
		this.vec.x = Math.cos(angle) * this.speed;
		this.vec.y = sinus * this.speed;
		return true;
	}

	moveObject(delta: number) {
		const ret = this.checkWallCollision(this.position(this.pos.x, this.pos.y));
		this.applyMove(
			this.position(this.pos.x + this.vec.x * delta, this.pos.y + this.vec.y * delta)
		);
		return ret;
	}
}

export class pongObjectDto {
	public inputs = {
		ArrowUp: false,
		ArrowDown: false
	};
	public gameDim = new Position();
	public objDim = new Position();
	public pos = new Position();
	public player: Player;
	constructor(private gameWidth: number, private gameHeight: number) {
		this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
		this.objDim = this.position(100, 20);
	}

	init(posX: number, posY: number, width: number, height: number, id: Player) {
		this.objDim.x = width;
		this.objDim.y = height;
		this.pos.x = posX;
		this.pos.y = posY;
		this.player = id;
	}

	checkWallCollision(newPos: Position, playerDim: Position) {
		if (newPos.x < 0) newPos.x = 0;
		else if (newPos.x + playerDim.x > this.gameDim.x) newPos.x = this.gameDim.x - playerDim.x;
		if (newPos.y < 0) newPos.y = 0;
		else if (newPos.y + playerDim.y > this.gameDim.y) newPos.y = this.gameDim.y - playerDim.y;
		return newPos;
	}

	applyMove(newPos: Position) {
		this.pos.x = newPos.x;
		this.pos.y = newPos.y;
	}

	position(newX: number, newY: number): Position {
		return { x: newX, y: newY };
	}

	moveObject(dir: Position) {
		let pos: Position = { x: this.pos.x, y: this.pos.y };
		const width = this.objDim.x;
		const height = this.objDim.y;

		pos = this.checkWallCollision(
			this.position(pos.x + dir.x, pos.y + dir.y),
			this.position(width / 2, height / 2)
		);
		this.applyMove(pos);
	}
}
