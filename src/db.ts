import { DatabaseSync } from 'node:sqlite';
import { DB_PATH } from './constants.js';

export const initDb = (): DatabaseSync => {
	const database = new DatabaseSync(DB_PATH);

	database.exec(`
		CREATE TABLE IF NOT EXISTS users(
			id TEXT PRIMARY KEY,
			landmines INTEGER DEFAULT 0
		) STRICT
	`);

	return database;
};

export const updateLandmines = (
	db: DatabaseSync,
	userId: string,
	landmines: number,
): void => {
	const stmt = db.prepare(`
		INSERT INTO users (id, landmines)
		VALUES (?, ?)
		ON CONFLICT(id) DO UPDATE SET landmines=excluded.landmines
	`);

	stmt.run(userId, landmines);
};

export const getUser = (
	db: DatabaseSync,
	userId: string,
): { id: string; landmines: number } | null => {
	const stmt = db.prepare(`
		SELECT id, landmines FROM users WHERE id = ?
	`);

	const user = stmt.get(userId) as
		| { id: string; landmines: number }
		| undefined;

	return user ?? null;
};
