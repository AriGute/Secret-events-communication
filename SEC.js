const msgType = { key: 'key', data: 'data' };
Object.freeze(msgType);

class SEC {
	// instance variables
	#keyChain = {}; // TODO: {target client name: (hold key)}
	#name = '';
	#tempKeyHolder = '';

	// class variables
	static #p = BigInt(7919); // public (known to everyone) // TODO: make static private
	static #g = BigInt(3); // public (known to everyone) // TODO: make static private
	static #clients = {}; // TODO: {name: id for initial event (for keys swap)}

	constructor(name) {
		this.#tempKeyHolder = null;
		if (typeof name !== 'string') SEC.#throwError('Wrong type of name .', 'string', typeof name);
		this.#name = name;
		SEC.generateClient(name);
		window.addEventListener(SEC.#clients[name] + msgType.key, (e) => this.#completeConnection(e));
	}
	static generateClient(name) {
		SEC.#clients[name] = Math.round(Math.random() * 1000000000000000).toString();
	}

	connect(target) {
		this.#sendHalfKey(target);
	}

	#completeConnection(e) {
		console.log(`received message:`, e);
		if (!this.#tempKeyHolder) {
			// TODO: check if typeof is bigInt
			this.#sendHalfKey(e.detail.owner);
			window.removeEventListener(SEC.#clients[this.#name] + msgType.key, (e) =>
				this.#completeConnection(e),
			);
		}
		this.#tempKeyHolder = SEC.#generateFullKey(e.detail.key, this.#tempKeyHolder);
		this.#keyChain[e.detail.owner] = this.#tempKeyHolder;
		this.#tempKeyHolder = null;
		this.debugLogs(this.#name); // for debugging

		window.addEventListener(SEC.#clients[this.#name] + msgType.data, (e) =>
			console.log(e.detail.data),
		);
	}

	#sendHalfKey(target) {
		this.#tempKeyHolder = SEC.#generateHalfKey(SEC.#randomNum(11, 99));
		const data = { key: this.#tempKeyHolder, owner: this.#name };
		const event = new CustomEvent(SEC.#clients[target] + msgType.key, {
			detail: data,
		});
		window.dispatchEvent(event);
	}

	static #generateHalfKey(a) {
		return SEC.#g ** a % SEC.#p;
	}

	static #generateFullKey(a, b) {
		return a ** b % SEC.#p;
	}

	static #randomNum(min, max) {
		return BigInt(Math.round(Math.random() * (max - min + 1) + min));
	}
	static #throwError(subject, expected, received) {
		throw Error(`${subject}\nexpected: ${expected}\nreceived: ${received}`);
	}

	debugLogs(name) {
		let spaces = '';
		for (let i = 0; i < 100; i++) {
			spaces += '	';
		}
		console.log(`%c${spaces}`, 'background-color: darkblue;');
		console.log(
			'%c Secret-events-communication instance logs ',
			'background-color: green; color: white',
		);
		console.log(this);
		console.log(`%c${spaces}`, 'background-color: darkblue;');
	}
}
