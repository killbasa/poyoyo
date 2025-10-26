import { resolve } from 'node:path';

export const isDev = process.env.NODE_ENV !== 'production';

export const DB_PATH = isDev
	? resolve('./data/poyoyo.db')
	: '/etc/poyoyo/data/poyoyo.db';
