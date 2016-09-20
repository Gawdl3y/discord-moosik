'use babel';
'use strict';

import { Util } from 'discord-graf';

export default class Song {
	constructor(video, member) {
		this.name = Util.escapeMarkdown(video.title);
		this.id = video.id;
		this.length = parseInt(video.durationSeconds);
		this.member = member;
		this.dispatcher = null;
		this.playing = false;
	}

	get url() {
		return `https://www.youtube.com/watch?v=${this.id}`;
	}

	get username() {
		let name = `${this.member.user.username}#${this.member.user.discriminator}`;
		if(this.member.nickname) name = `${this.member.nickname} (${name})`;
		return Util.escapeMarkdown(name);
	}

	get lengthString() {
		return `${Math.floor(this.length / 60)}:${`0${this.length % 60}`.slice(-2)}`;
	}

	toString() {
		return `**${this.name}** (${this.lengthString})`;
	}
}
