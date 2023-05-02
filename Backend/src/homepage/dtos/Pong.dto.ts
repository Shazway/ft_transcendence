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
	DIAMETER: number;
	RADIUS: number;
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
		return math.distance([pos1.x, pos1.y], [pos2.x, pos2.y]);
	}

	collidesWithPlayer(player: pongObjectDto): boolean { //Check collision for player (left side player)
		const pos: Position = {x: this.pos.x, y: this.pos.y};

		const ret = (pos.x >= player.upperLeftCorner.x - (this.RADIUS / 2)
					&& pos.x <= player.upperRightCorner.x + (this.RADIUS / 2)
					&& pos.y >= player.upperRightCorner.y - (this.RADIUS / 2)
					&& pos.y <= player.lowerCorner.y + (this.RADIUS / 2));
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
		if (pos.x >= upperCorner.x && pos.x <= upperCorner.x + paddleSize.x) //Checking if the ball is in the range of the paddle slice
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
		if (pos.x <= upperCorner.x && pos.x >= upperCorner.x - paddleSize.x) //Checking if the ball is in the range of the paddle slice
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
		if (sinus >= 1 || sinus <= -1)
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
	public paddleSize: Position = this.position(0, 0);
	public gameDim = new Position();
	public objDim = new Position();
	public pos = new Position();
	public player: Player;
	public upperRightCorner = new Position();
	public upperLeftCorner = new Position();
	public lowerCorner = new Position();
	constructor(private gameWidth: number, private gameHeight: number) {
		this.gameDim = this.position(gameWidth / 2, gameHeight / 2);
		this.objDim = this.position(100, 20);
	}
	
	init(posX: number, posY: number, width: number, height: number, id: Player) {
		this.objDim.x = width;
		this.objDim.y = height;
		this.paddleSize = this.position(this.objDim.x / 2, this.objDim.y / 2);
		this.pos.x = posX / 2;
		this.pos.y = posY / 2;
		this.upperLeftCorner = this.position(this.pos.x, this.pos.y);
		this.upperRightCorner = this.position(this.pos.x + this.paddleSize.x, this.pos.y);
		this.lowerCorner = this.position(this.pos.x + this.paddleSize.x, this.pos.y + this.paddleSize.y);
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
		this.upperLeftCorner = this.position(this.pos.x, this.pos.y);
		this.upperRightCorner = this.position(this.pos.x + this.paddleSize.x, this.pos.y);
		this.lowerCorner = this.position(this.pos.x + this.paddleSize.x, this.pos.y + this.paddleSize.y);
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
