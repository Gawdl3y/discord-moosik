'use babel';
'use strict';

import { Command } from 'discord-graf';
import { stripIndents } from 'common-tags';

export default class ViewQueueCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'queue',
			aliases: ['songs', 'song-list'],
			module: 'music',
			memberName: 'queue',
			description: 'Lists the queued songs.',
			usage: 'queue [page]',
			guildOnly: true
		});
	}

	async run(message, args) {
		const page = parseInt(args[0]) || 1;
		const queue = this.queue.get(message.guild.id);
		if(!queue) return 'There are no songs in the queue. Why not start the party yourself?';
		const paginated = this.bot.util.paginate(queue.songs, page, Math.floor(this.bot.config.values.paginationItems));
		return stripIndents`
			__**Song queue, ${paginated.pageText}**__
			${paginated.items.map(song => `**-** ${song.name} (${song.lengthString})`).join('\n')}

			${paginated.maxPage > 1 ? `Use ${this.bot.util.usage(`queue <page>`, message.guild)} to view a specific page.` : ''}
		`;
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
