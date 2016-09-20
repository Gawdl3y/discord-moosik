'use babel';
'use strict';

import { Command } from 'discord-graf';
import { stripIndents } from 'common-tags';
import Song from '../../song';
import config from '../../config';

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
		const paginated = this.bot.util.paginate(queue.songs, page, Math.floor(config.paginationItems));
		const totalLength = queue.songs.reduce((prev, song) => prev + song.length, 0);
		const currentSong = queue.songs[0];
		const currentTime = currentSong.dispatcher ? currentSong.dispatcher.time / 1000 : 0;
		return stripIndents`
			__**Song queue, ${paginated.pageText}**__
			${paginated.items.map(song => `**-** ${song.name} (${song.lengthString})`).join('\n')}
			${paginated.maxPage > 1 ? `\nUse ${this.bot.util.usage(`queue <page>`, message.guild)} to view a specific page.\n` : ''}
			**Now playing:** ${currentSong.name} (queued by ${currentSong.username})
			**Progress:** ${Song.timeString(currentTime)} / ${currentSong.timeLeft(currentTime)}${!currentSong.playing ? ' (paused)' : ''}
			**Total queue time:** ${Song.timeString(totalLength)}
		`;
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
