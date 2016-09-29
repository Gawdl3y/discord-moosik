'use babel';
'use strict';

import { Command, CommandFormatError, Util } from 'discord-graf';
import { oneLine } from 'common-tags';
import YouTube from 'simple-youtube-api';
import ytdl from 'ytdl-core';
import Song from '../../song';
import config from '../../config';

export default class PlaySongCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'play',
			module: 'music',
			memberName: 'play',
			description: 'Adds a song to the queue.',
			usage: 'play <YouTube URL>',
			guildOnly: true
		});

		this.queue = new Map();
		this.youtube = new YouTube(bot.config.values.youtubeKey);
	}

	run(message, args) {
		return new Promise(resolve => {
			if(!args[0]) throw new CommandFormatError(this, message.guild);
			const url = args[0].replace(/<(.+)>/g, '$1');
			let queue = this.queue.get(message.guild.id);

			// Get the voice channel the user is in
			let voiceChannel;
			if(!queue) {
				voiceChannel = message.member.voiceChannel;
				if(!voiceChannel || voiceChannel.type !== 'voice') {
					resolve('You aren\'t in a voice channel, ya dingus.');
					return;
				}
			} else if(!queue.voiceChannel.members.has(message.author.id)) {
				resolve('You\'re not in the voice channel. You better not be trying to mess with their mojo, man.');
				return;
			}

			const statusMsg = message.reply('Obtaining video details...');
			this.youtube.getVideo(url).then(video => {
				this.handleVideo(video, queue, voiceChannel, message, statusMsg, resolve);
			}).catch(() => {
				// Search for a video
				this.youtube.searchVideos(url, 1).then(videos => {
					// Get the video's details
					this.youtube.getVideoByID(videos[0].id).then(video2 => {
						this.handleVideo(video2, queue, voiceChannel, message, statusMsg, resolve);
					}).catch(() => {
						statusMsg.then(msg => msg.edit(`${message.author}, Couldn't obtain the search result video's details.`));
						resolve({ editable: false });
					});
				}).catch(() => {
					statusMsg.then(msg => msg.edit(`${message.author}, There were no search results.`));
					resolve({ editable: false });
				});
			});
		});
	}

	handleVideo(video, queue, voiceChannel, message, statusMsg, resolve) {
		if(!queue) {
			// Create the guild's queue
			queue = {
				textChannel: message.channel,
				voiceChannel: voiceChannel,
				connection: null,
				songs: [],
				volume: this.bot.storage.settings.getValue(message.guild, 'default-volume', config.defaultVolume)
			};
			this.queue.set(message.guild.id, queue);

			// Try to add the song to the queue
			const result = this.addSong(message, video);

			if(result.startsWith(':thumbsup:')) {
				// Join the voice channel and start playing
				queue.voiceChannel.join().then(connection => {
					queue.connection = connection;
					this.play(message.guild, queue.songs[0]);
					statusMsg.then(msg => msg.delete());
					resolve({ editable: false });
				}).catch(err2 => {
					this.bot.logger.error('Error occurred when joining voice channel.', err2);
					this.queue.delete(message.guild.id);
					statusMsg.then(msg => msg.edit(`${message.author}, Unable to join your voice channel.`));
					resolve({ editable: false });
				});
			} else {
				this.queue.delete(message.guild.id);
				statusMsg.then(msg => msg.edit(`${message.author}, ${result}`));
				resolve({ editable: false });
			}
		} else {
			// Just add the song
			const result = this.addSong(message, video);
			statusMsg.then(msg => msg.edit(`${message.author}, ${result}`));
			resolve({ editable: false });
		}
	}

	addSong(message, video) {
		const queue = this.queue.get(message.guild.id);

		// Verify some stuff
		if(!this.bot.permissions.isAdmin(message.guild, message.author)) {
			const maxLength = this.bot.storage.settings.getValue(message.guild, 'max-length', config.maxLength);
			if(maxLength > 0 && video.durationSeconds > maxLength * 60) {
				return oneLine`
					:thumbsdown: **${Util.escapeMarkdown(video.title)}**
					(${Song.timeString(video.durationSeconds)})
					is too long. No songs longer than ${maxLength} minutes!
				`;
			}
			if(queue.songs.some(song => song.id === video.id)) {
				return `:thumbsdown: **${Util.escapeMarkdown(video.title)}** is already queued.`;
			}
			const maxSongs = this.bot.storage.settings.getValue(message.guild, 'max-songs', config.maxSongs);
			if(maxSongs > 0 && queue.songs.reduce((prev, song) => prev + song.member.id === message.author.id, 0) >= maxSongs) {
				return `:thumbsdown: You already have ${maxSongs} songs in the queue. Don't hog all the airtime!`;
			}
		}

		// Add the song to the queue
		this.bot.logger.debug('Adding song to queue.', { song: video.id, guild: message.guild.id });
		const song = new Song(video, message.member);
		queue.songs.push(song);
		return `:thumbsup: Queued up ${song}.`;
	}

	play(guild, song) {
		const queue = this.queue.get(guild.id);

		// Kill the voteskip if active
		const vote = this.votes.get(guild.id);
		if(vote) {
			clearTimeout(vote);
			this.votes.delete(guild.id);
		}

		// See if we've finished the queue
		if(!song) {
			queue.textChannel.sendMessage('We\'ve run out of songs! Better queue up some more tunes.');
			queue.voiceChannel.leave();
			this.queue.delete(guild.id);
			return;
		}

		// Play the song
		const playing = queue.textChannel.sendMessage(
			`:musical_note: Playing ${song}, queued by ${song.username}.`
		);
		let streamErrored = false;
		const stream = ytdl(song.url, { audioonly: true })
			.on('error', err => {
				streamErrored = true;
				this.bot.logger.error('Error occurred when streaming video:', err);
				playing.then(msg => msg.edit(`:x: Couldn't play ${song}. What a drag!`));
				queue.songs.shift();
				this.play(guild, queue.songs[0]);
			});
		const dispatcher = queue.connection.playStream(stream, { passes: config.passes })
			.on('end', () => {
				if(streamErrored) return;
				queue.songs.shift();
				this.play(guild, queue.songs[0]);
			})
			.on('error', err => {
				this.bot.logger.error('Error occurred in stream dispatcher:', err);
				queue.textChannel.sendMessage(`An error occurred while playing the song: \`${err}\``);
				queue.songs.shift();
				this.play(guild, queue.songs[0]);
			});
		dispatcher.setVolumeLogarithmic(queue.volume / 5);
		song.dispatcher = dispatcher;
		song.playing = true;
	}

	get votes() {
		if(!this._votes) this._votes = this.bot.registry.findCommands('music:skip')[0].votes;
		return this._votes;
	}
}
