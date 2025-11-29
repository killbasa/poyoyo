import type { DatabaseSync } from 'node:sqlite';
import type { Message } from 'discord.js';
import { BotConfig } from './config.js';
import { getServer, getStats, getUserStats, upsertRate } from './db.js';
import { client } from './main.js';
import { getUpperBound } from './utils.js';

export const isCommand = (message: string): boolean => {
	return message.startsWith(BotConfig.prefix);
};

export const parseCommand = (message: string): string[] => {
	if (message === BotConfig.prefix || !message.startsWith(BotConfig.prefix))
		return [];

	const split = message.trim().split(/\s+/);
	if (!split) return [];

	split.shift();
	return split;
};

export const commands = {
	ping: async (message: Message): Promise<void> => {
		const ping = Math.round(client.ws.ping);

		await message.reply({
			content: `pong (${ping}ms)`,
		});
	},
	getSettings: async (
		db: DatabaseSync,
		message: Message<true>,
	): Promise<void> => {
		const server = getServer(db, message.guild.id);

		if (!server) {
			await message.reply({
				content: 'no settings found for this server',
			});
			return;
		}

		const ub = getUpperBound(server.rate);
		await message.reply({
			content: `landmines: ${server.landmines}\nrate: ${server.rate} (1, ${ub})`,
		});
	},
	setRate: async (
		db: DatabaseSync,
		message: Message<true>,
		args: string[],
	): Promise<void> => {
		if (args.length < 1) {
			await message.reply({
				content: 'please provide a new rate value',
			});
			return;
		}

		const newRate = Number.parseFloat(args[0]);
		if (Number.isNaN(newRate) || newRate < 0) {
			await message.reply({
				content: 'please provide a valid positive number for the rate',
			});
			return;
		}

		upsertRate(db, message.guild.id, newRate);

		await message.reply({
			content: `landmine rate set to ${newRate}`,
		});
	},
	leaderboard: async (
		db: DatabaseSync,
		message: Message<true>,
	): Promise<void> => {
		const stats = getStats(db, message.guild.id);

		const wins =
			stats.wins.length > 0
				? stats.wins
						.sort((a, b) => b.wins - a.wins)
						.map(
							(entry, index) => `${index + 1}. <@${entry.id}> - ${entry.wins}`,
						)
						.join('\n')
				: 'no winners yet';

		const losses =
			stats.losses.length > 0
				? stats.losses
						.sort((a, b) => b.losses - a.losses)
						.map(
							(entry, index) =>
								`${index + 1}. <@${entry.id}> - ${entry.losses}`,
						)
						.join('\n')
				: 'no losers yet';

		const content = `wins leaderboard\n${wins}\n\nlosses leaderboard\n${losses}`;

		await message.reply({
			content,
			allowedMentions: { users: [], roles: [] },
		});
	},
	stats: async (db: DatabaseSync, message: Message<true>) => {
		const stats = getUserStats(db, message.author.id, message.guild.id);

		const content = `wins: ${stats.wins}\nlosses: ${stats.losses}`;

		await message.reply({
			content,
			allowedMentions: { users: [], roles: [] },
		});
	},
};
