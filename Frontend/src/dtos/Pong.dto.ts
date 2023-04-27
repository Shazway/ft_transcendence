import { ThisReceiver } from "@angular/compiler";
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

		if (pos.x - (this.RADIUS / 2) <= player.objDim.x / 2 && this.inRange(pos.y, player.graphic.y, player.graphic.y + (player.objDim.y / 2))) {
			this.vec.x = this.speed;

		}
		else if (pos.x + (this.RADIUS / 2) >= this.gameDim.x - player.objDim.x / 2 && this.inRange(pos.y, opponent.graphic.y, opponent.graphic.y + (opponent.objDim.y / 2)) )
			this.vec.x = -this.speed;
		// if (
		// 	pos.y - this.RADIUS / 2 <= player.objDim.y / 2 &&
		// 	this.inRange(pos.x, player.graphic.x, player.graphic.x + player.objDim.x / 2)
		// )
		// 	this.vec.y = this.speed;
		// else if (
		// 	pos.y + this.RADIUS / 2 >= this.gameDim.y - player.objDim.y / 2 &&
		// 	this.inRange(pos.x, opponent.graphic.x, opponent.graphic.x + opponent.objDim.x / 2)
		// )
		// 	this.vec.y = -this.speed;
	}

	hypothenuse(x : number, y : number)
	{
		let res : number;
		res = x * x + y * y;
		return (Math.sqrt(res));
	}

	collisionMarina(player: pongObjectDto)
	{
		const maxSinus = Math.sqrt(2) / 2;
		const minSinus = -maxSinus;
		const paddleSize = this.position(player.objDim.x / 2, player.objDim.y / 2);
		const pos: Position = {x: this.graphic.x, y: this.graphic.y};
		const upperCorner : Position = {x: player.graphic.x + paddleSize.x, y: player.graphic.y}
		const lowerCorner : Position = {x: player.graphic.x + paddleSize.x, y: player.graphic.y + paddleSize.y}
		const middleFace : Position = {x: player.graphic.x + paddleSize.x, y: player.graphic.y + paddleSize.y / 2}

		if (!(pos.x <= middleFace.x + (this.RADIUS / 2)))
			return ;

		let sinus = 1;

		//n'est pas dans la zone raquette elargie (+radius)
		if (!this.inRange(pos.y, upperCorner.y - (this.RADIUS / 2), lowerCorner.y + (this.RADIUS / 2)))
		{
			//console.log("n'est pas dans la zone raquette elargie (+radius)")
			return ;
		}
		//est dans la zone ou ca risque de toucher le coin superieur
		if (this.inRange(pos.y, upperCorner.y - (this.RADIUS / 2), upperCorner.y))
		{
			//console.log("est dans la zone ou ca risque de toucher le coin superieur");
			//il y a collision acvec le coin du haut
			if (this.hypothenuse(pos.x - upperCorner.x, pos.y - upperCorner.y) < (this.RADIUS / 2))
			{
			//	console.log("il y a collision avec le coin du haut")
				if (Math.abs((upperCorner.x - pos.x) / this.vec.x) <= Math.abs((upperCorner.y - pos.y) / this.vec.y))
					//face de la raquette
					sinus = maxSinus;
				else
				//tranche de la raquette
				{
					console.log("tranche du haut");
					this.vec.y = -this.vec.y;
					return ;
				}
			}
		}
		//est dans la zone ou ca risque de toucher le coin inferieur
		else if (this.inRange(pos.y, lowerCorner.y, lowerCorner.y + (this.RADIUS / 2)))
		{
			//console.log("est dans la zone ou ca risque de toucher le coin inferieur");
			//il y a collision acvec le coin du haut
			if (this.hypothenuse(pos.x - lowerCorner.x, pos.y - lowerCorner.y) < (this.RADIUS / 2))
			{
				if (Math.abs((lowerCorner.x - pos.x) / this.vec.x) <= Math.abs((lowerCorner.y - pos.y) / this.vec.y))
					//face de la raquette
					sinus = minSinus;
				else
					//tranche de la raquette
				{
					console.log("tranche du bas");
					this.vec.y = -Math.abs(this.vec.y);
				}
			}
		}
		//     TODO : mettre des print dans tous les if


		//est 100% dans la raquette, donc sinus compris entre -0.5 et 0.5
		else
		{
			sinus = (middleFace.y - pos.y) * maxSinus / (player.objDim.y / 2);
			//console.log("est 100% dans la raquette, donc sinus compris entre -0.5 et 0.5: ");
			console.log(sinus);
		}
		if (sinus == 1)
		{
			//console.log("n'a pas touche la raquette");
			return ;
		}
		const angle = Math.asin(sinus);
		this.vec.x = Math.cos(angle) * this.speed;
		this.vec.y = -sinus * this.speed;
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
		this.graphic.x = posX / 2;
		this.graphic.y = posY / 2;
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

	inRange(a : number, r1: number, r2: number)
	{
		return (a >= r1 && a <= r2);
	}

	// collideCheck(pos: Position, vec: Position) {
	// 	const impact = this.position(0, 0);
	// 	const touched = {x: false, y: false};

	// 	impact.x = pos.x + vec.x;
	// 	impact.y = pos.y + vec.y;
	// 	if (this.inRange(impact.x, this.graphic.x, this.graphic.x + this.objDim.x))
	// 		touched.x = true;
	// 	if (this.inRange(impact.y, this.graphic.y, this.graphic.y + this.objDim.y))
	// 		touched.y = true;
	// }
}
