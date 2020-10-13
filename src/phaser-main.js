import 'babel-polyfill';
import Phaser from "phaser";
import LoadingScene from "./LoadingScene";
import { size } from './size';


const config = {
	type: Phaser.AUTO,
	scale: {
		parent: 'phaser-example',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: size.x,
		height: size.y,
	},
	autoRound: true,
	roundPixels: true,
	scene: LoadingScene,
};

const game = new Phaser.Game(config);
window.game = game;
