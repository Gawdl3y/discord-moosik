'use babel';
'use strict';

export default class Song {
	constructor(info, url, member) {
		this.name = info.title;
		this.url = url;
		this.id = info.video_id;
		this.length = info.length_seconds;
		this.member = member;
		this.dispatcher = null;
	}

	get username() {
		const name = this.member.nickname ? this.member.nickname : this.member.user.username;
		return `${name}#${this.member.user.discriminator}`;
	}

	get lengthString() {
		return `${Math.floor(this.length / 60)}:${`0${this.length % 60}`.slice(-2)}`;
	}
}
