'use babel';
'use strict';

import { Command } from 'discord-graf';

export default class ChangeVolumeCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'volume',
			aliases: ['set-volume', 'set-vol', 'vol'],
			module: 'music',
			memberName: 'volume',
			description: 'Changes the volume.',
			usage: 'volume [level]',
			details: 'The volume level ranges from 0-10. You may specify "up" or "down" to modify the volume level by 2.',
			examples: ['volume', 'volume 7', 'volume up', 'volume down'],
			guildOnly: true
		});
	}

	async run(message, args) {
		const queue = this.queue.get(message.guild.id);
		if(!queue) return 'There isn\'t any music playing to change the volume of. Better queue some up!';
		if(!args[0]) return `The dial is currently set to ${queue.volume}.`;
		if(!queue.voiceChannel.members.has(message.author.id)) {
			return `You're not in the voice channel. You better not be trying to mess with their mojo, man.`;
		}

		let volume = parseInt(args[0]);
		if(isNaN(volume)) {
			volume = args[0].toLowerCase();
			if(volume === 'up' || volume === '+') {
				volume = queue.volume + 2;
			} else if(volume === 'down' || volume === '-') {
				volume = queue.volume - 2;
			} else {
				return `Invalid volume level. The dial goes from 0-10, baby.`;
			}
			if(volume === 11) volume = 10;
		}

		volume = Math.min(Math.max(volume, 0), volume === 11 ? 11 : 10);
		queue.volume = volume;
		if(queue.songs[0].dispatcher) queue.songs[0].dispatcher.setVolumeLogarithmic(queue.volume / 5);
		return volume === 11 ? 'This one goes to 11!' : `Set the dial to ${volume}.`;
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
