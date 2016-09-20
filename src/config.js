'use babel';
'use strict';

import yargs from 'yargs';
import bot from './bot';
import version from './version';

bot.config.defaults.log = 'moosik.log';
bot.config.defaults.storage = 'moosik-storage';
bot.config.defaults.commandPrefix = 'moo';
bot.config.loadDefaults();

export const config = bot.config.yargs(yargs)
	.usage('$0 [command] [options]')
	.example('$0 --token SomeAPITokenGoesHere', 'Starts the bot using a token')
	.example('$0 --email SomeGuy@SomeSite.com --password SomeCrazyPassword123', 'Starts the bot using an email and password')
	.example('$0 --config settings.yml', 'Starts the bot using a config file')
	.example('$0 completion', 'Outputs Bash completion script')
	.epilogue(`Moosik v${version} by Schuyler Cebulskie (Gawdl3y): https://github.com/Gawdl3y/discord-moosik/`)

	.option('youtube-key', {
		type: 'string',
		alias: 'Y',
		describe: 'The YouTube API key to use',
		group: 'Authentication:'
	})
	.option('passes', {
		type: 'number',
		default: 1,
		alias: 'P',
		describe: 'Number of times to send voice packets',
		group: 'General:'
	})
	.option('max-length', {
		type: 'number',
		default: 15,
		describe: 'Maximum length of a song (in minutes).',
		group: 'General:'
	})
	.option('max-songs', {
		type: 'number',
		default: 5,
		describe: 'Maximum songs a user may have in the queue.',
		group: 'General:'
	})
	.option('default-volume', {
		type: 'number',
		default: 5,
		describe: 'Default volume level for songs to play at.',
		group: 'General:'
	})

	.help()
	.alias('help', 'h')
	.group('help', 'Special:')
	.version(version)
	.alias('version', 'v')
	.group('version', 'Special:')
	.completion('completion')
	.wrap(yargs.terminalWidth())
.argv;
export default config;
