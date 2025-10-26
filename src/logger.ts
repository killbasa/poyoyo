export const logger = {
	log: (...args: unknown[]) => {
		console.log(`[${new Date().toISOString()}]`, ...args);
	},
};
