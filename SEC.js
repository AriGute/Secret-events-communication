class SEC {
	// instance variables (secrets)
	#name = ''; // instance name in the #clients.
	#keyChain = {}; // hold all the keys for each client that connected with me (this instance).
	#callbackFunctions = {}; // Hold callback function per client name.
	#tempKeyHolder = ''; // hold temp values and change per stage of the full key building process.

	// shared variables
	static #p = BigInt(524287); // TODO: find a better way to get bigger key
	static #g = BigInt(3);
	static #clients = {}; // list of all client (SEC instances)
	static #msgType = { key: 'key' };

	constructor(name) {
		this.#tempKeyHolder = null;
		if (typeof name !== 'string') this.#throwError('Wrong type of name .', 'string', typeof name);
		this.#name = name;
		SEC.registerClient(name);
		window.addEventListener(SEC.#clients[name] + SEC.#msgType.key, (e) =>
			this.#completeConnection(e),
		);
		Object.freeze(this);
		console.log(this);
	}

	/**
	 * Couple name and unique id for future connection.
	 * @param {string} name name of the client
	 */
	static registerClient(name) {
		if (SEC.#clients[name])
			this.#throwError(
				`The name ${name} already exist.\nCannot use the same name for more then one instance of SEC.`,
			);
		SEC.#clients[name] = Math.round(Math.random() * 1000000000000000).toString();
	}

	/**
	 * Swap keys with specific client.
	 * @param {string} name name of the client.
	 */
	connect(name) {
		if (this.#keyChain[name]) this.#throwError(`Already connected to this client name (${name})`);
		if (name === this.#name) this.#throwError(`Client cannot connect to himself.`);
		this.#sendHalfKey(name);
	}

	/**
	 * set callback function to invoke once event is received from client with the specified name.
	 * @param {string} name client name (specific instance).
	 * @param {function} callback function to invoke once event is received.
	 */
	setEventRespond(name, callback) {
		if (typeof name !== 'string')
			this.#throwError(`Expect to different typeof`, 'string', typeof name);
		if (typeof callback !== 'function')
			this.#throwError(`Expect to different typeof`, 'function', typeof callback);

		this.#callbackFunctions[name] = callback;
	}

	/**
	 * @param {string} name targeted client
	 * @param {object} data
	 */
	send(name, data) {
		if (!SEC.#clients[name]) this.#throwError(`Can't find client with this name: ${name}.`);
		if (!this.#keyChain[name]) this.#throwError(`Not connected to client with this name: ${name}.`);
		if (typeof data !== 'object')
			this.#throwError(`Expect to different typeof`, 'object', typeof data);

		const eventType = this.#keyChain[name] ^ BigInt(SEC.#clients[name]);
		const details = data;
		details.owner = this.#name;
		const msg = new CustomEvent(eventType, { detail: details, cancelable: false });
		window.dispatchEvent(msg);
	}

	/**
	 * Trigger as a callback after receiving request to connect
	 * and build full-key with the other client for future communication.
	 *
	 * The secret event type is: sharedKey ^ uniqueClientId + 'data'.
	 * (this.#keyChain[e.detail.owner] ^ (BigInt(SEC.#clients[this.#name]) + SEC.#msgType.data)
	 * @param {Event} e
	 */
	#completeConnection(e) {
		if (!this.#tempKeyHolder) {
			this.#sendHalfKey(e.detail.owner);
			this.#tempKeyHolder = SEC.#generateFullKey(this.#tempKeyHolder, e.detail.key);
		} else {
			this.#tempKeyHolder = SEC.#generateFullKey(e.detail.key, this.#tempKeyHolder);
		}
		this.#keyChain[e.detail.owner] = this.#tempKeyHolder;
		this.#tempKeyHolder = null;

		const eventType = this.#keyChain[e.detail.owner] ^ BigInt(SEC.#clients[this.#name]);

		const callBackFunction = (e) => {
			console.log('');
			const callback = this.#callbackFunctions[e.detail.owner];
			console.log(this.#name + ' received message:');
			if (callback) {
				callback(e);
			} else {
				console.log(`Cant find callBack function for this client name. \n received event: `, e);
			}
		};
		window.addEventListener(eventType, callBackFunction);
	}

	/**
	 * Send event to unique id of specific client name.
	 * The event.details hold this instance half-key and this instance name.
	 * @param {string} name client name
	 */
	#sendHalfKey(name) {
		this.#tempKeyHolder = SEC.#generateHalfKey(SEC.#randomNum(11, 99));
		const data = { owner: this.#name, key: this.#tempKeyHolder };
		const event = new CustomEvent(SEC.#clients[name] + SEC.#msgType.key, {
			detail: data,
			cancelable: false,
		});
		window.dispatchEvent(event);
	}

	static #generateHalfKey(a) {
		if (typeof a != 'bigint')
			this.#throwError('Input should be of type bigint', 'bigint', typeof a);
		const key = SEC.#g ** a % SEC.#p;
		return key;
	}

	static #generateFullKey(a, b) {
		if (typeof a != 'bigint')
			this.#throwError('Input should be of type bigint', 'bigint', typeof a);
		if (typeof a != 'bigint')
			this.#throwError('Input should be of type bigint', 'bigint', typeof b);
		const key = a ** b % SEC.#p;
		console.log(`a: ${a}, b: ${b}, key: ${key}`);
		return a ** b % SEC.#p;
	}

	static #randomNum(min, max) {
		return BigInt(Math.round(Math.random() * (max - min + 1) + min));
	}

	/**
	 * @param {string} subject  brief
	 * @param {string} expected expected value (optional)
	 * @param {string} received real value (optional)
	 */
	#throwError(subject, expected, received) {
		let errMsg = `Client name: ${this.#name}`;
		if (errMsg) errMsg += `\n${subject}`;
		if (expected && received) errMsg += `\nexpect: ${expected}\nreceived: ${received}`;
		throw Error(errMsg);
	}
}
Object.freeze(SEC);
Object.freeze(SEC.prototype);
