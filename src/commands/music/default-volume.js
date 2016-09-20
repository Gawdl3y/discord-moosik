'use babel';
'use strict';

import { Command, Setting } from 'discord-graf';
import { oneLine } from 'common-tags';
import config from '../../config';

export default class DefaultVolumeCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'default-volume',
			module: 'music',
			memberName: 'default-volume',
			description: 'Shows or sets the default volume level.',
			usage: 'default-volume [level|"default"]',
			details: oneLine`
				This is the default volume level to play songs at.
				The default is ${config.defaultVolume}. It can be in the range of 0-10.
				Only administrators may change this setting.
			`,
			examples: ['default-volume', 'default-volume 6', 'default-volume default'],
			guildOnly: true
		});
	}

	async run(message, args) {
		if(args[0]) {
			if(!this.bot.permissions.isAdmin(message.guild, message.author)) {
				return `Only administrators may change the default volume level.`;
			}
			if(args[0].toLowerCase() === 'default') {
				this.bot.storage.settings.delete(message.guild, 'default-volume');
				return `Set the default volume level to the bot's default (currently ${config.defaultVolume}).`;
			}
			const defaultVolume = parseInt(args[0]);
			if(isNaN(defaultVolume) || defaultVolume < 0 || defaultVolume > 10) {
				return `Invalid number provided. It must be in the range of 0-10.`;
			}
			this.bot.storage.settings.save(new Setting(message.guild, 'default-volume', defaultVolume));
			return `Set the default volume level to ${defaultVolume}.`;
		}

		const defaultVolume = this.bot.storage.settings.getValue(message.guild, 'default-volume', config.defaultVolume);
		return `The default volume level is ${defaultVolume}.`;
	}
}
