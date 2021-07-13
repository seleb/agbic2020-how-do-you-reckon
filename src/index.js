import { imagesDescriptions } from './assets/imagesDescriptions';
import './assets/style.css';

const loadEl = document.createElement('span');
loadEl.className = 'loading';
loadEl.textContent = 'loading';
document.body.appendChild(loadEl);

window.a11y = {
	init() {
		this.el = document.createElement('main');
		this.el.id = 'a11y';
		this.elProgress = document.createElement('progress');
		this.elImg = document.createElement('img');
		this.elText = document.createElement('div');
		this.elOptions = document.createElement('ol');
		this.elOptionsDescription = document.createElement('p');
		this.elOptionsDescription.textContent = 'Press the number key of your option to continue';
		this.elOptionsDescription.id = 'options-description';
		this.elOptions.setAttribute('aria-describedby', 'options-description');
		this.el.style.position = 'absolute';
		this.el.style.top = 0;
		this.el.style.left = 0;
		this.el.style.opacity = 0;
		this.el.style.pointerEvents = 'none';
		this.elProgress.min = 0;
		this.elProgress.max = 100;
		this.elProgress.value = 0;
		this.elImg.alt = '';
		this.el.appendChild(this.elProgress);
		this.el.appendChild(this.elImg);
		this.el.appendChild(this.elText);
		this.el.appendChild(this.elOptions);
		this.el.appendChild(this.elOptionsDescription);
		document.body.appendChild(this.el);
		this.el.ariaLive = 'polite';
		this.el.ariaAtomic = true;
	},
	progress(percent) {
		if (percent === undefined) {
			delete this.elProgress.value;
		} else {
			this.elProgress.value = Math.floor(percent * 100);
		}
	},
	loaded() {
		this.elProgress.remove();
		this.text('loaded');
	},
	text(str) {
		this.elText.innerHTML = '';
		str.split('\n').map(i => this.sanitize(i)).filter(i => i).forEach(i => {
			const p = document.createElement('p');
			p.textContent = i;
			this.elText.appendChild(p);
		});
	},
	img(str) {
		if (str === this.elImg.dataset.key) {
			this.elImg.alt = '';
			return;
		}
		delete imagesDescriptions[`${this.elImg.dataset.key}First`];
		this.elImg.dataset.key = str;
		str = imagesDescriptions[`${str}First`] || imagesDescriptions[str];
		this.elImg.alt = str ? this.sanitize(str) : '';
	},
	options(options) {
		this.elOptions.innerHTML = '';
		options.forEach(i => {
			const li = document.createElement('li');
			const btn = document.createElement('button');
			li.appendChild(btn);
			btn.textContent = `${i.label}.`;
			btn.onclick = i.action;
			this.elOptions.appendChild(li);
		});
	},
	update(image, text, options) {
		this.busy();
		this.el.ariaAtomic = true;
		this.img(image);
		this.text(text);
		this.options(options);
		this.ready();
		this.el.ariaAtomic = false;
	},
	busy() {
		this.el.ariaBusy = true;
	},
	ready(){
		this.el.ariaBusy = false;
	},
	sanitize(str) {
		return str.replaceAll('\u0000','').replace(/\s+/g, ' ').trim();
	}
}

window.a11y.init();
setTimeout(() => {
	window.a11y.text('loading');
	window.a11y.progress(undefined);
	import('./phaser-main').then(() => {
		loadEl.remove();
	});
}, 1);

