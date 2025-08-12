export interface ErrJSON {
	message: string;
	details?: Record<string, unknown>;
	cause?: ErrJSON;
}

export class Err extends Error {
	static from(error: unknown): Err {
		return error instanceof Err ? error : new Err(String(error));
	}

	static assert(
		condition: unknown,
		message: string = 'Assertion failed.',
		detailsProvider?: () => Record<string, unknown>,
	): asserts condition {
		if (!condition) {
			const error = new Err(message);
			const details = detailsProvider?.();
			if (details) {
				error.with(details);
			}
			throw error;
		}
	}

	static throw(...args: ConstructorParameters<typeof Err>): never {
		throw new Err(...args);
	}

	private details: Record<string, unknown>|undefined = undefined;

	with(details: Record<string, unknown>): Err {
		this.details = Object.freeze(Object.assign({}, this.details, details));
		return this;
	}

	causes(message: string): Err {
		return new Err(message, { cause: this });
	}

	throw(): never {
		throw this;
	}

	toJSON(): ErrJSON {
		return this.#toJSON(this);
	}

	#toJSON(value: unknown): ErrJSON {
		return value instanceof Err
				? {
					message: value.message || '<empty error message>',
					details: (() => {
						try {
							return JSON.parse(JSON.stringify(value.details));
						} catch (e) {
							return {};
						}
					})(),
					...(
						value.cause ? { cause: this.#toJSON(value.cause) } : {}
					),
				}
			: value instanceof Error
				? {
					message: value.message || '<empty error message>',
					...(
						value.cause ? { cause: this.#toJSON(value.cause) } : {}
					),
				}
			: {
				message: String(value),
				...(() => {
					try {
						return { details: JSON.parse(JSON.stringify(value)) };
					}
					catch (e) {
						return {};
					}
				})(),
			};
	}

	override toString(): string {
		const { message, details } = this.toJSON();
		const stack = this.stack && `at:\n${this.stack}`; // this.stack is non-standard, thus not available in all environments
		const cause = this.cause instanceof Error ? '\nCaused by: ' + this.cause.toString()
			: this.cause ? `\nCaused by: ${String(this.cause)}`
			: undefined;
		return [message, details, stack, cause].filter(Boolean).join(' ');
	}
}
