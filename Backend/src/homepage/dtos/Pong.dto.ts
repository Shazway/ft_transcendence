/* eslint-disable prettier/prettier */
import { Player } from './Matchmaking.dto';
import * as math from "mathjs"

export class Position {
	x: number;
	y: number;
}

export class VectorPos {
	pos: Position;
	dir: number;
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
	public speed = 4;
	public pos = new Position();
	public gameDim: Position;
	public direction: number;
	public vec: Position;
	constructor(private gameWidth: number, private gameHeight: number) {
		this.direction = Math.PI/4;
		this.vec = this.updateVec(1);
		this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
	}

	position(newX: number, newY: number): Position {
		return { x: newX, y: newY };
	}

	init(posX: number, posY: number, radius: number) {
		this.RADIUS = radius;
		this.DIAMETER = radius * 2;
		this.pos.x = posX / 2;
		this.pos.y = posY / 2;
	}

	applyMove(newPos: Position) {
		this.pos.x = newPos.x;
		this.pos.y = newPos.y;
	}

	checkWallCollision(newPos: Position) {
		if (newPos.x - (this.RADIUS / 2) <= 0 || newPos.x + (this.RADIUS / 2) >= this.gameDim.x)
		this.direction = Math.PI -this.direction;

		if (newPos.y - (this.RADIUS / 2) <= 0 || newPos.y + (this.RADIUS / 2) >= this.gameDim.y)
		this.direction = -this.direction;
	}
	
	hypothenuse(x : number, y : number)
	{
		const res = x * x + y * y;
		return (Math.sqrt(res));
	}

	inRange(a: number, r1: number, r2: number) {
		return a >= r1 && a <= r2;
	}
	
	goingUp(pos: Position) {
		return this.vec.y <= pos.y;
	}
	
	distancePos(pos1: Position, pos2: Position) { //Easier to write distance comparing
		return Math.abs(Number(math.distance([pos1.x, pos1.y], [pos2.x, pos2.y])));
	}

	collidesWithOpponent(opponent: pongObjectDto): boolean { //Check collision for opponent (right side player)
		const paddleSize = this.position(opponent.objDim.x / 2, opponent.objDim.y / 2);
		const upperCorner : Position = {x: opponent.pos.x, y: opponent.pos.y}
		const lowerCorner : Position = {x: opponent.pos.x, y: opponent.pos.y + paddleSize.y}
		const pos: Position = {x: this.pos.x, y: this.pos.y};

		const ret = (
			this.distancePos(this.vec, upperCorner) <= (this.RADIUS / 2) || // Checking corners
			this.distancePos(this.vec, lowerCorner) <= (this.RADIUS / 2) ||
			((Math.abs(upperCorner.x - pos.x) <= this.RADIUS / 2) && //Checking face or upper and lower sides
			this.vec.y >= upperCorner.y &&
			this.vec.y <= lowerCorner.y) ||
			(pos.y + this.RADIUS / 2 >= upperCorner.y &&
			pos.y - this.RADIUS / 2 <= lowerCorner.y &&
			this.vec.x >= upperCorner.x)
		)
		return ret;
	}

	collidesWithPlayer(player: pongObjectDto): boolean { //Check collision for player (left side player)
		const paddleSize = this.position(player.objDim.x / 2, player.objDim.y / 2);
		const upperCorner : Position = {x: player.pos.x + paddleSize.x, y: player.pos.y}
		const lowerCorner : Position = {x: player.pos.x + paddleSize.x, y: player.pos.y + paddleSize.y}
		const pos: Position = {x: this.pos.x, y: this.pos.y};

		const ret = (
			this.distancePos(this.vec, upperCorner) <= (this.RADIUS / 2) || // Checking corners
			this.distancePos(this.vec, lowerCorner) <= (this.RADIUS / 2) ||
			((Math.abs(upperCorner.x - pos.x) <= this.RADIUS / 2) && //Checking face or upper and lower sides
			this.vec.y >= upperCorner.y &&
			this.vec.y <= lowerCorner.y) ||
			(pos.y + this.RADIUS / 2 >= upperCorner.y &&
			pos.y - this.RADIUS / 2 <= lowerCorner.y &&
			this.vec.x <= upperCorner.x)
		)
		return ret;
	}
	
	changeDirectionOpponent(opponent: pongObjectDto)
	{
		const maxSinus = -0.8;
		const minSinus = -maxSinus;
		const paddleSize = this.position(opponent.objDim.x / 2, opponent.objDim.y / 2);
		const pos: Position = {x: this.pos.x, y: this.pos.y};
		const upperCorner : Position = {x: opponent.pos.x, y: opponent.pos.y}
		const lowerCorner : Position = {x: opponent.pos.x, y: opponent.pos.y + paddleSize.y}
		const middleFace : Position = {x: opponent.pos.x, y: opponent.pos.y + paddleSize.y / 2}
		
		let sinus = 1;
		if ((pos.x >= upperCorner.x && pos.x <= upperCorner.x + paddleSize.x) &&
		(pos.y + this.RADIUS / 2 >= upperCorner.y && pos.y - this.RADIUS / 2 <= lowerCorner.y)) //Checking if the ball is in the range of the paddle slice
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
		if (sinus == 1)
		return ;
		this.direction = Math.PI - Math.asin(sinus);
	}
	
	changeDirectionPlayer(player: pongObjectDto)
	{
		const maxSinus = 0.8;
		const minSinus = -maxSinus;
		const paddleSize = this.position(player.objDim.x / 2, player.objDim.y / 2);
		const pos: Position = {x: this.pos.x, y: this.pos.y};
		const upperCorner : Position = {x: player.pos.x + paddleSize.x, y: player.pos.y}
		const lowerCorner : Position = {x: player.pos.x + paddleSize.x, y: player.pos.y + paddleSize.y}
		const middleFace : Position = {x: player.pos.x + paddleSize.x, y: player.pos.y + paddleSize.y / 2}
		
		let sinus = 1;
		if ((pos.x <= upperCorner.x && pos.x >= upperCorner.x - paddleSize.x) &&
		(pos.y + this.RADIUS / 2 >= upperCorner.y && pos.y - this.RADIUS / 2 <= lowerCorner.y)) //Checking if the ball is in the range of the paddle slice
		{
			if ((this.goingUp(pos) && this.distancePos(pos, lowerCorner) < this.distancePos(pos, upperCorner)) || //Checking if the ball is going towards the slice (lower or upper)
			(!this.goingUp(pos)) && this.distancePos(pos, lowerCorner) > this.distancePos(pos, upperCorner))
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
			sinus = (middleFace.y - pos.y) * (maxSinus * 2) / (player.objDim.y / 2); // The rest of the paddle (front face)
		if (sinus == 1)
			return ;
		this.direction = -Math.asin(sinus); // New angle to apply
	}

	updateVec(delta: number): Position {
		this.vec = this.position(this.pos.x + (this.speed * delta * Math.cos(this.direction)), this.pos.y + (this.speed * delta * Math.sin(this.direction)));
		return this.vec;
	}

	moveObject(delta: number) {
		this.checkWallCollision(this.updateVec(delta));
		this.direction = this.direction % (Math.PI * 2);
		this.applyMove(this.updateVec(delta));
		this.updateVec(delta);
	}

	getMovement(): VectorPos {
		return {
			pos: this.pos,
			dir: this.direction,
		};
	}

	getMovementMirrored(): VectorPos {
		return {
			pos: this.position(this.gameDim.x - this.pos.x, this.pos.y),
			dir: Math.PI - this.direction,
		};
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
		this.pos.x = posX / 2;
		this.pos.y = posY / 2;
		this.player = id;
	}

	checkWallCollision(newPos: Position, playerDim: Position) {
		if (newPos.y < 0)
			newPos.y = 0;
		else if (newPos.y + playerDim.y > this.gameDim.y)
			newPos.y = this.gameDim.y - playerDim.y;
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
