import type { DatabaseSync } from 'node:sqlite';
import {
	type GuildMember,
	type GuildTextBasedChannel,
	userMention,
} from 'discord.js';
import { incrementLoss } from './db.js';
import { Emoji, getRandomInteger } from './utils.js';

export type PrizeFunc = (args: {
	db: DatabaseSync;
	channel: GuildTextBasedChannel;
	member: GuildMember;
}) => Promise<void>;

export const sendPrize = async (
	db: DatabaseSync,
	channel: GuildTextBasedChannel,
	member: GuildMember,
) => {
	const prize = getRandomInteger(1, Object.keys(prizes).length);

	prizes[prize - 1].run({ db, channel, member });
};

const prizes: { run: PrizeFunc }[] = [
	/* Basic timeout */
	{
		run: async ({ channel, member }): Promise<void> => {
			await channel.send({
				content: `${Emoji.Boom} ${userMention(member.id)} stepped on a landmine, they get a 5-minute timeout`,
				allowedMentions: { users: [member.id] },
			});

			await member.timeout(5 * 60 * 1000, 'Stepped on landmines');
		},
	},
	/* Fakeout */
	{
		run: async ({ channel }): Promise<void> => {
			await channel.send({
				content: `${Emoji.WiltedRose} no boom, it's a dud`,
			});
		},
	},
	/* Timeout another user */
	{
		run: async ({ db, channel, member }): Promise<void> => {
			const randomUser = channel.guild.members.cache
				.filter((m) => m.id !== member.id && !m.user.bot)
				.random();

			if (!randomUser) {
				await channel.send({
					content: `${Emoji.FubukiThumbsUp} ${userMention(member.id)} pushed... wait what there's nobody to push. guess you die.`,
					allowedMentions: { users: [member.id] },
				});
				await member.timeout(5 * 60 * 1000, 'Pushed onto a landmine');
				incrementLoss(db, member.id, channel.guild.id);
				return;
			}

			await channel.send({
				content: `${Emoji.FubukiThumbsUp} ${userMention(member.id)} pushed ${userMention(randomUser.id)} onto a landmine, giving them a 5-minute timeout`,
				allowedMentions: { users: [member.id, randomUser.id] },
			});

			await randomUser.timeout(5 * 60 * 1000, 'Pushed onto a landmine');
			incrementLoss(db, randomUser.id, channel.guild.id);
		},
	},
];
