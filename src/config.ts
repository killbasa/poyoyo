import { loadEnvFile } from 'node:process';
import { isDev } from './constants.js';

if (isDev) {
	loadEnvFile();
}

const token = process.env.DISCORD_TOKEN;

if (!token) {
	throw new Error('Missing Discord bot token');
}

export const BotConfig = {
	discord: {
		token,
	},
	landmine: {
		upbound: process.env.LANDMINE_UPBOUND
			? parseFloat(process.env.LANDMINE_UPBOUND)
			: 100,
	},
};
