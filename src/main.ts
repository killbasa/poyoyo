import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { BotConfig } from './config.js';
import { DB_PATH } from './constants.js';
import { getServer, initDb, updateLandmines } from './db.js';
import { logger } from './logger.js';
import { getRandomInteger, sendPrize } from './prizes.js';

// Ensure the database directory exists
await mkdir(join(DB_PATH, '..'), { recursive: true });

const db = initDb();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, (readyClient) => {
	logger.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (event) => {
	if (event.author.bot) return;

	if (!event.guild) {
		logger.log('No guild info available');
		return;
	}

	const user = event.member;
	if (!user) {
		logger.log('No member info available');
		return;
	}

	const channel = await event.guild.channels.fetch(event.channelId);
	if (!channel?.isTextBased()) {
		logger.log('Channel is not guild and/or text-based');
		return;
	}

	const randInt = getRandomInteger(1, BotConfig.landmine.upbound);
	logger.log(`Random int for ${user.id}: ${randInt}`);

	if (randInt === 1) {
		const server = getServer(db, event.guild.id);
		const currLandmine = server?.landmines ?? 0;

		logger.log(`User ${user.id} hit a landmine (${currLandmine} prior)`);

		if (server && server.landmines === 2) {
			logger.log(
				`User ${user.id} has hit the 3rd landmine, timing out for 5 minutes`,
			);

			updateLandmines(db, event.guild.id, 0);

			await sendPrize(channel, user);
		} else {
			logger.log(
				`Updating landmines for user ${user.id} from ${currLandmine} to ${currLandmine + 1}`,
			);

			updateLandmines(db, event.guild.id, currLandmine + 1);

			if (!server || server.landmines === 0) {
				await event.channel.send({
					content: `landmine placed`,
				});
			} else if (server.landmines === 1) {
				await event.channel.send({
					content: `landmine armed`,
				});
			}
		}
	}
});

await client.login(BotConfig.discord.token);

logger.log(`Rate: 1/${BotConfig.landmine.upbound}`);
