import { DatabaseSync } from 'node:sqlite';
import { DB_PATH } from './constants.js';

function checkColumnExists(
	db: DatabaseSync,
	tableName: string,
	columnName: string,
): boolean {
	const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
	const columns = stmt.all();
	return columns.some((col) => col.name === columnName);
}

export const initDb = (): DatabaseSync => {
	const database = new DatabaseSync(DB_PATH);

	database.exec(`
		CREATE TABLE IF NOT EXISTS servers(
			id TEXT PRIMARY KEY,
			landmines INTEGER DEFAULT 0,
			rate REAL DEFAULT 0.0
		) STRICT
	`);

	database.exec(`
		CREATE TABLE IF NOT EXISTS users(
			id TEXT PRIMARY KEY,
			serverId TEXT,
			wins INTEGER DEFAULT 0
		) STRICT
	`);

	if (!checkColumnExists(database, 'users', 'losses')) {
		database.exec('ALTER TABLE users ADD COLUMN losses INTEGER DEFAULT 0');
	}

	return database;
};

export const upsertLandmine = (
	db: DatabaseSync,
	serverId: string,
	landmines: number,
): void => {
	const stmt = db.prepare(`
		INSERT INTO servers (id, landmines)
		VALUES (?, ?)
		ON CONFLICT(id) DO UPDATE SET landmines=excluded.landmines
	`);

	stmt.run(serverId, landmines);
};

export const upsertRate = (
	db: DatabaseSync,
	serverId: string,
	rate: number,
): void => {
	const stmt = db.prepare(`
		INSERT INTO servers (id, rate)
		VALUES (?, ?)
		ON CONFLICT(id) DO UPDATE SET rate=excluded.rate
	`);

	stmt.run(serverId, rate);
};

export const getServer = (
	db: DatabaseSync,
	serverId: string,
): { id: string; landmines: number; rate: number } | null => {
	const stmt = db.prepare(`
		SELECT id, landmines, rate FROM servers WHERE id = ?
	`);

	const server = stmt.get(serverId) as
		| { id: string; landmines: number; rate: number }
		| undefined;

	return server ?? null;
};

export const incrementWin = (
	db: DatabaseSync,
	userId: string,
	serverId: string,
): void => {
	const stmt = db.prepare(`
		INSERT INTO users (id, serverId, wins)
		VALUES (?, ?, 1)
		ON CONFLICT(id) DO UPDATE SET wins = wins + 1
	`);

	stmt.run(userId, serverId);
};

export const incrementLoss = (
	db: DatabaseSync,
	userId: string,
	serverId: string,
): void => {
	const stmt = db.prepare(`
		INSERT INTO users (id, serverId, losses)
		VALUES (?, ?, 1)
		ON CONFLICT(id) DO UPDATE SET losses = losses + 1
	`);

	stmt.run(userId, serverId);
};

export const getStats = (
	db: DatabaseSync,
	serverId: string,
	limit = 5,
): {
	wins: { id: string; wins: number }[];
	losses: { id: string; losses: number }[];
} => {
	const winStmt = db.prepare(`
		SELECT id, wins FROM users WHERE serverId = ? ORDER BY wins DESC LIMIT ?
	`);

	const lossStmt = db.prepare(`
		SELECT id, losses FROM users WHERE serverId = ? ORDER BY losses DESC LIMIT ?
	`);

	const wins = winStmt.all(serverId, limit) as
		| { id: string; wins: number }[]
		| undefined;

	const losses = lossStmt.all(serverId, limit) as
		| { id: string; losses: number }[]
		| undefined;

	return {
		wins: wins ?? [],
		losses: losses ?? [],
	};
};

export const getUserStats = (
	db: DatabaseSync,
	userId: string,
	serverId: string,
): { wins: number; losses: number } => {
	const stmt = db.prepare(`
		SELECT wins, losses FROM users WHERE id = ? AND serverId = ?
	`);

	const stats = stmt.get(userId, serverId) as
		| { wins: number; losses: number }
		| undefined;

	return stats ?? { wins: 0, losses: 0 };
};
