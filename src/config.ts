import { loadEnvFile } from 'node:process';
import { z } from 'zod/v4';
import { isDev } from './constants.js';

if (isDev) {
	loadEnvFile();
}

const BotConfigSchema = z.object({
	prefix: z.string(),
	discord: z.object({
		token: z.string(),
		owner_id: z.string(),
	}),
});

export const BotConfig = BotConfigSchema.parse({
	prefix: '?p',
	discord: {
		token: process.env.DISCORD_TOKEN,
		owner_id: process.env.BOT_OWNER_ID,
	},
});
