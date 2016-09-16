'use babel';
'use strict';

import yargs from 'yargs';
import bot from './bot';
import version from './version';

bot.config.defaults.log = 'moosik.log';
bot.config.defaults.storage = 'moosik-storage';
bot.config.loadDefaults();

export const config = bot.config.yargs(yargs)
	.usage('$0 [command] [options]')
	.example('$0 --token SomeAPITokenGoesHere', 'Starts the bot using a token')
	.example('$0 --email SomeGuy@SomeSite.com --password SomeCrazyPassword123', 'Starts the bot using an email and password')
	.example('$0 --config settings.yml', 'Starts the bot using a config file')
	.example('$0 completion', 'Outputs Bash completion script')
	.epilogue(`Moosik v${version} by Schuyler Cebulskie (Gawdl3y): https://github.com/Gawdl3y/discord-moosik/`)

	.option('passes', {
		type: 'number',
		default: 1,
		alias: 'P',
		describe: 'Number of times to send voice packets',
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
