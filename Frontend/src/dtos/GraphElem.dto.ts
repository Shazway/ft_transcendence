import { forEach } from "mathjs";
import { TextStyle, Text, Application, Color } from "pixi.js";
import * as PIXI from "pixi.js";

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
	private colorIndex = 0;
	private colorTime = 0;
	private colorDuration = 5;

	constructor(content: string, style: TextStyle, posX: number, posY: number, app: Application) {
		this.text = new Array();
		this.app = app;
		this.startPosX = posX;
		this.startPosY = posY;
		this.style = style;
		this.buildText(content);
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
	}

	setRGB(isRGB: boolean, frequency: number, delay: number) {
		this.isRGB = isRGB;
		this.isRGBDelay = delay;
		this.isRGBFrequency = frequency / this.colorArray.length;
		if (frequency < 500)
			this.isRGBFrequency = (500 / this.colorArray.length);
	}

	setWavy(isWavy: boolean, frequency: number, delay: number, amplitude: number) {
		this.isWavy = isWavy;
		this.isWavyDelay = delay;
		this.isWavyOrigin = this.text[0].y;
		this.isWavyFrequency = frequency * 1000;
		this.isWavyamplitude = amplitude;
		if (frequency < 0.5)
			this.isWavyFrequency = 500;
	}
}