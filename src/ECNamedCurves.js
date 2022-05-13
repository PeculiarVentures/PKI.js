
export default class ECNamedCurves {

	/**
	 * Registers an ECC named curve
	 * @param {string} name The name o the curve
	 * @param {string} id The curve ASN.1 object identifier
	 * @param {number} size The coordinate length in bytes
	 */
	static register(name, id, size) {
		this.namedCurves[name.toLowerCase()] = this.namedCurves[id] = { name, id, size };
	}

	/**
	* Returns an ECC named curve object
	* @param {string} nameOrId Name or identifier of the named curve
	* @returns {Object | null}
	*/
	static find(nameOrId) {
		return this.namedCurves[nameOrId.toLowerCase()] || null;
	}

}

ECNamedCurves.namedCurves = {};

// NIST
ECNamedCurves.register("P-256", "1.2.840.10045.3.1.7", 32);
ECNamedCurves.register("P-384", "1.3.132.0.34", 48);
ECNamedCurves.register("P-521", "1.3.132.0.35", 66);

// Brainpool
ECNamedCurves.register("brainpoolP256r1", "1.3.36.3.3.2.8.1.1.7", 32);
ECNamedCurves.register("brainpoolP384r1", "1.3.36.3.3.2.8.1.1.11", 48);
ECNamedCurves.register("brainpoolP512r1", "1.3.36.3.3.2.8.1.1.13", 64);
