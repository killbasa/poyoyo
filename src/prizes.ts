import {
	type GuildMember,
	type GuildTextBasedChannel,
	userMention,
} from 'discord.js';

export const getRandomInteger = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const sendPrize = async (
	channel: GuildTextBasedChannel,
	member: GuildMember,
) => {
	const prize = getRandomInteger(1, 3);

	if (prize === 1) {
		prizes.one(channel, member);
	} else if (prize === 2) {
		prizes.two(channel);
	} else {
		prizes.three(channel, member);
	}
};

const prizes = {
	one: async (
		channel: GuildTextBasedChannel,
		member: GuildMember,
	): Promise<void> => {
		await channel.send({
			content: `:boom: ${userMention(member.id)} stepped on a landmine, you get a 5-minute timeout`,
		});

		await member.timeout(5 * 60 * 1000, 'Stepped on landmines');
	},
	two: async (channel: GuildTextBasedChannel): Promise<void> => {
		await channel.send({
			content: "no boom, it's a dud",
		});
	},
	three: async (
		channel: GuildTextBasedChannel,
		member: GuildMember,
	): Promise<void> => {
		const randomUserId = channel.guild.members.cache
			.filter((m) => m.id !== member.id && !m.user.bot)
			.random()?.id;

		if (!randomUserId) {
			throw new Error('No valid user to push onto landmine');
		}

		await channel.send({
			content: `${userMention(member.id)} pushed ${userMention(randomUserId)} onto a landmine, giving them a 5-minute timeout`,
		});

		await member.timeout(5 * 60 * 1000, 'Pushed onto a landmine');
	},
};
