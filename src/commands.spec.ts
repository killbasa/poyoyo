import { isCommand, parseCommand } from './commands.js';

vi.mock('./main.js', () => ({}));
vi.mock('./config.js', () => ({
	BotConfig: { prefix: '?p' },
}));

describe('command tests', () => {
	describe('isCommand', () => {
		it('should validate', () => {
			const result = isCommand('?p ping');
			expect(result).toBe(true);
		});

		it('should invalidate', () => {
			const result = isCommand('?c ping');
			expect(result).toBe(false);
		});
	});

	describe('parseCommand', () => {
		it('should parse', () => {
			const result = parseCommand('?p ping');
			expect(result).toStrictEqual(['ping']);
		});

		it('should handle no space', () => {
			const result = parseCommand('?pping');
			expect(result).toStrictEqual([]);
		});

		it('should handle empty', () => {
			const result = parseCommand('?p');
			expect(result).toStrictEqual([]);
		});
	});
});
