import { formatEmoji } from 'discord.js';

export const getRandomInteger = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getUpperBound = (rate: number): number => {
	if (rate === 0) {
		return Infinity;
	}

	return (1 / rate) * 100;
};

export const Emoji = {
	Boom: ':boom:',
	WiltedRose: ':wilted_rose:',
	FubukiThumbsUp: formatEmoji('930312710493724753'),
};
