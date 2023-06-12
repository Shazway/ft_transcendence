import { Injectable } from "@angular/core";
import { floor, round } from "mathjs";
import { TextStyle, Text, Application, Color, Assets, Graphics, TextMetrics } from "pixi.js";

@Injectable({
	providedIn: 'root'
})
export class AssetManager {
	app!: Application;
	countdown!: number;
	textArray: Array<{elem: PlainText | WowText, type: string}> = new Array;
	styles!: any;
	async initAssets() {
		// if (this.styles)
		// 	return;
		Assets.addBundle('fonts', {
			PixeloidSans: 'assets/Fonts/PixeloidMono.ttf',
			PixeloidMono: 'assets/Fonts/PixeloidMono.ttf',
			PixeloidSansBold: 'assets/Fonts/PixeloidSansBold.ttf',
		});
		Assets.add('Red gradient' ,'assets/Skins/Paddle/red-gradient.png');
		Assets.add('Default Paddle' ,'assets/Skins/Paddle/default.png');
		Assets.add('Swirl' ,'assets/Skins/Paddle/Swirl.png');
		Assets.add('Poêle' ,'assets/Skins/Paddle/poele.png');
		Assets.add('Baguette' ,'assets/Skins/Paddle/baguette.png');
		Assets.add('Éclair au chocolat' ,'assets/Skins/Paddle/eclairAuChocolat.png');
		Assets.add('Pasta' ,'assets/Skins/Paddle/torti.png');
		Assets.add('Beach ball' ,'assets/Skins/Ball/ballon.png');
		Assets.add('Lemon pie' ,'assets/Skins/Ball/tarteCitron.png');
		Assets.add('Default ball' ,'assets/Skins/Ball/default.png');
		Assets.add('Strawberry pie' ,'assets/Skins/Ball/tarteFraise.png');
		Assets.add('Cloudy sky' ,'assets/Skins/Background/cloudySky.png');
		Assets.add('Default field' ,'assets/Skins/Background/default.png');
		Assets.add('Nathan' ,'assets/Skins/Background/Nathan.png');
		Assets.add('Billard' ,'assets/Skins/Background/Pool.png');
		this.styles = await Assets.loadBundle('fonts').then(() => {
			return {
				p1: new TextStyle({ fontFamily: 'PixeloidSansBold', fontSize: 70, fill: 0xaaaaaa, align: 'right' }),
				p2: new TextStyle({ fontFamily: 'PixeloidSansBold', fontSize: 70, fill: 0xaaaaaa }),
				funText: new TextStyle({ fontFamily: 'PixeloidSansBold', fontSize: 30, fill: 0xffffff }),
			}
		});
		return this.styles;
	}

	async getAsset(key: string | string[]) {
		if (typeof key == 'string')
			return await Assets.load(key);
		return await Assets.load(key);
	}

	addRuler(app: Application) {
		const ruler = new Graphics();
		for (let index = 0; index < 120; index++) {
			for (let index2 = 0; index2 < 80; index2++) {
				ruler.beginFill(0x555555);
				ruler.drawRect(index * 10, index2 * 10, 1, 1);
				ruler.endFill();
			}
		}
		app.stage.addChild(ruler);
	}

	setApp(app: Application) {
		this.app = app;
	}

	addCountdown(timer: number) {
		this.countdown = timer;
		this.textArray = this.textArray.filter((elem) => {
			if (elem.type == 'count') {
				elem.elem.destroy()
				return false
			}
			return true
		});
		this.textArray.push({elem: new PlainText('', this.styles.funText, this.app.renderer.width/2, 10, this.app, 'center'), type: 'count'})
	}

	addPanningText(text: string) {
		this.textArray = this.textArray.filter((elem) => {
			if (elem.type == 'pan') {
				elem.elem.destroy()
				return false
			}
			return true
		});
		this.textArray.push({elem: new PlainText(text, this.styles.funText, this.app.renderer.width, 50, this.app), type: 'pan'})
	}

	addEndMessage(text: string) {
		this.textArray = this.textArray.filter((elem) => {
			if (elem.type == 'count') {
				elem.elem.destroy()
				return false
			}
			return true
		});
		this.textArray.push({elem: new PlainText(text, this.styles.funText, this.app.renderer.width/2, 10, this.app, 'center'), type: 'end'})
	}

	updateArbiter(delta: number) {
		if (this.countdown - delta < 0)
			this.textArray = this.textArray.filter((elem) => {
				if (elem.type == 'count') {
					elem.elem.destroy()
					return false
				}
				return true
			});
		if (this.countdown > 0)
			this.countdown -= delta;
		this.textArray.forEach(element => {
			if (element.type == 'count') {
				let value = floor(this.countdown / 100);
				if (value == 0) {
					element.elem.setPos(this.app.renderer.width/2 - 50, 10);
					element.elem.setText('GO');
				}
				else element.elem.setText(value.toString());
			}
			else if (element.type == 'pan') {
				element.elem.moveText(-5 * delta, 0);
			}
		});
	}
}

export class PlainText {
	public text: Text;
	public posX: number;
	public alignment: 'left' | 'center' | 'right';
	private app: Application;

	constructor(content: string, style: TextStyle, posX: number, posY: number, app: Application, alignment: 'left' | 'center' | 'right' = 'left') {
		this.text = new Text(content, style);
		this.posX = posX;
		this.text.y = posY;
		this.app = app;
		this.app.stage.addChild(this.text);
		this.alignment = alignment;
		this.realign();
	}

	realign() {
		const margin = TextMetrics.measureText(this.text.text, this.text.style).width;
		if (this.alignment == 'left')
			this.text.x = this.posX;
		if (this.alignment == 'center')
			this.text.x = this.posX - (margin / 2);
		if (this.alignment == 'right')
			this.text.x = this.posX - margin;
	}

	setText(newText: string) {
		if (this.text.text == newText)
			return;
		this.text.text = newText;
		this.realign();
	}

	moveText(panX: number, panY: number) {
		this.text.x += panX;
		this.posX += panX;
		this.text.y += panY;
	}

	setPos(posX: number, posY: number) {
		this.text.x = posX;
		this.text.y = posY;
	}

	clear() {

	}

	destroy() {
		this.app.stage.removeChild(this.text);
	}
}

export class WowText {
	public text: Array<Text>;
	public startPosX: number;
	public startPosY: number;
	private app: Application;
	private style: TextStyle;
	private isRGB = false;
	private isRGBDelay = 500;
	private isRGBFrequency = 5;
	private isWavy = false;
	private isWavyDelay = 500;
	private isWavyFrequency = 5;
	private isWavyOrigin = 0;
	private isWavyamplitude = 10;
	private colorArray = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
	private isReverse = false;

	constructor(content: string, style: TextStyle, posX: number, posY: number, app: Application) {
		this.text = new Array();
		this.app = app;
		this.startPosX = posX;
		this.startPosY = posY;
		this.style = style;
		this.setText(content);
	}

	destroy() {
		this.text.forEach(element => {
			this.app.stage.removeChild(element);
		});
	}

	moveText(panX: number, panY: number) {
		this.startPosX += panX;
		this.startPosY += panY;
	}

	setPos(posX: number, posY: number) {
		this.startPosX = posX;
		this.startPosY = posY;
	}

	setReverse(rev: boolean) {
		this.isReverse = rev;
		this.resetSpacing();
		return this;
	}

	setText(newText: string) {
		console.log('new text: ' + newText);
		let index = 0;
		const newTxt = newText.split('');
		while (this.text.length < newText.length) {
			console.log('created char');
			const charac = new Text('0', this.style);
			charac.zIndex = 1;
			this.text.push(charac);
			this.app.stage.addChild(charac);
		}
		for (; index < this.text.length; index++) {
			if (index < newText.length)
				this.text[this.text.length - index - 1].text = newTxt[newText.length - index - 1];
			else {
				this.text.splice(index);
				break;
			}
		}
		this.resetSpacing();
		return this;
	}

	LerpRGB (a: Color,b: Color,t: number)
	{
		return new Color
		({
			r: a.red + (b.red - a.red) * t,
			g: a.green + (b.green - a.green) * t,
			b: a.blue + (b.blue - a.blue) * t,
			a: a.alpha + (b.alpha - a.alpha) * t
		});
	}

	update() {
		if (!this.isRGB && !this.isWavy)
			return;
		const delta = new Date().getTime();
		let index = 0;
		this.text.forEach((char) => {
			if (this.isRGB) {
				const colorIndex1 = Math.floor((delta - (this.isRGBDelay * index)) / this.isRGBFrequency) % this.colorArray.length;
				const colorIndex2 = (colorIndex1 + 1) % this.colorArray.length;
				const t = ((delta - (this.isRGBDelay * index)) % this.isRGBFrequency) / this.isRGBFrequency;
				const color1 = this.colorArray[colorIndex1];
				const color2 = this.colorArray[colorIndex2];
				const r = Math.floor(color1[0] + (color2[0] - color1[0]) * t);
				const g = Math.floor(color1[1] + (color2[1] - color1[1]) * t);
				const b = Math.floor(color1[2] + (color2[2] - color1[2]) * t);
				const blendedColor = new Color({ r, g, b, a: 255 })
				char.tint = blendedColor;
			}
			if (this.isWavy) {
				char.y = this.isWavyOrigin + this.isWavyamplitude * Math.sin(10 * ((delta / (this.isWavyFrequency - this.isWavyDelay * index / 100) * 1000)));
			}
			index++;
		});
	}

	resetSpacing() {
		let len = 0;
		if (this.isReverse) {
			this.text.reverse().forEach((charac) => {
				len -= TextMetrics.measureText(charac.text, charac.style).width;
				charac.x = this.startPosX + len;
				charac.y = this.startPosY;
				console.log('posX = ' + charac.x + ', posY = ' + charac.y, ', text = ' + charac.text);
			})
			this.text.reverse();
		} else {
			this.text.forEach((charac) => {
				charac.x = this.startPosX + len;
				charac.y = this.startPosY;
				len += TextMetrics.measureText(charac.text, charac.style).width;
			})
		}
		return this;
	}

	buildText(content: string) {
		this.style.fontSize = 30;
		this.style.fill = 'white';
		this.text.splice(0);
		let len = 0;
		content.split('').forEach((char) => {
			const charac = new Text(char, this.style);
			charac.x = this.startPosX + len;
			charac.y = this.startPosY;
			this.text.push(charac);
			this.app.stage.addChild(charac);
			len += TextMetrics.measureText(charac.text, charac.style).width;
		})
		return this;
	}

	setRGB(isRGB: boolean, frequency: number, delay: number) {
		this.isRGB = isRGB;
		this.isRGBDelay = delay;
		this.isRGBFrequency = frequency / this.colorArray.length;
		if (frequency < 500)
			this.isRGBFrequency = (500 / this.colorArray.length);
		return this;
	}

	setWavy(isWavy: boolean, delay: number, amplitude: number) {
		this.isWavy = isWavy;
		this.isWavyDelay = delay;
		this.isWavyOrigin = this.text[0].y;
		this.isWavyFrequency = 2000 * 1000;
		this.isWavyamplitude = amplitude;
		return this;
	}
}
