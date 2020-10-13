import fontXml from '!!file-loader!./assets/font/font2.fnt';
import Phaser from 'phaser';
import casette from './assets/audio/casette.mp3';
import music from './assets/audio/noise.mp3';
import sfxLong from './assets/audio/sfx_long.ogg';
import sfxShort1 from './assets/audio/sfx_short_1.ogg';
import sfxShort2 from './assets/audio/sfx_short_2.ogg';
import sfxShort3 from './assets/audio/sfx_short_3.ogg';
import fontImg from './assets/font/font2_0.png';
import * as images from './assets/images';
import fragShader from './assets/shader.frag.glsl';
import story from './assets/story';




export default class LoadingScene extends Phaser.Scene {
	constructor() {
		super({ key: 'loading' });
	}

	preload() {
		const borderOffset = 2;
		const width = this.scale.width * 0.5;;
		const height = 10;
		const x = this.scale.width * 0.25;
		const y = this.scale.height * 0.5 - height / 2;
		const border = this.add.graphics({
			lineStyle: {
				width: borderOffset,
				color: 0xffffff,
			}
		});
		const borderRect = new Phaser.Geom.Rectangle(
			x - borderOffset,
			y - borderOffset,
			width + borderOffset * 2,
			height + borderOffset * 2);
		border.strokeRectShape(borderRect);

		const progressbar = this.add.graphics();
		const updateProgressbar = percent => {
			progressbar.clear();
			progressbar.fillStyle(0xffffff, 1);
			progressbar.fillRect(x, y, percent * width, height);
		};

		this.load.bitmapFont('font', fontImg, fontXml);
		this.load.text('story', story);
		this.load.text('fragShader', fragShader);
		this.load.audio('music', [music]);
		this.load.audio('sfxShort1', [sfxShort1]);
		this.load.audio('sfxShort2', [sfxShort2]);
		this.load.audio('sfxShort3', [sfxShort3]);
		this.load.audio('sfxLong', [sfxLong]);
		this.load.audio('casette', [casette]);
		Object.entries(images).forEach(([key, value]) => this.load.image(key, value));

		this.load.on('progress', updateProgressbar);
		this.load.once('complete', () => {
			import('./GameScene').then(scene => {
				console.log(scene.default);
				this.scene.add('game', new scene.default(), true);
				this.scene.remove(this.key);
			});
		}, this);
	}
}
