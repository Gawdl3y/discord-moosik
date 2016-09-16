'use babel';
'use strict';

import { Command } from 'discord-graf';

export default class StopMusicCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'stop',
			aliases: ['kill', 'stfu'],
			module: 'music',
			memberName: 'stop',
			description: 'Stops the music and wipes the queue.',
			details: 'Only moderators may use this command.',
			guildOnly: true
		});
	}

	hasPermission(guild, user) {
		return this.bot.permissions.isMod(guild, user);
	}

	async run(message) {
		const queue = this.queue.get(message.guild.id);
		if(!queue) return 'There isn\'t any music playing right now.';
		const song = queue.songs[0];
		queue.songs = [];
		if(song.dispatcher) song.dispatcher.end();
		return 'You\'ve just killed the party. Congrats. :clap:';
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
