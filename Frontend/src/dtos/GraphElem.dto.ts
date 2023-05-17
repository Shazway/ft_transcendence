import { Injectable } from "@angular/core";
import { TextStyle, Text, Application, Color } from "pixi.js";
import * as PIXI from "pixi.js";

@Injectable({
	providedIn: 'root'
})
export class AssetManager {
	async initAssets() {
		PIXI.Assets.addBundle('fonts', {
			PixeloidSans: 'assets/PixeloidMono.ttf',
			PixeloidMono: 'assets/PixeloidMono.ttf',
			PixeloidSansBold: 'assets/PixeloidSansBold.ttf',
		});
		PIXI.Assets.add('SkinGradient' ,'assets/paddle-red-gradient.png');
		PIXI.Assets.add('SkinHotDog' ,'assets/raquette-hotdog.png');
		PIXI.Assets.add('SkinSwirl' ,'assets/Swirl.png');
		PIXI.Assets.add('SkinPoele' ,'assets/raquette-poele.png');
		PIXI.Assets.add('SkinBaguette' ,'assets/raquette-baguette.png');
		PIXI.Assets.add('SkinEclair' ,'assets/raquette-eclairAuChocolat.png');
		PIXI.Assets.add('SkinTorti' ,'assets/raquette-torti.png');
		PIXI.Assets.add('balleBallon' ,'assets/balle-ballon.png');
		PIXI.Assets.add('balleCitron' ,'assets/balle-tarteCitron.png');
		PIXI.Assets.add('balleFraise' ,'assets/balle-tarteFraise.png');
		return await PIXI.Assets.loadBundle('fonts').then(() => {
			return {
				p1: new TextStyle({ fontFamily: 'PixeloidSansBold', fontSize: 70, fill: 0xaaaaaa, align: 'right' }),
				p2: new TextStyle({ fontFamily: 'PixeloidSansBold', fontSize: 70, fill: 0xaaaaaa }),
				funText: new TextStyle({ fontFamily: 'PixeloidSansBold', fontSize: 30, fill: 0x660077 }),
			}
		});
	}

	async getAsset(key: string | string[]) {
		if (typeof key == 'string')
			return await PIXI.Assets.load(key);
		return await PIXI.Assets.load(key);
	}

	addRuler(app: Application) {
		const ruler = new PIXI.Graphics();
		for (let index = 0; index < 120; index++) {
			for (let index2 = 0; index2 < 80; index2++) {
				ruler.beginFill(0x555555);
				ruler.drawRect(index * 10, index2 * 10, 1, 1);
				ruler.endFill();
			}
		}
		app.stage.addChild(ruler);
	}
}

export class PlainText {
	public text: Text;
	private app: Application;

	constructor(content: string, style: TextStyle, posX: number, posY: number, app: Application) {
		this.text = new Text(content, style);
		this.text.x = posX;
		this.text.y = posY;
		this.app = app;
		this.app.stage.addChild(this.text);
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

	setReverse(rev: boolean) {
		this.isReverse = rev;
		this.resetSpacing();
		return this;
	}

	setText(newText: string) {
		let index = 0;
		const newTxt = newText.split('');
		while (this.text.length < newText.length) {
			const charac = new Text('0', this.style);
			charac.zIndex = 1;
			this.text.push(charac);
			this.app.stage.addChildAt(charac, 0);
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
				len -= PIXI.TextMetrics.measureText(charac.text, charac.style).width;
				charac.x = this.startPosX + len;
				charac.y = this.startPosY;
			})
		} else {
			this.text.forEach((charac) => {
				charac.x = this.startPosX + len;
				charac.y = this.startPosY;
				len += PIXI.TextMetrics.measureText(charac.text, charac.style).width;
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
			len += PIXI.TextMetrics.measureText(charac.text, charac.style).width;
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