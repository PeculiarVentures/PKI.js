import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

export interface JsonRSAPublicKey {
	n: string;
	e: string;
}

export interface RSAPublicKeyParameters extends Schema.SchemaConstructor {
	modulus?: asn1js.Integer;
	publicExponent?: asn1js.Integer;
	json?: JsonRSAPublicKey;
}

const MODULUS = "modulus";
const PUBLIC_EXPONENT = "publicExponent";
const CLEAR_PROPS = [MODULUS, PUBLIC_EXPONENT];


/**
 * Class from RFC3447
 */
export class RSAPublicKey implements Schema.SchemaCompatible {

	/**
	 * Modulus part of RSA public key
	 */
	public modulus: asn1js.Integer;
	/**
	 * Public exponent of RSA public key
	 */
	public publicExponent: asn1js.Integer;

	/**
	 * Constructor for RSAPublicKey class
	 * @param parameters
	 */
	constructor(parameters: RSAPublicKeyParameters = {}) {
		//#region Internal properties of the object
		this.modulus = pvutils.getParametersValue(parameters, MODULUS, RSAPublicKey.defaultValues(MODULUS));
		this.publicExponent = pvutils.getParametersValue(parameters, PUBLIC_EXPONENT, RSAPublicKey.defaultValues(PUBLIC_EXPONENT));
		//#endregion

		//#region If input argument array contains "schema" for this object
		if (parameters.schema) {
			this.fromSchema(parameters.schema);
		}
		//#endregion
		//#region If input argument array contains "json" for this object
		if (parameters.json) {
			this.fromJSON(parameters.json);
		}
		//#endregion
	}

	/**
	 * Return default values for all class members
	 * @param memberName String name for a class member
	 */
	public static defaultValues(memberName: typeof MODULUS | typeof PUBLIC_EXPONENT): asn1js.Integer;
	public static defaultValues(memberName: string): any {
		switch (memberName) {
			case MODULUS:
				return new asn1js.Integer();
			case PUBLIC_EXPONENT:
				return new asn1js.Integer();
			default:
				throw new Error(`Invalid member name for RSAPublicKey class: ${memberName}`);
		}
	}

	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RSAPublicKey ::= Sequence {
	 *    modulus           Integer,  -- n
	 *    publicExponent    Integer   -- e
	 * }
	 * ```
	 *
	 * @param parameters Input parameters for the schema
	 * @returns asn1js schema object
	 */
	public static schema(parameters: Schema.SchemaParameters<{ modulus?: string; publicExponent?: string; }> = {}): Schema.SchemaType {
		const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.modulus || "") }),
				new asn1js.Integer({ name: (names.publicExponent || "") })
			]
		}));
	}

	/**
	 * Convert parsed asn1js object into current class
	 * @param schema
	 */
	public fromSchema(schema: Schema.SchemaNames): void {
		//#region Clear input data first
		pvutils.clearProps(schema, CLEAR_PROPS);
		//#endregion

		//#region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			RSAPublicKey.schema({
				names: {
					modulus: MODULUS,
					publicExponent: PUBLIC_EXPONENT
				}
			})
		);

		if (!asn1.verified) {
			throw new Error("Object's schema was not verified against input data for RSAPublicKey");
		}
		//#endregion

		//#region Get internal properties from parsed schema
		this.modulus = asn1.result.modulus.convertFromDER(256);
		this.publicExponent = asn1.result.publicExponent;
		//#endregion
	}

	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns asn1js object
	 */
	public toSchema(): asn1js.Sequence {
		//#region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				this.modulus.convertToDER(),
				this.publicExponent
			]
		}));
		//#endregion
	}

	/**
	 * Conversion for the class to JSON object
	 * @returns
	 */
	public toJSON(): JsonRSAPublicKey {
		return {
			n: pvutils.toBase64(pvutils.arrayBufferToString(this.modulus.valueBlock.valueHex), true, true, true),
			e: pvutils.toBase64(pvutils.arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true, true)
		};
	}

	/**
	 * Convert JSON value into current object
	 * @param json
	 */
	fromJSON(json: JsonRSAPublicKey): void {
		if ("n" in json) {
			const array = pvutils.stringToArrayBuffer(pvutils.fromBase64(json.n, true));
			this.modulus = new asn1js.Integer({ valueHex: array.slice(0, Math.pow(2, pvutils.nearestPowerOf2(array.byteLength))) });
		} else {
			throw new Error("Absent mandatory parameter \"n\"");
		}

		if ("e" in json) {
			this.publicExponent = new asn1js.Integer({ valueHex: pvutils.stringToArrayBuffer(pvutils.fromBase64(json.e, true)).slice(0, 3) });
		} else {
			throw new Error("Absent mandatory parameter \"e\"");
		}
	}

}

