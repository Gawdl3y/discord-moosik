'use babel';
'use strict';

import { Command } from 'discord-graf';
import { oneLine } from 'common-tags';

export default class SkipSongCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'skip',
			module: 'music',
			memberName: 'skip',
			description: 'Skips the song that is currently playing.',
			details: oneLine`
				If there are 3 people or fewer (excluding the bot) in the voice channel, the skip will be immediate.
				With at least 4 people, a voteskip will be started with 15 seconds to accept votes.
				The required votes to successfully skip the song is one-third of the number of listeners, rounded up.
				Each vote will add 5 seconds to the vote's timer.
				Moderators can use the "force" parameter, which will immediately skip without a vote, no matter what.
			`,
			guildOnly: true
		});

		this.votes = new Map();
	}

	async run(message, args) {
		const queue = this.queue.get(message.guild.id);
		if(!queue) return 'There isn\'t a song playing right now, silly.';
		if(!queue.voiceChannel.members.has(message.author.id)) {
			return 'You\'re not in the voice channel. You better not be trying to mess with their mojo, man.';
		}
		if(!queue.songs[0].dispatcher) return 'The song hasn\'t even begun playing yet. Why not give it a chance?';

		// Determine the vote threshold, and handle immediate skipping
		const threshold = Math.ceil((queue.voiceChannel.members.size - 1) / 3);
		const force = threshold <= 1 || queue.voiceChannel.members.size < threshold
			|| (this.bot.permissions.isMod(message.guild, message.author) && args[0].toLowerCase() === 'force');
		if(force) return { reply: this.skip(message.guild, queue), editable: false };

		const vote = this.votes.get(message.guild.id);
		if(vote && vote.count >= 1) {
			if(vote.users.some(user => user === message.author.id)) return 'You\'ve already voted to skip the song.';

			vote.count++;
			vote.users.push(message.author.id);
			if(vote.count >= threshold) {
				return {
					plain: this.skip(message.guild, queue),
					editable: false
				};
			}

			const time = this.setTimeout(vote);
			const remaining = threshold - vote.count;
			return {
				plain: oneLine`
					${vote.count} vote${vote.count > 1 ? 's' : ''} received so far,
					${remaining} more ${remaining > 1 ? 'are' : 'is'} needed to skip.
					Five more seconds on the clock! The vote will end in ${time} seconds.
				`,
				editable: false
			};
		} else {
			const newVote = {
				count: 1,
				users: [message.author.id],
				queue: queue,
				guild: message.guild.id,
				start: Date.now(),
				timeout: null
			};
			const time = this.setTimeout(newVote);
			this.votes.set(message.guild.id, newVote);
			const remaining = threshold - 1;
			return {
				plain: oneLine`
					Starting a voteskip.
					${remaining} more vote${remaining > 1 ? 's are' : ' is'} required for the song to be skipped.
					The vote will end in ${time} seconds.
				`,
				editable: false
			};
		}
	}

	skip(guild, queue) {
		// Kill the voteskip if active
		if(this.votes.has(guild.id)) {
			clearTimeout(this.votes.get(guild.id).timeout);
			this.votes.delete(guild.id);
		}

		// Skip the song
		const song = queue.songs[0];
		song.dispatcher.end();
		return `Skipped **${song.name}**.`;
	}

	setTimeout(vote) {
		const time = vote.start + 15000 - Date.now() + ((vote.count - 1) * 5000);
		clearTimeout(vote.timeout);
		vote.timeout = setTimeout(() => {
			this.votes.delete(vote.guild);
			vote.queue.textChannel.sendMessage('The vote to skip the current song has ended. Get outta here, party poopers.');
		}, time);
		return Math.round(time / 1000);
	}

	get queue() {
		if(!this._queue) this._queue = this.bot.registry.findCommands('music:play')[0].queue;
		return this._queue;
	}
}
