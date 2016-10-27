'use babel';
'use strict';

import { Command } from 'discord-graf';

export default class ResumeSongCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'resume',
			module: 'music',
			memberName: 'resume',
			description: 'Resumes the currently playing song.',
			guildOnly: true
		});
	}

	async run(message) {
		const queue = this.queue.get(message.guild.id);
		if(!queue) return 'There isn\'t any music playing to resume, oh brilliant one.';
		if(!queue.songs[0].dispatcher) {
			return 'Pretty sure a song that hasn\'t actually begun playing yet could be considered "resumed".';
		}
		if(queue.songs[0].playing) return 'Resuming a song that isn\'t paused is a great move. Really fantastic.';
		queue.songs[0].dispatcher.resume();
		queue.songs[0].playing = true;
		return 'Resumed the music. This party ain\'t over yet!';
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
