import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Client, Events, GatewayIntentBits, userMention } from 'discord.js';
import { BotConfig } from './config.js';
import { DB_PATH } from './constants.js';
import { getUser, initDb, updateLandmines } from './db.js';

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
	console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (event) => {
	if (event.author.bot) return;

	if (!event.member) {
		console.log('No member info available');
		return;
	}

	const randInt = Math.floor(Math.random() * 200) + 1; // 1/200 == 0.5%
	console.log(`Random int for ${event.author.id}: ${randInt}`);

	if (randInt === 1) {
		const user = getUser(db, event.author.id);
		const currLandmine = user?.landmines ?? 0;

		console.log(
			`User ${user?.id ?? event.author.id} hit a landmine (${currLandmine} prior)`,
		);

		if (user && user.landmines === 2) {
			console.log(
				`User ${user.id} has hit 3 landmines, timing out for 2 minutes`,
			);

			updateLandmines(db, event.author.id, 0);

			await event.channel.send({
				content: `:boom: ${userMention(event.author.id)} stepped on 3 landmines and has been timed out for 2 minutes!`,
				allowedMentions: { users: [event.author.id] },
			});
			await event.member.timeout(2 * 60 * 1000, 'Stepped on 3 landmines');
		} else {
			console.log(
				`Updating landmines for user ${event.author.id} from ${currLandmine} to ${currLandmine + 1}`,
			);

			updateLandmines(db, event.author.id, currLandmine + 1);

			await event.channel.send({
				content: `:boom: ${userMention(event.author.id)} stepped on a landmine (${currLandmine + 1}/3)`,
				allowedMentions: { users: [event.author.id] },
			});
		}
	}
});

await client.login(BotConfig.discord.token);
