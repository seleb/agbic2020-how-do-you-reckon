import Phaser from "phaser";
import { characterCallback, getTextAnimationLength, wrap } from "./utils";

export default class EventText extends Phaser.GameObjects.DynamicBitmapText {
	constructor(scene) {
		super(scene, 75, 50, 'font', '', undefined, 0);
		this.start = Date.now();
		this.setDisplayCallback(characterCallback);
		scene.add.existing(this);
		this.chain = Promise.resolve();
	}

	setText(text) {
		this.start = Date.now();
		super.setText(wrap(text, 27));
		return new Promise(resolve => {
			const timeout = setTimeout(resolve, getTextAnimationLength(this.text))
			this.finish = () => {
				this.start = -Infinity;
				clearTimeout(timeout);
				resolve();
			};
		});
	}

	finish() {}
}
