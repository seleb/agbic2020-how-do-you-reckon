import fontXml from '!!file-loader!./assets/font/font2.fnt';
import Phaser from 'phaser';
import sfxAlarm from './assets/audio/alarm.mp3';
import cassette from './assets/audio/cassette.mp3';
import sfxFlip from './assets/audio/flip.mp3';
import sfxGavel from './assets/audio/gavel.mp3';
import music from './assets/audio/noise.mp3';
import sfxNotification from './assets/audio/notification.mp3';
import sfxClick from './assets/audio/pen click.mp3';
import sfxScratch1 from './assets/audio/scratch1.mp3';
import sfxScratch2 from './assets/audio/scratch2.mp3';
import sfxScratch3 from './assets/audio/scratch3.mp3';
import sfxShort1 from './assets/audio/short1.mp3';
import sfxShort2 from './assets/audio/short2.mp3';
import sfxShort3 from './assets/audio/short3.mp3';
import sfxSnap from './assets/audio/snap.mp3';
import sfxSteps from './assets/audio/steps.mp3';
import sfxTrain from './assets/audio/train.mp3';
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
		this.load.audio('cassette', [cassette]);
		this.load.audio('sfxClick', [sfxClick]);
		this.load.audio('sfxScratch1', [sfxScratch1]);
		this.load.audio('sfxScratch2', [sfxScratch2]);
		this.load.audio('sfxScratch3', [sfxScratch3]);
		this.load.audio('sfxShort1', [sfxShort1]);
		this.load.audio('sfxShort2', [sfxShort2]);
		this.load.audio('sfxShort3', [sfxShort3]);
		this.load.audio('sfxTrain', [sfxTrain]);
		this.load.audio('sfxAlarm', [sfxAlarm]);
		this.load.audio('sfxNotification', [sfxNotification]);
		this.load.audio('sfxFlip', [sfxFlip]);
		this.load.audio('sfxGavel', [sfxGavel]);
		this.load.audio('sfxSteps', [sfxSteps]);
		this.load.audio('sfxSnap', [sfxSnap]);
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
