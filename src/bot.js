'use babel';
'use strict';

import { Bot } from 'discord-graf';
import { stripIndents } from 'common-tags';
import version from './version';

export default new Bot({
	name: 'Moosik',
	version: version,
	about: stripIndents`
		**Moosik** v${version} created by Schuyler Cebulskie (Gawdl3y).
		Source code and information: https://github.com/Gawdl3y/discord-moosik
	`,
	updateURL: 'https://raw.githubusercontent.com/Gawdl3y/discord-moosik/master/package.json',
	clientOptions: { disable_everyone: true } // eslint-disable-line camelcase
});
