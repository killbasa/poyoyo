import { DatabaseSync } from 'node:sqlite';
import { DB_PATH } from './constants.js';

export const initDb = (): DatabaseSync => {
	const database = new DatabaseSync(DB_PATH);

	database.exec(`
		CREATE TABLE IF NOT EXISTS servers(
			id TEXT PRIMARY KEY,
			landmines INTEGER DEFAULT 0
		) STRICT
	`);

	return database;
};

export const updateLandmines = (
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

export const getServer = (
	db: DatabaseSync,
	serverId: string,
): { id: string; landmines: number } | null => {
	const stmt = db.prepare(`
		SELECT id, landmines FROM servers WHERE id = ?
	`);

	const server = stmt.get(serverId) as
		| { id: string; landmines: number }
		| undefined;

	return server ?? null;
};
