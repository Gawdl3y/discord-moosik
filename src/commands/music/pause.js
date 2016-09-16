'use babel';
'use strict';

import { Command } from 'discord-graf';

export default class PauseSongCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'pause',
			aliases: ['shh', 'shhh', 'shhhh', 'shhhhh'],
			module: 'music',
			memberName: 'pause',
			description: 'Pauses the currently playing song.',
			guildOnly: true
		});
	}

	async run(message) {
		const queue = this.queue.get(message.guild.id);
		if(!queue) return `There isn\'t any music playing to pause, oh brilliant one.`;
		if(!queue.songs[0].dispatcher) return 'It\'s kind of tough to pause a song that hasn\'t even begun playing yet.';
		queue.songs[0].dispatcher.pause();
		return `Paused the music. Use ${this.bot.util.usage('resume', message.guild)} to continue playing.`;
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
