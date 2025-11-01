import type { DatabaseSync } from 'node:sqlite';
import type { Message, OmitPartialGroupDMChannel } from 'discord.js';
import { getServer, upsertRate } from './db.js';
import { logger } from './logger.js';
import { sendPrize } from './prizes.js';
import { getRandomInteger, getUpperBound } from './utils.js';

export const handleLandmines = async (
	db: DatabaseSync,
	event: OmitPartialGroupDMChannel<Message<boolean>>,
): Promise<void> => {
	if (!event.inGuild()) {
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

	const server = getServer(db, event.guild.id);
	if (!server?.rate || server.rate <= 0) {
		logger.log(`No landmine rate set for server ${event.guild.id}`);
		return;
	}

	const ub = getUpperBound(server.rate);
	const randInt = getRandomInteger(1, ub);

	logger.log(`Random int for ${user.id}: ${randInt}`);

	if (randInt === 1) {
		const currLandmine = server?.landmines ?? 0;

		logger.log(`User ${user.id} hit a landmine (${currLandmine} prior)`);

		if (server && server.landmines === 2) {
			logger.log(
				`User ${user.id} has hit the 3rd landmine, timing out for 5 minutes`,
			);

			upsertRate(db, event.guild.id, 0);

			await sendPrize(channel, user);
		} else {
			logger.log(
				`Updating landmines for user ${user.id} from ${currLandmine} to ${currLandmine + 1}`,
			);

			upsertRate(db, event.guild.id, currLandmine + 1);

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
};
