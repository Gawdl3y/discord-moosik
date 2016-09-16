'use babel';
'use strict';

import { Command } from 'discord-graf';
import { oneLine } from 'common-tags';

export default class NowPlayingCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'playing',
			aliases: ['song', 'current', 'current-song', 'now-playing'],
			module: 'music',
			memberName: 'playing',
			description: 'Shows the current status of the music.',
			guildOnly: true
		});
	}

	async run(message) {
		const queue = this.queue.get(message.guild.id);
		if(!queue) return 'There isn\'t any music playing right now. You should get on that.';
		const song = queue.songs[0];
		const currentTime = song.dispatcher ? song.dispatcher.time / 1000 : 0;
		const remainingTime = song.length - currentTime;
		return oneLine`
			Currently playing **${song.name}** (${song.lengthString}), requested by ${song.username}.
			We are ${Math.floor(currentTime / 60)}:${`0${Math.floor(currentTime % 60)}`.slice(-2)} into the song,
			and have ${Math.floor(remainingTime / 60)}:${`0${Math.floor(remainingTime % 60)}`.slice(-2)} left.
		`;
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
