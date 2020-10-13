import Phaser from 'phaser';
import Strand from 'strand-core';
import Choice from './Choice';
import EventText from './EventText';
import Shader from './Shader';
import { size } from './size';

export class Settings {
	static speed = 1;
}

const initialFlags = {};

let flags = { ...initialFlags };

class StrandE extends Strand {
	constructor(options) {
		super(options);
		this.scene = options.scene;
		this.eyes = new Array(8).fill(0).map((_, idx) => {
			const eye = this.scene.add.image(0, 0, `eye${(idx % 4) + 1}`);
			eye.alpha = 0;
			eye.flipX = !!(Math.floor(idx / 4) % 2);
			return eye;
		});
	}

	speed(delta) {
		if (delta) {
			Settings.speed += delta;
		}
		return Settings.speed;
	}

	flag(flag, value) {
		if (value !== undefined) {
			flags[flag] = value;
		} else {
			return flags[flag];
		}
	}

	reset() {
		flags = { ...initialFlags };
	}

	image(img) {
		if (this.scene.activePortrait.texture.key === img) {
			return;
		}

		if (this.portraitTweens) {
			this.portraitTweens.forEach(t => t.stop());
		}

		const inactivePortrait = this.scene.inactivePortrait === this.scene.portraitA ? this.scene.portraitA : this.scene.portraitB;
		inactivePortrait.alpha = 0;
		const a = this.scene.add.tween({
			targets: inactivePortrait,
			alpha: 0.95,
			duration: 1000,
			ease: 'Sin.easeOut',
		});
		const b = this.scene.add.tween({
			targets: this.scene.activePortrait,
			alpha: 0,
			duration: 500,
			ease: 'Sin.easeIn',
		});
		this.portraitTweens = [a, b];
		this.scene.inactivePortrait = this.scene.activePortrait;
		this.scene.activePortrait = inactivePortrait;
		this.scene.activePortrait.setTexture(img);
	}

	startEyes() {
		this.eyesTweens = [];
		let eye = 0;
		this.eyeInterval = setInterval(() => {
			eye = (eye + 1) % this.eyes.length;
			const fadeOut = (eye + 3) % this.eyes.length;
			this.eyesTweens.push(
				this.scene.add.tween({
					targets: this.eyes[fadeOut],
					alpha: 0,
					duration: 6000,
					ease: 'Sin.easeIn',
				}),
				this.scene.add.tween({
					targets: this.eyes[fadeOut],
					scaleY: 0.75,
					duration: 6000,
					ease: 'Sin.easeOut',
				})
			);
			this.eyes[eye].x = size.x - 150 + size.x * 0.3 * (Math.random() - 0.5);
			this.eyes[eye].y = size.y - 300 / 2 - 22 + size.y * 0.75 * (Math.random() - 0.5);
			this.eyes[eye].scaleY = 0.5;
			this.scene.children.add(this.eyes[eye]);
			this.eyesTweens.push(
				this.scene.add.tween({
					targets: this.eyes[eye],
					alpha: 0.95,
					duration: 5000,
					ease: 'Sin.easeOut',
				}),
				this.scene.add.tween({
					targets: this.eyes[eye],
					scaleY: 1,
					duration: 4000,
					ease: 'Sin.easeOut',
				})
			);
		}, 1500);
	}

	stopEyes() {
		clearInterval(this.eyeInterval);
		this.eyesTweens.forEach(t => t.stop());
		this.eyesTweens = this.eyes.map(eye =>
			this.scene.add.tween({
				targets: eye,
				alpha: 0,
				duration: 500,
				ease: 'Sin.easeIn',
			})
		);
	}

	bg(img) {
		if (this.scene.activeBg.texture.key === img) {
			return;
		}

		if (this.bgTweens) {
			this.bgTweens.forEach(t => t.stop());
		}

		const inactiveBg = this.scene.inactiveBg === this.scene.bgA ? this.scene.bgA : this.scene.bgB;
		inactiveBg.alpha = 0;
		const a = this.scene.add.tween({
			targets: inactiveBg,
			alpha: 1,
			duration: 1000,
			ease: 'Sin.easeOut',
		});
		const b = this.scene.add.tween({
			targets: this.scene.activeBg,
			alpha: 0,
			duration: 500,
			ease: 'Sin.easeIn',
		});
		this.bgTweens = [a, b];
		this.scene.inactiveBg = this.scene.activeBg;
		this.scene.activeBg = inactiveBg;
		this.scene.activeBg.setTexture(img);
	}

	audio(sfx) {
		if (this.musicTween) {
			this.musicTween.stop();
		}
		const sound = this.scene.sound.add(sfx);
		this.musicTween = this.scene.add.tween({
			targets: this.scene.music,
			volume: 0.25,
			duration: 1000,
			ease: 'Cubic.easeInOut',
		});
		sound.play();
		sound.once('complete', () => {
			this.musicTween.stop();
			this.musicTween = this.scene.add.tween({
				targets: this.scene.music,
				volume: 1,
				duration: 1000,
				ease: 'Cubic.easeInOut',
			});
		});
	}
}

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game' });
	}
	create() {
		// HACK: there seems to a be a bug where button hit areas aren't respected
		// until the game has been resized; this fixes it
		this.game.scale.refresh();

		this.sound.pauseOnBlur = false;
		this.music = this.sound.add('music', {
			mute: false,
			volume: 0,
			// rate: 1,
			detune: 0,
			// seek: 0,
			loop: true,
		});
		this.music.play();
		this.add.tween({
			targets: this.music,
			volume: 1,
			duration: 8000,
			ease: 'Cubic.easeInOut',
		});

		// setup post-processing
		this.shader = this.game.renderer.addPipeline('Shader', new Shader(this.game));
		this.shader.setFloat2('resolution', this.scale.width, this.scale.height);
		this.cameras.main.setRenderToTexture(this.shader);

		this.bgA = this.add.image(size.x / 2, size.y / 2, '');
		this.bgB = this.add.image(size.x / 2, size.y / 2, '');
		this.bgA.alpha = 0;
		this.bgB.alpha = 0;
		this.activeBg = this.bgA;
		this.inactiveBg = this.bgB;
		this.portraitA = this.add.image(size.x - 150, size.y - 300 / 2 - 22, '');
		this.portraitB = this.add.image(size.x - 150, size.y - 300 / 2 - 22, '');
		this.portraitA.alpha = 0;
		this.portraitB.alpha = 0;
		this.activePortrait = this.portraitA;
		this.inactivePortrait = this.portraitB;
		this.scrim = this.add.image(this.scale.width / 2, this.scale.height / 2, 'scrim');
		this.choicesContainer = new Phaser.GameObjects.Container(this, 75, size.y * 0.66);
		this.add.existing(this.choicesContainer);
		this.frame = this.add.image(this.scale.width / 2, this.scale.height / 2, 'frame');

		this.eventText = new EventText(this);

		var texture = this.textures.createCanvas('gradient', this.scale.width * 2, this.scale.height);
		var context = texture.getContext();
		var grd = context.createLinearGradient(0, 0, this.scale.width * 2, 0);

		grd.addColorStop(0, 'rgb(0,0,0)');
		grd.addColorStop(0.5, 'rgb(0,0,0)');
		grd.addColorStop(1, 'rgba(0,0,0,0)');

		context.fillStyle = grd;
		context.fillRect(0, 0, texture.width, texture.height);

		texture.refresh();
		this.gradient = this.add.image(0, 0, 'gradient');
		this.gradient.setOrigin(0);

		this.tweens.add({
			targets: this.gradient,
			x: -texture.width,
			duration: 4000,
			delay: 500,
			ease: 'Power2',
			onComplete: () => {
				this.gradient.destroy();
			},
		});

		let canSkip = false;
		const skip = () => {
			if (canSkip) {
				this.eventText.finish();
				canSkip = false;
			}
		};
		this.input.on('pointerup', skip);
		this.input.keyboard.addKey('SPACE').on('down', skip);
		this.input.keyboard.addKey('ENTER').on('down', skip);
		var keyObj = this.input.keyboard.on('keydown', event => {
			if (choices[event.key - 1]) {
				choices[event.key - 1].emit('click');
			} else if (parseInt(event.key, 10) <= 4) {
				skip();
			}
		});
		keyObj.on('down', event => {
			scene -= 1;
			if (scene < 0) {
				scene += scenes.length;
			}
			this.activePortrait.setTexture(scenes[scene]);
		});
		const choices = [];
		this.renderer = {
			displayPassage: async passage => {
				choices.forEach(choice => choice.destroy());
				choices.length = 0;
				const compiledPassage = this.strand.execute(passage.program);
				const text = compiledPassage
					.filter(({ name }) => name === 'text')
					.map(({ value }) => value)
					.join('')
					.trim();
				const options = compiledPassage.filter(({ name }) => name === 'action');
				canSkip = true;
				await this.eventText.setText(text);
				canSkip = false;
				let yOffset = 0;
				this.choicesContainer.y = size.y - 35;
				choices.push(
					...options.map(({ value: { text, action } }, idx) => {
						var c = new Choice(this, `${idx + 1}.${text}`);
						this.choicesContainer.add(c);
						this.choicesContainer.y -= c.height;
						c.setPosition(0, yOffset);
						yOffset += c.height;
						c.on('click', () => {
							this.strand.eval(action);
							this.sound.play('sfxLong', {
								detune: Math.random() * 200 + 100,
							});
						});
						c.alpha = 0;
						this.add.tween({
							targets: c,
							alpha: 1,
							delay: idx * (3 - Settings.speed) * 50,
							duration: (3 - Settings.speed) * 500,
							ease: 'Power2',
						});
						return c;
					})
				);
			},
		};

		this.strand = new StrandE({
			scene: this,
			renderer: this.renderer,
			source: this.cache.text.get('story').replace(/<<BR(.*?)>>/gi, function (_, text, pos) {
				return `[[${text.trim() || 'Continue'}|this.goto('break:${pos}')]]\n::break:${pos}`;
			}),
		});
		this.strand.goto('start');
	}

	update(time) {
		this.shader.setFloat1('time', time);
	}
}
