import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { commands, isCommand, parseCommand } from './commands.js';
import { BotConfig } from './config.js';
import { DB_PATH } from './constants.js';
import { initDb } from './db.js';
import { handleLandmines } from './landmines.js';
import { logger } from './logger.js';
import { Emoji } from './utils.js';

// Ensure the database directory exists
await mkdir(join(DB_PATH, '..'), { recursive: true });

const db = initDb();

export const client = new Client({
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

	const result = isCommand(event.content);
	if (!result) {
		return await handleLandmines(db, event);
	}

	if (event.author.id !== BotConfig.discord.owner_id) {
		await event.react(Emoji.PoyoyoBigL);
		return;
	}

	const args = parseCommand(event.content);
	if (args.length === 0) {
		logger.log('Failed to parse command');
		return;
	}

	const command = args.shift()?.toLowerCase();

	// General commands
	switch (command) {
		case 'ping':
			return await commands.ping(event);
	}

	if (!event.inGuild()) {
		logger.log('No guild info available');
		return;
	}

	// Guild commands
	switch (command) {
		case 'settings':
			return await commands.getSettings(db, event);
		case 'setrate':
			return await commands.setRate(db, event, args);
	}

	logger.log(`Failed to handle command: ${args.join(' ')}`);
});

await client.login(BotConfig.discord.token);
