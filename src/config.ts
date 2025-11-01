import { loadEnvFile } from 'node:process';
import { isDev } from './constants.js';

if (isDev) {
	loadEnvFile();
}

const token = process.env.DISCORD_TOKEN;
if (!token) {
	throw new Error('Missing Discord bot token');
}

const botOwnerId = process.env.BOT_OWNER_ID;
if (!botOwnerId) {
	throw new Error('Missing Bot Owner ID');
}

export const BotConfig = {
	prefix: '?p',
	discord: {
		token,
		owner_id: botOwnerId,
	},
};
