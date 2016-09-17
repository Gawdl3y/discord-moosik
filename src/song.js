'use babel';
'use strict';

import { Util } from 'discord-graf';

export default class Song {
	constructor(info, url, member) {
		this.name = Util.escapeMarkdown(info.title);
		this.id = info.video_id;
		this.length = parseInt(info.length_seconds);
		this.url = url;
		this.member = member;
		this.dispatcher = null;
		this.playing = false;
	}

	get username() {
		let name = `${this.member.user.username}#${this.member.user.discriminator}`;
		if(this.member.nickname) name = `${this.member.nickname} (${name})`;
		return Util.escapeMarkdown(name);
	}

	get lengthString() {
		return `${Math.floor(this.length / 60)}:${`0${this.length % 60}`.slice(-2)}`;
	}
}
