'use babel';
'use strict';

import { Command } from 'discord-graf';
import { oneLine } from 'common-tags';
import Song from '../../song';

export default class MusicStatusCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'status',
			aliases: ['song', 'playing', 'current-song', 'now-playing'],
			module: 'music',
			memberName: 'status',
			description: 'Shows the current status of the music.',
			guildOnly: true
		});
	}

	async run(message) {
		const queue = this.queue.get(message.guild.id);
		if(!queue) return 'There isn\'t any music playing right now. You should get on that.';
		const song = queue.songs[0];
		const currentTime = song.dispatcher ? song.dispatcher.time / 1000 : 0;
		return oneLine`
			Currently playing ${song}, queued by ${song.username}.
			We are ${Song.timeString(currentTime)} into the song, and have ${song.timeLeft(currentTime)} left.
			${!song.playing ? 'The music is paused.' : ''}
		`;
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
